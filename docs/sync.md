# Flash Snap Cloud Sync Implementation

## Status

Proposed

## Context

Flash Snap currently stores user data (decks and cards) in localStorage, which works well for single-user scenarios. However, with the recent implementation of Supabase authentication, we face a new challenge: when a different user logs in on the same device, they would see cards from previous users because localStorage is device-specific rather than user-specific.

This document outlines a strategy for implementing cloud synchronization with Supabase to ensure:

1. User data is properly isolated between different accounts
2. Data can be synchronized across multiple devices for the same user
3. Conflicts are handled efficiently and transparently

## Architecture Overview

### Data Models

The existing models will be extended with fields to support synchronization:

```typescript
// Database models
interface DbDeck {
  id: string
  user_id: string // Added to link deck to specific user
  name: string
  type: 'language' | 'knowledge'
  created_at: Date
  last_reviewed: Date | null
  updated_at: Date // For sync conflict resolution
}

interface DbCard {
  id: string
  deck_id: string // References parent deck
  front: string
  back: string
  context: string | null
  due_date: Date | null
  interval: number | null
  ease_factor: number | null
  repetition: number | null
  next_review: Date | null
  updated_at: Date // For sync conflict resolution
}
```

### Sync Service

The sync service will be responsible for coordinating data flow between localStorage and Supabase.

```typescript
interface SyncService {
  initialize(): Promise<void> // Called on login
  syncToCloud(): Promise<void> // Push local changes to Supabase
  syncFromCloud(): Promise<void> // Pull remote changes to localStorage
  handleLogout(): void // Clear localStorage
}
```

## Implementation Approach

### 1. Login/Logout Flow

On user login:

1. Clear localStorage to remove any previous user's data
2. Initialize sync service with user credentials
3. Fetch all user data from Supabase and populate localStorage

On user logout:

1. Ensure any pending changes are synced to the cloud
2. Clear localStorage completely

### 2. Optimized Sync Algorithm (O(n))

For efficient synchronization, we'll use map-based merging with timestamps:

```typescript
async function syncFromCloud() {
  // Get all decks from Supabase (RLS automatically filters to user's decks)
  const { data: remoteDecks } = await supabase.from('decks').select('*')

  // Get local decks
  const localDecks = JSON.parse(localStorage.getItem('decks') || '[]')

  // Create hash maps for O(1) lookups
  const localDecksMap = Object.fromEntries(localDecks.map((deck) => [deck.id, deck]))
  const remoteDecksMap = Object.fromEntries(remoteDecks.map((deck) => [deck.id, deck]))

  // Create a merged map with newer versions taking precedence
  const mergedDecksMap = { ...localDecksMap }

  // Process all remote decks in O(n) time
  for (const [id, remoteDeck] of Object.entries(remoteDecksMap)) {
    // If remote doesn't exist locally or is newer, use remote
    if (
      !mergedDecksMap[id] ||
      new Date(remoteDeck.updated_at) > new Date(mergedDecksMap[id].updated_at)
    ) {
      mergedDecksMap[id] = remoteDeck
    }
  }

  // Save merged collection to localStorage
  localStorage.setItem('decks', JSON.stringify(Object.values(mergedDecksMap)))
}
```

### 3. Handling Large Dataset Syncing

For large card collections, we'll implement:

1. **Chunked Syncing**: Process cards by deck to reduce memory pressure:

```typescript
async function syncCardsByDeck(deckIds) {
  for (const deckId of deckIds) {
    const { data: remoteCards } = await supabase.from('cards').select('*').eq('deck_id', deckId)

    // Process this chunk...
  }
}
```

2. **Incremental Syncing**: Only sync cards that have changed since last sync:

```typescript
async function incrementalCardSync() {
  const lastSync = localStorage.getItem('last_sync_timestamp') || '1970-01-01T00:00:00Z'

  const { data: updatedCards } = await supabase.from('cards').select('*').gt('updated_at', lastSync)

  // Merge only the updated cards...

  // Update sync timestamp
  localStorage.setItem('last_sync_timestamp', new Date().toISOString())
}
```

### 4. Row-Level Security

Supabase tables will use row-level security (RLS) policies to ensure users can only access their own data:

```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cards (
  id UUID PRIMARY KEY,
  deck_id UUID REFERENCES decks NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  context TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  interval INTEGER,
  ease_factor FLOAT,
  repetition INTEGER,
  next_review TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row-level security policies
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY deck_access ON decks FOR ALL USING (auth.uid() = user_id);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY card_access ON cards FOR ALL USING (
  deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
);
```

### 5. Triggering Sync Operations

Sync operations will be triggered at these key moments:

1. On login/logout
2. Periodically in the background (every 5 minutes)
3. After critical data changes (adding/updating/deleting cards or decks)
4. Before application close
5. When network connectivity is restored after being offline

## Benefits and Tradeoffs

### Benefits:

1. Simplified conflict resolution using timestamps
2. O(n) time complexity for efficient processing
3. Works seamlessly with RLS for data security
4. Supports incremental syncing for large datasets
5. Completely transparent to users (no conflict resolution UI needed)

### Tradeoffs:

1. Last-write-wins approach may occasionally cause data loss in rare edge cases
2. Requires timestamp management discipline
3. Initial sync may be slower for users with large collections

## Implementation Plan

1. Create database schema and RLS policies in Supabase
2. Implement core sync service in the application
3. Modify existing storage service to work with sync service
4. Update login/logout flow to handle data transitions
5. Add background sync mechanisms
6. Test with various edge cases and network conditions

## Future Considerations

1. Add conflict resolution UI for critical conflicts
2. Implement sync status indicators in the UI
3. Add detailed sync logs for troubleshooting
4. Support selective data export/import
5. Implement offline queue management for robust sync

## Conclusion

This approach provides a clean, efficient solution for cloud synchronization while maintaining the simplicity of the current architecture. The timestamp-based conflict resolution strategy balances performance with data integrity in a way that should be transparent to users.
