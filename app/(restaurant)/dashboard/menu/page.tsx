// app/(restaurant)/dashboard/menu/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MenuItem {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  image_url: string | null
  is_available: boolean
  preparation_time: number
  allergens: string[] | null
}

const categories = ['Tous', 'Entrées', 'Plats', 'Desserts', 'Boissons']

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (restaurant) {
        const { data: menu } = await supabase
          .from('menus')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .order('created_at', { ascending: false })

        setMenuItems(menu || [])
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menus')
        .update({ is_available: !currentStatus })
        .eq('id', itemId)

      if (error) throw error
      
      setMenuItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, is_available: !currentStatus }
          : item
      ))
    } catch (error) {
      console.error('Error updating menu item:', error)
    }
  }

  const deleteMenuItem = async (itemId: string) => {
    setDeletingId(itemId)
    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      
      setMenuItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Error deleting menu item:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Tous" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header avec recherche et filtres */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion du Menu</h1>
            <p className="text-gray-600 mt-2">
              {menuItems.length} plat{menuItems.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/menu/new">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un plat
            </Link>
          </Button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un plat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Grille des plats */}
      <AnimatePresence>
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <Card className={`h-full transition-all duration-300 hover:shadow-xl ${
                !item.is_available ? 'opacity-60' : ''
              }`}>
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant={item.is_available ? "default" : "secondary"} className="bg-white text-gray-800">
                        {item.is_available ? "Disponible" : "Indisponible"}
                      </Badge>
                      <Badge variant="outline" className="bg-black/80 text-white border-0">
                        {item.price} XOF
                      </Badge>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                        {item.name}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description || "Aucune description"}
                    </p>

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {item.preparation_time} min
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {item.category}
                      </span>
                    </div>

                    {/* Allergènes */}
                    {item.allergens && item.allergens.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {item.allergens.map((allergen, idx) => (
                            <span 
                              key={idx}
                              className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
                            >
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant={item.is_available ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleAvailability(item.id, item.is_available)}
                        className="flex-1"
                      >
                        {item.is_available ? (
                          <EyeOff className="h-4 w-4 mr-1" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1" />
                        )}
                        {item.is_available ? "Masquer" : "Afficher"}
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/menu/${item.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteMenuItem(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* État vide */}
      {filteredItems.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategory !== "Tous" ? "Aucun plat trouvé" : "Aucun plat au menu"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== "Tous" 
              ? "Essayez de modifier vos critères de recherche" 
              : "Commencez par ajouter votre premier plat"
            }
          </p>
          {!searchTerm && selectedCategory === "Tous" && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/menu/new">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un plat
              </Link>
            </Button>
          )}
        </motion.div>
      )}
    </div>
  )
}
