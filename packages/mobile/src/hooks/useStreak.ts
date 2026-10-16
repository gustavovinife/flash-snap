import { computeStreak, type DayString, localDay, type Streak } from '@flash-snap/shared'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export const REVIEW_DAYS_KEY = ['review-days']
// Enough history for the best streak over the last year
const HISTORY_DAYS = 400

export function useStreak(): Streak {
  const { user } = useAuth()
  const { data } = useQuery<DayString[]>({
    queryKey: [...REVIEW_DAYS_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const since = localDay(new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000))
      const { data: rows, error } = await supabase.from('review_days').select('day').gte('day', since)
      if (error) throw new Error(error.message)
      return rows.map((row) => row.day as DayString)
    },
    staleTime: 5 * 60 * 1000
  })

  const today = localDay()
  return useMemo(() => computeStreak(data ?? [], today), [data, today])
}
