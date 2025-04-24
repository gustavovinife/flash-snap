const enUS = {
  // Layout component
  layout: {
    appName: 'Flash Snap',
    appDescription: 'A lightweight, passive memorization tool',
    settings: 'Settings',
    copyright: '© 2025 FlashSnap by -'
  },

  // Common terms
  common: {
    back: 'Back',
    backTo: 'Back to {{destination}}',
    deck: 'Deck',
    decks: 'Decks',
    add: 'Add',
    cards: 'cards',
    card: 'card',
    cancel: 'Cancel',
    create: 'Create',
    loading: 'Loading...',
    notFound: '{{item}} not found',
    days: 'days',
    review: 'Review',
    lastReviewed: 'Last reviewed: {{date}}',
    neverReviewed: 'Never reviewed',
    deleteConfirm: 'Are you sure you want to delete this {{item}}?',
    optional: 'Optional'
  },

  // DeckList component
  deckList: {
    title: 'Your Decks',
    startReview: 'Start Review',
    cardsDue: '({{count}} cards due)',
    deckCount: '{{count}} {{deck}}',
    noDeck: 'No decks yet',
    createFirstDeck: 'Create your first deck',
    addDeck: 'Add Deck',
    deckType: 'Deck Type',
    language: 'Language',
    knowledge: 'Knowledge',
    deckName: 'Deck name',
    deleteDeck: 'Delete deck'
  },

  // DeckView component
  deckView: {
    backToDecks: 'Back to Decks',
    cardCount: '{{count}} {{card}}',
    searchCards: 'Search cards...',
    addCard: 'Add Card',
    reports: 'Reports',
    front: 'Front',
    back: 'Back',
    translation: 'Translation (Portuguese)',
    enterWord: 'Enter the word or phrase',
    enterDefinition: 'Enter the definition or meaning',
    enterTranslation: 'Enter the Portuguese translation',
    noCardsMatch: 'No cards match your search',
    noCardsYet: 'No cards in this deck yet',
    addFirstCard: 'Add your first card',
    deleteCard: 'Delete card',
    playPronunciation: 'Play pronunciation',
    definition: 'Definition',
    portugueseTranslation: 'Portuguese Translation',
    pronunciation: 'Pronunciation',
    context: 'Context',
    enterContext: 'Enter the context of the card (optional)'
  },

  // AddCard component
  addCard: {
    title: 'Add to Flashcards',
    selectDeck: 'Select Deck',
    noDecksAvailable: 'No decks available',
    front: 'Front',
    back: 'Back',
    translation: 'Translation (Optional)',
    termPlaceholder: 'Term or question',
    definitionPlaceholder: 'Definition or answer',
    translationPlaceholder: 'Portuguese translation',
    addCard: 'Add Card',
    contextPlaceholder: 'Enter the context of the card (optional)',
    context: 'Context'
  },

  // Review page
  review: {
    reviewMode: 'Review Mode',
    reviewComplete: 'Review Complete!',
    noCardsDue: 'No cards due for review!',
    cardStatistics: 'Card Statistics',
    repetitions: 'Repetitions',
    interval: 'Interval',
    easeFactor: 'Ease Factor',
    nextReview: 'Next Review',
    notScheduled: 'Not scheduled',
    cardsReviewed: "You've reviewed {{count}} cards.",
    checkMoreCards: 'Check for More Cards',
    returnToDeck: 'Return to Deck',
    cardCount: '{{current}} of {{total}}',
    deckName: 'Deck: {{name}}',
    front: 'Front',
    back: 'Back',
    showStats: 'Show Stats',
    hideStats: 'Hide Stats',
    howWellRemembered: 'How well did you remember this card?',
    grade1: '1 - Failed',
    grade2: '2 - Hard',
    grade3: '3 - Good',
    grade4: '4 - Easy',
    grade5: '5 - Perfect',
    showAnswer: 'Show Answer',
    context: 'Context'
  },

  // Reports page
  reports: {
    title: '{{deckName}} - Reports',
    stats: {
      averageEaseFactor: 'Average Ease Factor',
      retentionRate: 'Retention Rate',
      avgReviewInterval: 'Avg. Review Interval',
      cardStatusOverview: 'Card Status Overview',
      newCards: 'New Cards',
      learningCards: 'Learning Cards',
      reviewCards: 'Review Cards',
      masteredCards: 'Mastered Cards',
      dueCards: 'Due Cards',
      cardsDueNext7Days: 'cards due in the next 7 days',
      startReview: 'Start Review',
      easeFactorDistribution: 'Ease Factor Distribution',
      cardDifficulty: 'Card Difficulty',
      easyCards: 'Easy Cards',
      mediumCards: 'Medium Cards',
      hardCards: 'Hard Cards',
      ofTotal: 'of total',
      deckProgress: 'Deck Progress',
      masteredCardsMessage: "You've mastered {{mastered}} out of {{total}} cards in this deck.",
      masteredExplanation: 'Cards are considered mastered when their ease factor is above 2.5'
    }
  },

  // Settings page
  settings: {
    title: 'Settings',
    saveSuccess: 'Settings saved successfully!',
    saveButton: 'Save Settings',
    language: {
      label: 'Application Language',
      description: 'Select your preferred language for the application interface.'
    },
    reviewTime: {
      label: 'Daily Review Time',
      description: 'Set a daily reminder time for your reviews. Default is 9:00 AM.'
    }
  }
}

export default enUS
