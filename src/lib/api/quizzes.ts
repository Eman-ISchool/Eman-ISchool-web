/**
 * Quizzes API Client
 * 
 * Provides hooks for fetching quizzes list, quiz detail, and quiz statistics.
 */

import { useState, useEffect } from 'react'
import { fetchWithFallback } from './index'
import {
  mockQuizzes,
  mockQuizDetail,
  mockQuizStatistics,
  type Quiz,
  type QuizStatistics,
} from '@/lib/mock-data/quizzes-data'

/**
 * Hook to fetch quizzes list
 */
export function useQuizzesList() {
  const [data, setData] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchWithFallback(
          mockQuizzes,
          '/api/quizzes'
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

/**
 * Hook to fetch quiz detail
 */
export function useQuizDetail(id: string) {
  const [data, setData] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const mockData = mockQuizDetail(id)
        const result = await fetchWithFallback(
          mockData,
          `/api/quizzes/${id}`
        )
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { data, isLoading, error }
}

/**
 * Hook to fetch quiz statistics
 */
export function useQuizStatistics(id: string) {
  const [data, setData] = useState<QuizStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchWithFallback(
          mockQuizStatistics(id),
          `/api/quizzes/${id}/statistics`
        )
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { data, isLoading, error }
}
