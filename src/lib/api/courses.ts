/**
 * Courses API Client
 * 
 * Provides hooks for fetching courses list and course detail.
 */

import { useState, useEffect } from 'react'
import { fetchWithFallback } from './index'
import {
  mockCourses,
  mockCourseDetail,
  type CourseDetail,
} from '@/lib/mock-data/courses-data'

/**
 * Hook to fetch courses list
 */
export function useCourseList() {
  const [data, setData] = useState<CourseDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchWithFallback(
          mockCourses,
          '/api/courses'
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
 * Hook to fetch course detail
 */
export function useCourseDetail(id: string) {
  const [data, setData] = useState<CourseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const mockData = mockCourseDetail(id) || null
        const result = await fetchWithFallback(
          mockData,
          `/api/courses/${id}`
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
