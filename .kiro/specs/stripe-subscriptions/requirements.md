# Requirements Document

## Introduction

This document defines the requirements for integrating Stripe subscription management into Flash Snap, an Electron desktop application for spaced repetition learning. The integration will enable a freemium business model where users can access basic features for free and unlock premium features through a paid subscription.

## Glossary

- **Subscription_Service**: The backend service responsible for managing subscription state, communicating with Stripe, and enforcing feature access
- **Stripe_Webhook_Handler**: A Supabase Edge Function that receives and processes webhook events from Stripe
- **Customer_Portal**: Stripe's hosted page where users can manage their subscription, update payment methods, and view billing history
- **Subscription_Status**: The current state of a user's subscription (free, active, canceled, past_due, expired)
- **User**: An authenticated Flash Snap user identified by their Supabase user_id

## Requirements

### Requirement 1: Subscription Data Storage

**User Story:** As a system administrator, I want subscription data stored in Supabase linked to user accounts, so that the application can quickly determine feature access without external API calls.

#### Acceptance Criteria

1. THE Subscription_Service SHALL store subscription records in a `subscriptions` table with columns: id, user_id, stripe_customer_id, stripe_subscription_id, status, price_id, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at
2. WHEN a user is created, THE Subscription_Service SHALL create a corresponding subscription record with status 'free'
3. THE Subscription_Service SHALL enforce a one-to-one relationship between users and subscription records
4. WHEN subscription data is updated, THE Subscription_Service SHALL update the updated_at timestamp

### Requirement 2: Stripe Webhook Processing

**User Story:** As a system administrator, I want Stripe webhook events processed reliably, so that subscription changes are reflected in the application immediately.

#### Acceptance Criteria

1. WHEN a `checkout.session.completed` event is received, THE Stripe_Webhook_Handler SHALL update the user's subscription status to 'active' and store the Stripe customer and subscription IDs
2. WHEN a `customer.subscription.updated` event is received, THE Stripe_Webhook_Handler SHALL update the subscription status, period dates, and cancel_at_period_end flag
3. WHEN a `customer.subscription.deleted` event is received, THE Stripe_Webhook_Handler SHALL update the subscription status to 'canceled'
4. WHEN an `invoice.payment_failed` event is received, THE Stripe_Webhook_Handler SHALL update the subscription status to 'past_due'
5. IF a webhook event has an invalid signature, THEN THE Stripe_Webhook_Handler SHALL reject the request with a 400 status code
6. THE Stripe_Webhook_Handler SHALL process webhook events idempotently to handle duplicate deliveries

### Requirement 3: Checkout Session Creation

**User Story:** As a user, I want to start a subscription through a secure checkout flow, so that I can upgrade to premium features.

#### Acceptance Criteria

1. WHEN a user initiates checkout, THE Subscription_Service SHALL create a Stripe Checkout Session with the user's email and user_id as metadata
2. THE Subscription_Service SHALL redirect users to Stripe's hosted checkout page
3. WHEN checkout is successful, THE Subscription_Service SHALL redirect users back to the application with a success indicator
4. WHEN checkout is canceled, THE Subscription_Service SHALL redirect users back to the application without changes

### Requirement 4: Customer Portal Access

**User Story:** As a subscriber, I want to manage my subscription through a self-service portal, so that I can update payment methods, cancel, or reactivate my subscription.

#### Acceptance Criteria

1. WHEN a subscriber requests portal access, THE Subscription_Service SHALL create a Stripe Customer Portal session
2. THE Subscription_Service SHALL redirect subscribers to the Customer Portal
3. WHEN portal actions are completed, THE Subscription_Service SHALL redirect users back to the application

### Requirement 5: Subscription Status Checking

**User Story:** As a user, I want the application to know my subscription status, so that I can access features appropriate to my plan.

#### Acceptance Criteria

1. WHEN the application loads, THE Subscription_Service SHALL fetch the current user's subscription status from Supabase
2. THE Subscription_Service SHALL provide a hook for components to access subscription status
3. THE Subscription_Service SHALL cache subscription status to minimize database queries
4. WHEN subscription status changes, THE Subscription_Service SHALL invalidate the cache and refetch

### Requirement 6: Subscription UI Components

**User Story:** As a user, I want to see my subscription status and easily access the Stripe portal, so that I understand my current plan and can manage it when needed.

#### Acceptance Criteria

1. THE Subscription_Service SHALL display the current subscription status in the settings page
2. THE Subscription_Service SHALL display a "Manage Subscription" button that opens the Stripe Customer Portal in the user's browser
3. WHEN a user has an active subscription, THE Subscription_Service SHALL display the subscription renewal date
4. WHEN a subscription is set to cancel at period end, THE Subscription_Service SHALL display a cancellation notice with the end date
5. WHEN a user is on the free plan, THE Subscription_Service SHALL display an "Upgrade" button that initiates the checkout flow
