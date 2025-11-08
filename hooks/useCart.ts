// hooks/useCart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'

export interface CartItem {
  menu_id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  special_instructions?: string
  restaurant_id: string
  restaurant_name: string
}

interface CartStore {
  items: CartItem[]
  restaurantId: string | null
  restaurantName: string | null
  addItem: (item: CartItem) => void
  removeItem: (menuId: string) => void
  updateQuantity: (menuId: string, quantity: number) => void
  updateInstructions: (menuId: string, instructions: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemsCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      
      addItem: (item) => {
        const state = get()
        
        // Vérifier si on change de restaurant
        if (state.restaurantId && state.restaurantId !== item.restaurant_id) {
          if (!confirm("Changer de restaurant videra votre panier actuel. Continuer ?")) {
            return
          }
          set({ 
            items: [item], 
            restaurantId: item.restaurant_id,
            restaurantName: item.restaurant_name
          })
          toast.success("Plat ajouté au panier")
          return
        }

        const existingItem = state.items.find(i => i.menu_id === item.menu_id)
        
        if (existingItem) {
          set({
            items: state.items.map(i =>
              i.menu_id === item.menu_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          })
          toast.success("Quantité mise à jour")
        } else {
          set({ 
            items: [...state.items, item],
            restaurantId: item.restaurant_id,
            restaurantName: item.restaurant_name
          })
          toast.success("Plat ajouté au panier")
        }
      },

      removeItem: (menuId) => {
        set({ 
          items: get().items.filter(item => item.menu_id !== menuId) 
        })
        toast.success("Plat retiré du panier")
        
        // Si plus d'items, reset restaurant
        if (get().items.length === 0) {
          set({ restaurantId: null, restaurantName: null })
        }
      },

      updateQuantity: (menuId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.menu_id === menuId ? { ...item, quantity } : item
          )
        })
      },

      updateInstructions: (menuId, instructions) => {
        set({
          items: get().items.map(item =>
            item.menu_id === menuId 
              ? { ...item, special_instructions: instructions } 
              : item
          )
        })
      },

      clearCart: () => {
        set({ items: [], restaurantId: null, restaurantName: null })
        toast.success("Panier vidé")
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'restafy-cart'
    }
  )
)
