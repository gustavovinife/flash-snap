# Implementation Plan: AI Deck Generation

## Overview

This implementation plan breaks down the AI-powered deck generation feature into discrete coding tasks. The feature enables users to generate flashcard decks using AI prompts with OpenAI's GPT-4o-mini model.

## Tasks

- [x] 1. Set up environment and dependencies
  - [x] 1.1 Add OpenAI SDK dependency to package.json
    - Install `openai` package in packages/desktop
    - _Requirements: 4.1, 7.1_
  - [x] 1.2 Update .env.example with VITE_OPENAI_API_KEY
    - Add the new environment variable placeholder
    - _Requirements: 7.1_

- [x] 2. Create AI Generation Service
  - [x] 2.1 Create aiGenerationService.ts with core functions
    - Implement `generateDeck(prompt: string)` function
    - Implement `isConfigured()` function to check API key
    - Configure OpenAI client with gpt-4o-mini model
    - Create system prompt for flashcard generation with JSON output
    - Enforce 50 card maximum in the prompt
    - Parse response to extract deckName, deckType, and cards
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  - [x] 2.2 Write property test for card structure validation
    - **Property 3: Generated Card Structure**
    - **Validates: Requirements 4.3**
  - [x] 2.3 Write property test for deck metadata validation
    - **Property 4: Generated Deck Metadata**
    - **Validates: Requirements 4.4, 4.5**
  - [x] 2.4 Write property test for maximum card limit
    - **Property 5: Maximum Card Limit**
    - **Validates: Requirements 4.6, 4.7**

- [x] 3. Checkpoint - Verify AI service works
  - Ensure service compiles and basic tests pass, ask the user if questions arise.

- [x] 4. Add i18n translations
  - [x] 4.1 Add AI generation translations to en-US.ts
    - Add aiGeneration namespace with all UI text
    - Include preset prompt labels, buttons, errors, empty states
    - _Requirements: 8.1, 8.2_
  - [x] 4.2 Add AI generation translations to pt-BR.ts
    - Add matching translations for all keys
    - _Requirements: 8.2_

- [x] 5. Create UI Components
  - [x] 5.1 Create CreateWithAICard component
    - Implement visually distinct card with gradient/shiny effect
    - Add onClick handler for navigation
    - Use i18n for all text
    - _Requirements: 1.1, 1.2, 1.3, 8.1_
  - [x] 5.2 Create PromptPills component
    - Display preset prompt options as clickable pills
    - Implement onSelect callback to populate input
    - Include at least 5 presets (language and knowledge categories)
    - Use i18n for preset labels
    - _Requirements: 2.1, 2.2, 2.3, 8.1_
  - [x] 5.3 Create CardPreviewList component
    - Implement scrollable container for card previews
    - Display front and back content for each card
    - Show card count
    - Handle empty state with instructions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.1_
  - [ ]\* 5.4 Write property test for card preview completeness
    - **Property 6: Card Preview Completeness**
    - **Validates: Requirements 5.2**
  - [ ]\* 5.5 Write property test for card count accuracy
    - **Property 7: Card Count Accuracy**
    - **Validates: Requirements 5.3**

- [x] 6. Create AIGeneratePage
  - [x] 6.1 Implement AIGeneratePage component
    - Add prompt input field with validation (min 3 chars)
    - Integrate PromptPills component
    - Add generate button with loading state
    - Display API key missing error if not configured
    - Handle generation errors with retry option
    - Integrate CardPreviewList for results
    - Show AI-generated deck name (editable)
    - Add Save Deck button when cards exist
    - Implement save flow with loading state
    - Navigate to deck view on successful save
    - Use i18n for all text
    - _Requirements: 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.2, 4.8, 5.1, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.2, 8.1_
  - [x] 6.2 Write property test for generate button enablement
    - **Property 1: Generate Button Enablement**
    - **Validates: Requirements 3.2**
  - [ ]\* 6.3 Write property test for whitespace input rejection
    - **Property 2: Whitespace Input Rejection**
    - **Validates: Requirements 3.3**
  - [x] 6.4 Write property test for bulk insert completeness
    - **Property 8: Bulk Insert Completeness**
    - **Validates: Requirements 6.3**

- [x] 7. Checkpoint - Verify page renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Integrate with existing app
  - [x] 8.1 Add route for AI generation page
    - Add `/ai-generate` route to routes.tsx
    - Wrap with ProtectedRoute
    - _Requirements: 1.2_
  - [x] 8.2 Add CreateWithAICard to DeckList component
    - Position prominently on home page
    - Wire up navigation to /ai-generate
    - _Requirements: 1.1, 1.2_

- [x] 9. Final checkpoint - End-to-end verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All UI text must use translation keys (t() function)
