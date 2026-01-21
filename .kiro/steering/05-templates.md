---
inclusion: always
---
# Pre-built Templates

Flash Snap includes pre-built card templates to help users get started quickly. This feature reduces friction for new users and accelerates their first "aha moment" in the app.

## Template Categories
The initial release includes approximately 12 templates with 500+ cards covering:
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

## Implementation
- Templates are stored as JSON files in [src/renderer/src/data/templates](mdc:src/renderer/src/data/templates)
- Each template follows the Deck structure with pre-populated cards
- The Templates Page lists all available templates for one-click installation

## Onboarding Flow
First-time users are prompted:
> "Would you like to start with pre-built cards?"

If they opt in, selected decks are immediately imported into their account.

## Future Extensions
- Community-shared templates
- Server-side template repository
- Template versioning and updates


