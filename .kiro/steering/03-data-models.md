---
inclusion: always
---
# Core Data Models

Flash Snap is built around two primary data models:

## Card
```typescript
interface Card {
  id: string
  front: string
  back: string
  context?: string
  due_date?: Date
  interval?: number
  ease_factor?: number
  repetition?: number
  next_review?: Date
  created_at?: Date
  deck_id?: string
}
```

The Card model represents an individual flashcard with:
- `front` & `back`: The primary content on each side of the card
- `context`: Optional additional context information
- Spaced repetition metadata: `interval`, `ease_factor`, `repetition`, etc.
- Database information: `created_at`, `deck_id` for relationships

## Deck
```typescript
interface Deck {
  id: string
  name: string
  cards: Card[]
  created_at: Date
  last_reviewed?: Date
  type: 'language' | 'knowledge'
}
```

The Deck model represents a collection of related cards with:
- `name`: The deck's title
- `cards`: Array of contained Card objects
- `type`: Categorization of the deck ('language' or 'knowledge')
- Timestamp metadata for creation and review

These models are defined in [src/renderer/src/types/index.ts](mdc:src/renderer/src/types/index.ts) and are central to the application's storage and business logic.


