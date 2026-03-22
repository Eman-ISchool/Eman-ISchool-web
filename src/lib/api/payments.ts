/**
 * Payments API Client
 * 
 * Provides hooks for fetching payments list and payment metrics.
 */

import { useState, useEffect } from 'react'
import { fetchWithFallback } from './index'
import {
  mockPayments,
  mockPaymentMetrics,
  type Payment,
  type PaymentMetrics,
} from '@/lib/mock-data/payments-data'

/**
 * Hook to fetch payments list
 */
export function usePaymentsList() {
  const [data, setData] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchWithFallback(
          mockPayments,
          '/api/payments'
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
 * Hook to fetch payment metrics
 */
export function usePaymentMetrics() {
  const [data, setData] = useState<PaymentMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchWithFallback(
          mockPaymentMetrics,
          '/api/payments/metrics'
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
