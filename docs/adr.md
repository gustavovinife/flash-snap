# ADR 001 — Pre-built Templates and Initial Architecture Overview

## Status

Accepted

## Context

Flash Snap is an Electron (Vite 3.1.0) desktop application designed to simplify spaced repetition learning. Initially, user data (cards and decks) are stored in `localStorage`, with plans to implement server-side synchronization using PostgreSQL in future releases.

The core UX principle is frictionless card creation. Users can add cards by selecting any text and pressing a global shortcut (`Ctrl + Shift + X`). This shortcut is currently fixed but will be made customizable through a future **Settings Page** — where users can also manage their preferred language (i18n) and review notification time ("Time to Review").

The application UI is built with TailwindCSS, leveraging a `/ui` folder containing reusable components (e.g., Input, Select, Button). New reusable components are added progressively as the product evolves.

For updating and publishing, we use `update-electron-app`, publishing releases directly on GitHub: [gustavowebjs/flash-snap](https://github.com/gustavowebjs/flash-snap).

We have structured services located under `/services`, such as:

- `reviewService` (SM-2 spaced repetition algorithm),
- `clipboardService` (manages clipboard commands),
- `storageService` (localStorage getters/setters for cards and decks).

Additionally, we use **Supabase Edge Functions** for integrations like Google Translate and Google TTS (Text-to-Speech).

The basic data models used are:

```typescript
export interface Card {
  id: string
  front: string
  back: string
  context?: string
  dueDate?: Date
  interval?: number
  easeFactor?: number
  repetition?: number
  nextReview?: Date
}

export interface Deck {
  id: string
  name: string
  cards: Card[]
  createdAt: Date
  lastReviewed?: Date
  type: 'language' | 'knowledge'
}
```

## Decision

We decided to include a **Pre-built Templates** feature to reduce friction for new users and accelerate their first "aha moment" inside the app.

- Templates will be stored under `/data/templates`.
- A Templates Page lists all available templates for users to install into their deck collection with one click.
- The initial release will include around **12 templates**, totaling **500+ cards**, covering categories such as:
  - Beginner Words
  - Small Talk
  - Travel English
  - Business English
  - Advanced Vocabulary
  - TOEFL Vocabulary
  - Phrasal Verbs
  - Idioms and Expressions
  - Grammar Quick Tips
  - Daily Routine Words
  - Food & Restaurants
  - Emergency English

Templates are simple Deck JSON files and can be extended later to support templates shared by the community.

Upon first launch, users will be prompted:

> "Would you like to start with pre-built cards?"

If they opt in, selected decks will be imported into their account immediately.

## Consequences

**Positive:**

- Dramatically lowers onboarding friction.
- Increases user engagement from first session (Day 1 and Day 7 retention).
- Makes the app feel mature and immediately useful.
- Establishes groundwork for future community-driven content.

**Negative:**

- Initial effort required to create and curate high-quality templates.
- Slight increase in application bundle size if templates are embedded rather than fetched.
- Need to maintain versioning and updates for templates over time.

## Future Considerations

- Migrate localStorage to a full user account system backed by PostgreSQL once sync infrastructure is ready.
- Allow template downloading from a server rather than bundling, reducing initial app size.
- Implement customizable global shortcut settings on the Settings Page.
- Expand the reusable component library under `/ui` for better developer velocity and consistency.
- Create a community-driven template marketplace or sharing platform.
