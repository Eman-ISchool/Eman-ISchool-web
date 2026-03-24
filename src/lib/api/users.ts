/**
 * Users API Client
 *
 * Provides hooks for fetching users list.
 */

import { useState, useEffect } from 'react'
import { fetchApi } from './index'
import type { User } from '@/types/api'

/**
 * Hook to fetch users list
 */
export function useUsersList() {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<User[]>('/api/users')
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
