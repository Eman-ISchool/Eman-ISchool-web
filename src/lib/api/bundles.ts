/**
 * Bundles API Client
 *
 * Provides hooks for fetching bundles list and bundle detail.
 */

import { useState, useEffect } from 'react'
import { fetchApi } from './index'
import type { BundleDetail } from '@/types/api'

/**
 * Hook to fetch bundles list
 */
export function useBundleList() {
  const [data, setData] = useState<BundleDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<BundleDetail[]>('/api/bundles')
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
 * Hook to fetch bundle detail
 */
export function useBundleDetail(id: string) {
  const [data, setData] = useState<BundleDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<BundleDetail>(`/api/bundles/${id}`)
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
