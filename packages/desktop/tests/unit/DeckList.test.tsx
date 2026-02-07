import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import DeckList from '../../src/renderer/src/components/DeckList'
import { getDueCards } from '../../src/renderer/src/services/reviewService'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      if (key === 'deckList.startReview') return 'Start Review'
      if (key === 'deckList.cardsDue') return `${options?.count ?? 0} due`
      if (key === 'deckList.title') return 'Decks'
      if (key === 'deckList.deckCount') return `${options?.count ?? 0} decks`
      if (key === 'common.deck') return 'deck'
      if (key === 'common.decks') return 'decks'
      if (key === 'deckList.addDeck') return 'Add deck'
      if (key === 'common.addTemplate') return 'Add template'
      return key
    }
  })
}))

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() })
}))

vi.mock('../../src/renderer/src/context/SessionContext', () => ({
  useSession: () => ({ user: { id: 'user-1' } })
}))

vi.mock('../../src/renderer/src/hooks/useSubscription', () => ({
  useSubscription: () => ({
    canCreateDeck: () => true,
    openCheckout: vi.fn()
  })
}))

const decksFixture = [
  {
    id: 'deck-1',
    name: 'Deck 1',
    cards: [],
    created_at: new Date(),
    type: 'knowledge'
  }
]

const createDeckMock = { mutateAsync: vi.fn() }
const deleteDeckMock = { mutateAsync: vi.fn() }

vi.mock('../../src/renderer/src/hooks/useDecks', () => ({
  useDecks: () => ({
    decks: decksFixture,
    createDeck: createDeckMock,
    deleteDeck: deleteDeckMock
  })
}))

vi.mock('../../src/renderer/src/services/reviewService', () => ({
  getDueCards: vi.fn()
}))

vi.mock('../../src/renderer/src/ui/common', () => ({
  Button: ({
    children,
    leftIcon,
    variant,
    size,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    leftIcon?: React.ReactNode
    variant?: string
    size?: string
  }) => <button {...props}>{children}</button>,
  Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  Select: ({ ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} />
}))

vi.mock('../../src/renderer/src/components/CreateWithAICard', () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>Create with AI</button>
  )
}))

const mockGetDueCards = getDueCards as unknown as ReturnType<typeof vi.fn>

describe('DeckList', () => {
  beforeEach(() => {
    mockGetDueCards.mockReset()
    mockGetDueCards.mockResolvedValue([])
  })

  it('refreshes due cards on focus and visibility change', async () => {
    let visibilityState: DocumentVisibilityState = 'visible'
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibilityState
    })

    mockGetDueCards
      .mockResolvedValueOnce([
        { card: { id: 1 }, deckId: 'deck-1', deckName: 'Deck 1' },
        { card: { id: 2 }, deckId: 'deck-1', deckName: 'Deck 1' }
      ])
      .mockResolvedValueOnce([
        { card: { id: 1 }, deckId: 'deck-1', deckName: 'Deck 1' },
        { card: { id: 2 }, deckId: 'deck-1', deckName: 'Deck 1' },
        { card: { id: 3 }, deckId: 'deck-1', deckName: 'Deck 1' }
      ])
      .mockResolvedValueOnce([{ card: { id: 1 }, deckId: 'deck-1', deckName: 'Deck 1' }])

    render(<DeckList />)

    expect(await screen.findByText('Start Review')).toBeInTheDocument()
    expect(await screen.findByText(/2 due/)).toBeInTheDocument()

    await act(async () => {
      window.dispatchEvent(new Event('focus'))
    })
    expect(await screen.findByText(/3 due/)).toBeInTheDocument()

    visibilityState = 'visible'
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(await screen.findByText(/1 due/)).toBeInTheDocument()

    expect(mockGetDueCards).toHaveBeenCalledTimes(3)
  })
})
