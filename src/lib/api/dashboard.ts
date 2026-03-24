/**
 * Dashboard API Client
 *
 * Provides hooks for fetching dashboard metrics and charts.
 */

import { useState, useEffect } from 'react'
import { fetchApi, fetchApiWithParams } from './index'
import type { DashboardMetrics, DashboardChart } from '@/types/api'

/**
 * Hook to fetch dashboard metrics
 */
export function useDashboardMetrics(startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const params: Record<string, string> = {}
        if (startDate) params.startDate = startDate.toISOString()
        if (endDate) params.endDate = endDate.toISOString()

        const result = await fetchApiWithParams<DashboardMetrics>(
          '/api/dashboard/metrics',
          params
        )
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err as Error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [startDate, endDate])

  return { data, isLoading, error }
}

/**
 * Hook to fetch dashboard charts
 */
export function useDashboardCharts() {
  const [data, setData] = useState<DashboardChart[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<DashboardChart[]>('/api/dashboard/charts')
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
