/**
 * Bundles API Client
 * 
 * Provides hooks for fetching bundles list and bundle detail.
 */

import { useState, useEffect } from 'react'
import { fetchWithFallback } from './index'
import {
  mockBundles,
  mockBundleDetail,
  type BundleDetail,
} from '@/lib/mock-data/bundles-data'

/**
 * Hook to fetch bundles list
 */
export function useBundleList() {
  const [data, setData] = useState<BundleDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchWithFallback(
          mockBundles,
          '/api/bundles'
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
 * Hook to fetch bundle detail
 */
export function useBundleDetail(id: string) {
  const [data, setData] = useState<BundleDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const mockData = mockBundleDetail(id) || null
        const result = await fetchWithFallback(
          mockData,
          `/api/bundles/${id}`
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
