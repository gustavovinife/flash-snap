# Implementation Plan: Stripe Subscriptions

## Overview

This plan implements Stripe subscription management for Flash Snap following a bottom-up approach: database schema first, then Edge Functions, then frontend integration. The implementation uses TypeScript throughout and follows existing patterns in the codebase.

All Supabase changes (migrations and Edge Functions) will be done via the Supabase CLI for version control and reproducibility.

## Tasks

- [x] 1. Initialize Supabase CLI project (skip if already set up)
  - [x] 1.1 Set up Supabase CLI in the project
    - Check if `supabase` folder exists, if not run `supabase init` in packages/desktop
    - Link to existing project with `supabase link --project-ref svufbwjdrbmiyvhimutm`
    - Verify connection with `supabase db remote commit`
    - _Requirements: Setup_

- [x] 2. Create database migration for subscriptions
  - [x] 2.1 Create subscriptions table migration
    - Run `supabase migration new create_subscriptions_table`
    - Add CREATE TABLE with all columns: id, user_id, stripe_customer_id, stripe_subscription_id, status, price_id, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at
    - Add CHECK constraint for status values ('free', 'active', 'canceled', 'past_due')
    - Add UNIQUE constraint on user_id
    - Add indexes on user_id and stripe_customer_id
    - Add RLS policies (users read own, service role manages all)
    - Add trigger for automatic subscription creation on user signup
    - Add trigger for updated_at timestamp
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 Apply migration to remote database
    - Run `supabase db push` to apply migration
    - Verify table created in Supabase dashboard
    - _Requirements: 1.1_

- [x] 3. Checkpoint - Verify database setup
  - Test by creating a new user and verifying subscription record is created
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create Stripe webhook Edge Function
  - [x] 4.1 Create stripe-webhook Edge Function scaffold
    - Run `supabase functions new stripe-webhook`
    - Set up CORS headers and request handling
    - Add Stripe signature verification
    - _Requirements: 2.5_
  - [x] 4.2 Implement checkout.session.completed handler
    - Extract user_id from session metadata
    - Update subscription with stripe_customer_id, stripe_subscription_id, status='active'
    - _Requirements: 2.1_
  - [x] 4.3 Implement customer.subscription.updated handler
    - Update status, current_period_start, current_period_end, cancel_at_period_end
    - Map Stripe status to app status
    - _Requirements: 2.2_
  - [x] 4.4 Implement customer.subscription.deleted handler
    - Update subscription status to 'canceled'
    - _Requirements: 2.3_
  - [x] 4.5 Implement invoice.payment_failed handler
    - Update subscription status to 'past_due'
    - _Requirements: 2.4_

- [x] 5. Create checkout session Edge Function
  - [x] 5.1 Create create-checkout-session Edge Function
    - Run `supabase functions new create-checkout-session`
    - Accept priceId, userId, userEmail in request body
    - Create Stripe Checkout Session with user metadata
    - Return checkout URL
    - _Requirements: 3.1, 3.2_

- [x] 6. Create portal session Edge Function
  - [x] 6.1 Create create-portal-session Edge Function
    - Run `supabase functions new create-portal-session`
    - Accept customerId in request body
    - Create Stripe Customer Portal session
    - Return portal URL
    - _Requirements: 4.1, 4.2_

- [x] 7. Deploy Edge Functions and configure Stripe
  - [x] 7.1 Set Supabase secrets for Stripe
    - Run `supabase secrets set STRIPE_SECRET_KEY=sk_...`
    - Run `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
    - _Requirements: Configuration_
  - [x] 7.2 Deploy Edge Functions
    - Run `supabase functions deploy stripe-webhook`
    - Run `supabase functions deploy create-checkout-session`
    - Run `supabase functions deploy create-portal-session`
    - _Requirements: Configuration_
  - [x] 7.3 Configure Stripe webhook endpoint
    - Add webhook endpoint in Stripe Dashboard pointing to Edge Function URL
    - Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 8. Checkpoint - Test Edge Functions
  - Test webhook with Stripe CLI: `stripe listen --forward-to <edge-function-url>`
  - Test checkout session creation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Add Subscription types to frontend
  - [x] 9.1 Add Subscription interface to types
    - Add SubscriptionStatus type
    - Add Subscription interface
    - Update `src/renderer/src/types/index.ts`
    - _Requirements: 1.1_

- [x] 10. Create subscription service
  - [x] 10.1 Create subscriptionService.ts
    - Create `src/renderer/src/services/subscriptionService.ts`
    - Implement getSubscription(userId) function
    - Implement createCheckoutSession(priceId) function
    - Implement createPortalSession(customerId) function
    - _Requirements: 3.1, 4.1, 5.1_

- [x] 11. Create useSubscription hook
  - [x] 11.1 Create useSubscription.ts hook
    - Create `src/renderer/src/hooks/useSubscription.ts`
    - Use React Query for subscription data fetching
    - Implement isPremium computed property
    - Implement canCreateDeck helper (free users limited to 1 deck)
    - Implement openCheckout and openPortal functions
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 12. Create SubscriptionStatus UI component
  - [x] 12.1 Create SubscriptionStatus component
    - Create `src/renderer/src/components/SubscriptionStatus.tsx`
    - Display current subscription status (Free/Premium as-is)
    - Show renewal date for active subscriptions
    - Show cancellation notice when cancel_at_period_end is true
    - Show upgrade button for free users
    - Show manage subscription button for paid users
    - Use i18n for button labels and messages
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13. Add i18n translations for subscription UI
  - [x] 13.1 Add subscription translations to locale files
    - Add button labels (Upgrade, Manage Subscription)
    - Add renewal/cancellation messages
    - Keep "Free" and "Premium" as-is (universally understood)
    - Update both en-US and pt-BR locales
    - _Requirements: 6.1_

- [x] 14. Integrate subscription UI into Settings page
  - [x] 14.1 Update SettingsPage to include SubscriptionStatus
    - Import and use useSubscription hook
    - Add SubscriptionStatus component to settings page
    - Wire up upgrade and manage callbacks
    - _Requirements: 6.1, 6.2_

- [x] 15. Add deck creation limit for free users
  - [x] 15.1 Update deck creation to check subscription
    - Modify useDecks or DeckList component
    - Check canCreateDeck before allowing new deck creation
    - Show upgrade prompt when limit reached
    - _Requirements: Free tier limitation_

- [x] 16. Update environment configuration
  - [x] 16.1 Add Stripe environment variables
    - Update `.env.example` with VITE_STRIPE_PRICE_ID
    - Add actual price ID to `.env`
    - _Requirements: Configuration_

- [x] 17. Final checkpoint - End-to-end testing
  - Test complete checkout flow in Stripe test mode
  - Test portal access for subscription management
  - Test webhook processing for all event types
  - Verify UI updates correctly after subscription changes
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Supabase CLI commands should be run from `packages/desktop` directory
- Edge Functions use Deno runtime - follow existing TTS function pattern
- All UI text must use i18n translations (en-US and pt-BR) except "Free" and "Premium"
- Use React Query for subscription data with 5-minute stale time (matching existing hooks)
- Free users are limited to 1 deck (client-side enforcement)
- Stripe Price ID: `price_1SsUhmE13c2k8XKrUecLh4J7`
- Supabase needs npx command to run
