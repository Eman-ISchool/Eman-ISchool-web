/**
 * Users API Client
 * 
 * Provides hooks for fetching users list.
 */

import { useState, useEffect } from 'react'
import { fetchWithFallback } from './index'
import { mockUsers, type User } from '@/lib/mock-data/users-data'

/**
 * Hook to fetch users list
 */
export function useUsersList() {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchWithFallback(
          mockUsers,
          '/api/users'
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
