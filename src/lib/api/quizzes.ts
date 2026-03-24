/**
 * Quizzes API Client
 *
 * Provides hooks for fetching quizzes list, quiz detail, and quiz statistics.
 */

import { useState, useEffect } from 'react'
import { fetchApi } from './index'
import type { Quiz, QuizStatistics } from '@/types/api'

/**
 * Hook to fetch quizzes list
 */
export function useQuizzesList() {
  const [data, setData] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<Quiz[]>('/api/quizzes')
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

/**
 * Hook to fetch quiz detail
 */
export function useQuizDetail(id: string) {
  const [data, setData] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<Quiz>(`/api/quizzes/${id}`)
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err as Error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
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
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<QuizStatistics>(`/api/quizzes/${id}/statistics`)
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err as Error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [id])

  return { data, isLoading, error }
}
