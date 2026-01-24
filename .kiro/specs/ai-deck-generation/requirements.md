# Requirements Document

## Introduction

This document specifies the requirements for an AI-powered deck/card generation feature in Flash Snap. The feature enables users to generate flashcard decks using AI prompts, streamlining the card creation process. Users can select from preset prompts or enter custom topics, preview generated cards, and save them to Supabase.

## Glossary

- **AI_Generation_Service**: The service responsible for communicating with OpenAI API to generate flashcard content
- **Card_Preview**: A temporary representation of generated cards before they are saved to the database
- **Preset_Prompt**: A pre-defined prompt pill that users can click to quickly generate cards for common topics
- **Generation_Page**: The dedicated page where users interact with the AI generation feature
- **Bulk_Insert**: The operation of inserting multiple cards into Supabase in a single transaction

## Requirements

### Requirement 1: AI Generation Entry Point

**User Story:** As a user, I want to easily access the AI card generation feature from the home page, so that I can quickly create flashcard decks using AI.

#### Acceptance Criteria

1. WHEN the home page loads, THE System SHALL display a prominent "Create With AI" card alongside existing deck management options
2. WHEN a user clicks the "Create With AI" card, THE System SHALL navigate to the AI generation page
3. THE "Create With AI" card SHALL have a visually distinct design (gradient/shiny effect) to draw user attention

### Requirement 2: Preset Prompt Selection

**User Story:** As a user, I want to select from preset prompts, so that I can quickly generate cards for common learning topics without typing.

#### Acceptance Criteria

1. WHEN the AI generation page loads, THE System SHALL display preset prompt pills for common topics (e.g., "Learn Javascript Programming", "Learn English for travel", "Learn English for interviews")
2. WHEN a user clicks a preset prompt pill, THE System SHALL populate the input field with the selected prompt
3. THE System SHALL display at least 5 preset prompt options covering language and knowledge categories

### Requirement 3: Custom Prompt Input

**User Story:** As a user, I want to enter custom prompts, so that I can generate cards for any topic I choose.

#### Acceptance Criteria

1. THE Generation_Page SHALL display a text input field for custom prompts
2. WHEN a user types in the custom input field, THE System SHALL enable the generate button once the input has at least 3 characters
3. WHEN a user submits an empty or whitespace-only prompt, THE System SHALL prevent generation and display a validation message

### Requirement 4: AI Card Generation

**User Story:** As a user, I want the AI to generate flashcards based on my prompt, so that I can quickly create learning content.

#### Acceptance Criteria

1. WHEN a user submits a valid prompt, THE AI_Generation_Service SHALL call the OpenAI API with GPT-4o-mini model
2. WHEN generating cards, THE System SHALL display a loading indicator
3. THE AI_Generation_Service SHALL generate cards with front (question/term) and back (answer/definition) content
4. THE AI_Generation_Service SHALL generate a suggested deck name based on the topic
5. THE AI_Generation_Service SHALL determine the deck type (language or knowledge) based on the topic
6. THE System SHALL enforce a maximum limit of 50 cards per generation request
7. IF the user requests more than 50 cards in their prompt, THE System SHALL still generate only 50 cards maximum
8. IF the OpenAI API returns an error, THEN THE System SHALL display a user-friendly error message and allow retry

### Requirement 5: Card Preview Display

**User Story:** As a user, I want to preview generated cards before saving, so that I can review the content quality.

#### Acceptance Criteria

1. WHEN cards are successfully generated, THE System SHALL display them in a scrollable container
2. WHEN displaying card previews, THE System SHALL show the front and back content for each card
3. THE System SHALL display the total count of generated cards
4. WHEN no cards have been generated yet, THE System SHALL display an empty state with instructions

### Requirement 6: Deck Saving

**User Story:** As a user, I want to save generated cards as a new deck, so that I can use them for spaced repetition learning.

#### Acceptance Criteria

1. WHEN cards are displayed in preview, THE System SHALL show the AI-generated deck name and a "Save Deck" button
2. THE System SHALL allow the user to edit the AI-generated deck name before saving
3. WHEN a user clicks "Save Deck", THE System SHALL create a new deck with the specified name and bulk insert all cards to Supabase
4. WHEN saving is in progress, THE System SHALL display a loading state and disable the save button
5. WHEN saving completes successfully, THE System SHALL navigate to the newly created deck view
6. IF saving fails, THEN THE System SHALL display an error message and allow retry

### Requirement 7: API Key Configuration

**User Story:** As a developer, I want the OpenAI API key to be configurable via environment variables, so that the key is not hardcoded in the application.

#### Acceptance Criteria

1. THE System SHALL read the OpenAI API key from the VITE_OPENAI_API_KEY environment variable
2. IF the API key is not configured, THEN THE System SHALL display a configuration error message on the AI generation page
3. THE System SHALL NOT expose the API key in client-side code or logs

### Requirement 8: Internationalization

**User Story:** As a user, I want all AI generation UI text to be translated, so that I can use the feature in my preferred language.

#### Acceptance Criteria

1. THE System SHALL use translation keys for all user-facing text in the AI generation feature
2. THE System SHALL add translation keys to both en-US and pt-BR locale files
3. WHEN the user changes language, THE AI generation page SHALL update all text accordingly
