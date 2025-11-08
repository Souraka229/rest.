// app/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { Search, Utensils, Clock, Star } from "lucide-react"

interface Restaurant {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  city: string | null
  category: string | null
  cuisine_types: string[] | null
  price_range: string | null
  delivery_fee: number
  delivery_time: number
  is_open: boolean
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .eq('is_open', true)
        .order('name')

      if (error) throw error
      setRestaurants(data || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
    restaurant.category?.toLowerCase().includes(search.toLowerCase()) ||
    restaurant.cuisine_types?.some(type => 
      type.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Restafy</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Connexion</Button>
              </Link>
              <Link href="/signup">
                <Button>Inscription</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Commandez de la nourriture en ligne
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Découvrez les meilleurs restaurants près de chez vous et commandez en quelques clics
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un restaurant, une cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Restaurants populaires</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardContent className="p-0">
                    {restaurant.cover_url ? (
                      <img 
                        src={restaurant.cover_url} 
                        alt={restaurant.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <Utensils className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {restaurant.name}
                        </h3>
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {restaurant.price_range}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {restaurant.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{restaurant.delivery_time} min</span>
                        </div>
                        <span>{restaurant.delivery_fee} XOF</span>
                      </div>
                      {restaurant.cuisine_types && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {restaurant.cuisine_types.slice(0, 2).map((type, index) => (
                            <span 
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun restaurant trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Utensils className="h-6 w-6" />
              <span className="text-xl font-bold">Restafy</span>
            </div>
            <p className="text-gray-400">
              &copy; 2024 Restafy. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
