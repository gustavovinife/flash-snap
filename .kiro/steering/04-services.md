---
inclusion: always
---
# Application Services

Flash Snap implements a service-oriented architecture with specialized services for different functionality:

## Core Services
- **[reviewService](mdc:src/renderer/src/services/reviewService.ts)**: Implements the SM-2 spaced repetition algorithm for scheduling card reviews
- **[clipboardService](mdc:src/renderer/src/services/clipboardService.ts)**: Manages clipboard interactions for card creation from selected text
- **[storageService](mdc:src/renderer/src/services/storageService.ts)**: Provides functions for both Supabase operations and localStorage settings
- **[supabaseService](mdc:src/renderer/src/services/supabaseService.ts)**: Initializes and manages Supabase client connection

## Data Access Hooks
- **[useDecks](mdc:src/renderer/src/hooks/useDecks.ts)**: React Query hook for decks CRUD operations
  - Auto-refreshes data every 5 minutes (staleTime)
  - Provides optimistic UI updates
  - Handles Supabase interaction details
- **[useCards](mdc:src/renderer/src/hooks/useCards.ts)**: React Query hook for cards management
  - Direct card operations (create, update, delete)
  - Automatic cache invalidation
  - Optimistic UI updates

## Integration Services
- **External APIs**: Integration with Supabase Edge Functions for:
  - Google Translate API for translations
  - Google Text-to-Speech for pronunciation

## Database Implementation
- **Supabase**: Used for storing cards and decks
  - Direct Supabase functions for service files: `getDecksFromSupabase()`, `updateCardInSupabase()`
  - React Query hooks for components: `useDecks()` provides CRUD operations with proper caching
- **localStorage**: Used only for application settings

## Future Services (Planned)
- **notificationService**: For managing review reminders
- **settingsService**: For handling user preferences and configuration
- **offlineService**: For managing offline mode with local caching

Services are located in the [src/renderer/src/services](mdc:src/renderer/src/services) directory and follow a consistent interface pattern.


