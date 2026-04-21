/**
 * Courses API Client
 *
 * Provides hooks for fetching courses list and course detail.
 */

import { useState, useEffect } from 'react'
import { fetchApi } from './index'
import type { CourseDetail } from '@/types/api'

/**
 * Hook to fetch courses list
 */
export function useCourseList() {
  const [data, setData] = useState<CourseDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<CourseDetail[]>('/api/courses')
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err as Error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [refreshKey])

  const refetch = () => setRefreshKey(k => k + 1)

  return { data, isLoading, error, refetch }
}

/** @deprecated Use useCourseList instead */
export const useCoursesList = useCourseList

/**
 * Hook to fetch course detail
 */
export function useCourseDetail(id: string) {
  const [data, setData] = useState<CourseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<CourseDetail>(`/api/courses/${id}`)
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
