import supabase from '@renderer/services/supabaseService'
import { Deck } from '@renderer/types'
import { useQueryClient, useQuery, useMutation, UseMutationResult } from '@tanstack/react-query'

interface IUseDecks {
  decks: Deck[]
  isLoading: boolean
  createDeck: UseMutationResult<Deck, Error, CreateDeck, unknown>
  updateDeck: UseMutationResult<Deck, Error, UpdateDeck, unknown>
  deleteDeck: UseMutationResult<Deck, Error, string, unknown>
}

type CreateDeck = Omit<Deck, 'id' | 'created_at' | 'last_reviewed' | 'cards'> & {
  user_id: string
}

type UpdateDeck = Omit<Deck, 'created_at' | 'last_reviewed' | 'cards'>

export const useDecks = (): IUseDecks => {
  const queryClient = useQueryClient()

  const { data: decks, isLoading } = useQuery<Deck[]>({
    queryKey: ['decks'],
    queryFn: async () => {
      //decks has a many to many relation with cards, we need to retrieve cards array inside the decks call
      const data = await supabase.from('decks').select('*, cards(*)')

      return data?.data ?? []
    },
    staleTime: 5 * 60 * 1000 //5 minutes
  })
  const createDeck = useMutation({
    mutationFn: async (deck: CreateDeck) => {
      const response = await supabase.from('decks').insert(deck).select('*')
      // Ensure cards is always initialized as an empty array
      const newDeck = response.data?.[0] as unknown as Deck
      return { ...newDeck, cards: [] }
    },
    onSuccess: (newDeck: Deck) => {
      queryClient.setQueryData<Deck[]>(['decks'], (oldData) => {
        return oldData ? [newDeck, ...oldData] : [newDeck]
      })
    }
  })

  const updateDeck = useMutation({
    mutationFn: async (deck: UpdateDeck) => {
      const response = await supabase
        .from('decks')
        .update({ ...deck, cards: undefined })
        .eq('id', deck.id)
        .select('*')
      const updatedDeck = response.data?.[0] as unknown as Deck
      // Preserve the cards array from the original deck if it's missing in the response
      return { ...updatedDeck, cards: updatedDeck.cards || [] }
    },
    onSuccess: (updatedDeck: Deck) => {
      queryClient.setQueryData<Deck[]>(['decks'], (oldData) => {
        return oldData?.map((deck) => (deck.id === updatedDeck.id ? updatedDeck : deck))
      })
    }
  })

  const deleteDeck = useMutation({
    mutationFn: async (id: string) => {
      const response = await supabase.from('decks').delete().eq('id', id).select('*')
      return response.data?.[0] as unknown as Deck
    },
    onSuccess: (deletedDeck: Deck) => {
      queryClient.setQueryData<Deck[]>(['decks'], (oldData) => {
        return oldData?.filter((deck) => deck.id !== deletedDeck.id)
      })
    }
  })

  return {
    decks: decks ?? [],
    isLoading,
    createDeck,
    updateDeck,
    deleteDeck
  }
}
