/**
 * Exams API Client
 *
 * Provides hooks for fetching exams list.
 */

import { useState, useEffect } from 'react'
import { fetchApi } from './index'
import type { Exam } from '@/types/api'

/**
 * Hook to fetch exams list
 */
export function useExamsList() {
  const [data, setData] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<Exam[]>('/api/exams')
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err as Error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  return { data, isLoading, error }
}
