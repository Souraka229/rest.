// app/(restaurant)/dashboard/menu/new/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { ArrowLeft, Upload, X } from "lucide-react"
import { motion } from "framer-motion"

const categories = ['Entrées', 'Plats', 'Desserts', 'Boissons']
const commonAllergens = ['Gluten', 'Lait', 'Œufs', 'Poisson', 'Crustacés', 'Noix', 'Arachides', 'Soja']

export default function NewMenuItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    preparation_time: "15",
    allergens: [] as string[],
    image_url: ""
  })

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'restafy_uploads')

      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setFormData(prev => ({ ...prev, image_url: data.secure_url }))
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (!restaurant) throw new Error("Restaurant non trouvé")

      const { error } = await supabase
        .from('menus')
        .insert({
          restaurant_id: restaurant.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          preparation_time: parseInt(formData.preparation_time),
          allergens: formData.allergens,
          image_url: formData.image_url || null
        })

      if (error) throw error

      router.push('/dashboard/menu')
    } catch (error) {
      console.error('Error creating menu item:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Ajouter un nouveau plat</CardTitle>
            <CardDescription>
              Remplissez les informations de votre plat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload d'image */}
              <div className="space-y-4">
                <Label>Image du plat</Label>
                {formData.image_url ? (
                  <div className="relative">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-64 h-48 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {uploading ? "Upload en cours..." : "Cliquez pour uploader une image"}
                      </p>
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du plat *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Pizza Margherita"
                    required
                  />
                </div>

                {/* Catégorie */}
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prix */}
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (XOF) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Ex: 2500"
                    required
                  />
                </div>

                {/* Temps de préparation */}
                <div className="space-y-2">
                  <Label htmlFor="preparation_time">Temps de préparation (minutes)</Label>
                  <Input
                    id="preparation_time"
                    type="number"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: e.target.value }))}
                    placeholder="Ex: 15"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre plat..."
                  rows={3}
                />
              </div>

              {/* Allergènes */}
              <div className="space-y-2">
                <Label>Allergènes</Label>
                <div className="flex flex-wrap gap-2">
                  {commonAllergens.map(allergen => (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => toggleAllergen(allergen)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.allergens.includes(allergen)
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {allergen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/menu')}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name || !formData.category || !formData.price}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Création..." : "Créer le plat"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
