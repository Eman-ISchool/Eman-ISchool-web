/**
 * Payments API Client
 *
 * Provides hooks for fetching payments list and payment metrics.
 */

import { useState, useEffect } from 'react'
import { fetchApi } from './index'
import type { Payment, PaymentMetrics } from '@/types/api'

/**
 * Hook to fetch payments list
 */
export function usePaymentsList() {
  const [data, setData] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<Payment[]>('/api/payments')
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
 * Hook to fetch payment metrics
 */
export function usePaymentMetrics() {
  const [data, setData] = useState<PaymentMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchApi<PaymentMetrics>('/api/payments/metrics')
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
