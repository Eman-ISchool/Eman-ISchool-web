/**
 * Dashboard API Client
 * 
 * Provides hooks for fetching dashboard metrics and charts.
 */

import { useState, useEffect } from 'react'
import { fetchWithParams, fetchWithFallback } from './index'
import {
  mockDashboardMetrics,
  mockDashboardCharts,
  type DashboardMetrics,
  type DashboardChart,
} from '@/lib/mock-data/dashboard-data'

/**
 * Hook to fetch dashboard metrics
 */
export function useDashboardMetrics(startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const params: Record<string, string> = {}
        if (startDate) params.startDate = startDate.toISOString()
        if (endDate) params.endDate = endDate.toISOString()

        const result = await fetchWithParams(
          mockDashboardMetrics,
          '/api/dashboard/metrics',
          params
        )
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
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
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchWithFallback(
          mockDashboardCharts,
          '/api/dashboard/charts'
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
