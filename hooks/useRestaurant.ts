// hooks/useRestaurant.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Restaurant {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  category: string | null
  cuisine_types: string[] | null
  price_range: string | null
  delivery_fee: number
  delivery_time: number
  is_open: boolean
}

export function useRestaurant(restaurantId: string) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!restaurantId) return

    const fetchRestaurant = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single()

        if (error) throw error
        setRestaurant(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [restaurantId])

  return { restaurant, loading, error }
}
