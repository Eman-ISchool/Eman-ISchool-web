/**
 * Exams API Client
 * 
 * Provides hooks for fetching exams list.
 */

import { useState, useEffect } from 'react'
import { fetchWithFallback } from './index'
import { mockExams, type Exam } from '@/lib/mock-data/exams-data'

/**
 * Hook to fetch exams list
 */
export function useExamsList() {
  const [data, setData] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchWithFallback(
          mockExams,
          '/api/exams'
        )
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, isLoading, error }
}
