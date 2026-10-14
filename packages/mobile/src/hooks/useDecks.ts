import { type Card, type CardLink, type Deck, type DeckType, sm2, type Template } from '@flash-snap/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const DECKS_KEY = ['decks'] as const

// The Supabase client is untyped, so callers state the row type they expect
function unwrap<T>({ data, error }: { data: unknown; error: { message: string } | null }): T {
  if (error) throw new Error(error.message)
  if (data === null) throw new Error('No data returned')
  return data as T
}

function sortDecks(decks: Deck[]): Deck[] {
  return [...decks].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function useDecks(): ReturnType<typeof useQuery<Deck[]>> {
  const { user } = useAuth()
  return useQuery<Deck[]>({
    queryKey: DECKS_KEY,
    enabled: !!user,
    queryFn: async () => sortDecks(unwrap<Deck[]>(await supabase.from('decks').select('*, cards(*)'))),
    staleTime: 60 * 1000
  })
}

export function useDeck(id: string | undefined): { deck: Deck | undefined; isLoading: boolean } {
  const { data, isLoading } = useDecks()
  return { deck: data?.find((deck) => deck.id === id), isLoading }
}

interface DeckInput {
  name: string
  type: DeckType
}

interface CardInput {
  front: string
  back: string
  context: string | null
  links?: CardLink[]
}

export function useDeckMutations() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const setDecks = (update: (decks: Deck[]) => Deck[]): void => {
    queryClient.setQueryData<Deck[]>(DECKS_KEY, (old) => (old ? update(old) : old))
  }

  const updateDeckCards = (deckId: string, update: (cards: Card[]) => Card[]): void => {
    setDecks((decks) =>
      decks.map((deck) => (deck.id === deckId ? { ...deck, cards: update(deck.cards) } : deck))
    )
  }

  const createDeck = useMutation({
    mutationFn: async (input: DeckInput): Promise<Deck> => {
      if (!user) throw new Error('Not signed in')
      const deck = unwrap<Deck>(
        await supabase
          .from('decks')
          .insert({ ...input, user_id: user.id })
          .select('*')
          .single()
      )
      return { ...deck, cards: [] }
    },
    onSuccess: (deck) => setDecks((decks) => sortDecks([deck, ...decks]))
  })

  const updateDeck = useMutation({
    mutationFn: async ({ id, ...input }: DeckInput & { id: string }) =>
      unwrap<Deck>(await supabase.from('decks').update(input).eq('id', id).select('*').single()),
    onSuccess: (updated) =>
      setDecks((decks) =>
        decks.map((deck) => (deck.id === updated.id ? { ...deck, ...updated, cards: deck.cards } : deck))
      )
  })

  const deleteDeck = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('decks').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return id
    },
    onSuccess: (id) => setDecks((decks) => decks.filter((deck) => deck.id !== id))
  })

  const createCard = useMutation({
    mutationFn: async ({ deckId, ...input }: CardInput & { deckId: string }) =>
      unwrap<Card>(
        await supabase
          .from('cards')
          .insert({ ...input, deck_id: deckId })
          .select('*')
          .single()
      ),
    onSuccess: (card) => updateDeckCards(card.deck_id, (cards) => [card, ...cards])
  })

  const updateCard = useMutation({
    mutationFn: async ({ id, ...input }: CardInput & { id: number }) =>
      unwrap<Card>(await supabase.from('cards').update(input).eq('id', id).select('*').single()),
    onSuccess: (updated) =>
      updateDeckCards(updated.deck_id, (cards) =>
        cards.map((card) => (card.id === updated.id ? updated : card))
      )
  })

  const deleteCard = useMutation({
    mutationFn: async (card: Card) => {
      const { error } = await supabase.from('cards').delete().eq('id', card.id)
      if (error) throw new Error(error.message)
      return card
    },
    onSuccess: (deleted) =>
      updateDeckCards(deleted.deck_id, (cards) => cards.filter((card) => card.id !== deleted.id))
  })

  const createDeckWithCards = useMutation({
    mutationFn: async ({ cards, ...input }: DeckInput & { cards: CardInput[] }): Promise<Deck> => {
      if (!user) throw new Error('Not signed in')
      const deck = unwrap<Deck>(
        await supabase
          .from('decks')
          .insert({ ...input, user_id: user.id })
          .select('*')
          .single()
      )
      const created = unwrap<Card[]>(
        await supabase
          .from('cards')
          .insert(cards.map((card) => ({ ...card, deck_id: deck.id })))
          .select('*')
      )
      return { ...deck, cards: created }
    },
    onSuccess: (deck) => setDecks((decks) => sortDecks([deck, ...decks]))
  })

  const installTemplate = (template: Template, options?: Parameters<typeof createDeckWithCards.mutate>[1]): void =>
    createDeckWithCards.mutate(
      {
        name: template.name,
        type: template.type,
        cards: template.cards.map((card) => ({ front: card.front, back: card.back, context: card.content ?? null }))
      },
      options
    )

  const scheduleAfterReview = (card: Card, grade: number): Pick<Card, 'interval' | 'repetition' | 'ease_factor' | 'next_review'> => {
    const schedule = sm2(card, grade)
    return { ...schedule, next_review: schedule.next_review.toISOString() }
  }

  const reviewCard = useMutation({
    mutationFn: async ({ card, grade }: { card: Card; grade: number }) => {
      const { error } = await supabase.from('cards').update(scheduleAfterReview(card, grade)).eq('id', card.id)
      if (error) throw new Error(error.message)
      await supabase
        .from('decks')
        .update({ last_reviewed: new Date().toISOString() })
        .eq('id', card.deck_id)
    },
    onMutate: async ({ card, grade }) => {
      await queryClient.cancelQueries({ queryKey: DECKS_KEY })
      const previous = queryClient.getQueryData<Deck[]>(DECKS_KEY)
      const schedule = scheduleAfterReview(card, grade)
      updateDeckCards(card.deck_id, (cards) =>
        cards.map((c) => (c.id === card.id ? { ...c, ...schedule } : c))
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(DECKS_KEY, context.previous)
    }
  })

  return {
    createDeck,
    updateDeck,
    deleteDeck,
    createCard,
    updateCard,
    deleteCard,
    createDeckWithCards,
    installTemplate,
    reviewCard
  }
}
