import supabase from '@renderer/services/supabaseService'
import { Card, Deck } from '@renderer/types'
import { useQueryClient, useQuery, useMutation, UseMutationResult } from '@tanstack/react-query'

interface IUseCards {
  cards: Card[]
  isLoading: boolean
  createCard: UseMutationResult<Card, Error, CreateCard, unknown>
  createManyCards: UseMutationResult<Card[], Error, CreateCard[], unknown>
  updateCard: UseMutationResult<Card, Error, Card, unknown>
  deleteCard: UseMutationResult<Card, Error, number, unknown>
}

type CreateCard = Omit<
  Card,
  'id' | 'created_at' | 'next_review' | 'repetition' | 'ease_factor' | 'interval'
>

export const useCards = (): IUseCards => {
  const queryClient = useQueryClient()

  const { data: cards, isLoading } = useQuery<Card[]>({
    queryKey: ['cards'],
    queryFn: async () => {
      //decks has a many to many relation with cards, we need to retrieve cards array inside the decks call
      const data = await supabase.from('cards').select('*')

      return data?.data ?? []
    },
    staleTime: 5 * 60 * 1000 //5 minutes
  })
  const createCard = useMutation({
    mutationFn: async (card: CreateCard) => {
      const response = await supabase.from('cards').insert(card).select('*')

      return response.data?.[0] as unknown as Card
    },
    onSuccess: (newCard: Card) => {
      queryClient.setQueryData<Card[]>(['cards'], (oldData) => {
        return oldData ? [newCard, ...oldData] : [newCard]
      })
      queryClient.setQueryData<Deck[]>(['decks'], (oldData) => {
        return oldData?.map((deck) => {
          if (deck.id === newCard.deck_id) {
            return { ...deck, cards: [newCard, ...deck.cards] }
          }
          return deck
        })
      })
    }
  })

  const createManyCards = useMutation({
    mutationFn: async (cards: CreateCard[]) => {
      const response = await supabase.from('cards').insert(cards).select('*')
      return response.data as unknown as Card[]
    },
    onSuccess: (newCards: Card[]) => {
      queryClient.setQueryData<Card[]>(['cards'], (oldData) => {
        return oldData ? [...newCards, ...oldData] : newCards
      })
      queryClient.setQueryData<Deck[]>(['decks'], (oldData) => {
        return oldData?.map((deck) => {
          if (deck.id === newCards[0].deck_id) {
            return { ...deck, cards: [...deck.cards, ...newCards] }
          }
          return deck
        })
      })
    }
  })

  const updateCard = useMutation({
    mutationFn: async (card: Card) => {
      const response = await supabase.from('cards').update(card).eq('id', card.id).select('*')
      return response.data?.[0] as unknown as Card
    },
    onSuccess: (updatedCard: Card) => {
      queryClient.setQueryData<Card[]>(['cards'], (oldData) => {
        return oldData?.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      })
      queryClient.setQueryData<Deck[]>(['decks'], (oldData) => {
        return oldData?.map((deck) => {
          if (deck.id === updatedCard.deck_id) {
            return {
              ...deck,
              cards: deck.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c))
            }
          }
          return deck
        })
      })
    }
  })

  const deleteCard = useMutation({
    mutationFn: async (id: number) => {
      const response = await supabase.from('cards').delete().eq('id', id).select('*')
      return response.data?.[0] as unknown as Card
    },
    onSuccess: (deletedCard: Card) => {
      queryClient.setQueryData<Card[]>(['cards'], (oldData) => {
        return oldData?.filter((card) => card.id !== deletedCard.id)
      })
      queryClient.setQueryData<Deck[]>(['decks'], (oldData) => {
        return oldData?.map((deck) => {
          return { ...deck, cards: deck.cards.filter((c) => c.id !== deletedCard.id) }
        })
      })
    }
  })

  return {
    cards: cards ?? [],
    isLoading,
    createCard,
    createManyCards,
    updateCard,
    deleteCard
  }
}
