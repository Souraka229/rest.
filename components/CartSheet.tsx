// components/CartSheet.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/hooks/useCart"
import { Minus, Plus, Trash2, ShoppingCart, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, updateQuantity, removeItem, updateInstructions, getTotal, getItemsCount, restaurantName, clearCart } = useCart()

  return (
    <>
      {/* Bouton panier */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <ShoppingCart className="h-6 w-6" />
        {getItemsCount() > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {getItemsCount()}
          </motion.span>
        )}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panier */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Mon Panier</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contenu */}
              <div className="flex-1 overflow-y-auto p-4">
                {restaurantName && (
                  <p className="text-sm text-gray-600 mb-4">
                    Restaurant: <span className="font-semibold">{restaurantName}</span>
                  </p>
                )}

                <AnimatePresence>
                  {items.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Votre panier est vide</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <motion.div
                          key={item.menu_id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.1 }}
                          layout
                        >
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                {item.image_url && (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {item.name}
                                  </h4>
                                  <p className="text-lg font-bold text-blue-600">
                                    {(item.price * item.quantity).toLocaleString()} XOF
                                  </p>
                                  
                                  {/* Contrôles quantité */}
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="w-8 text-center font-medium">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => removeItem(item.menu_id)}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>

                                  {/* Instructions spéciales */}
                                  <Input
                                    placeholder="Instructions spéciales..."
                                    value={item.special_instructions || ""}
                                    onChange={(e) => updateInstructions(item.menu_id, e.target.value)}
                                    className="mt-2 text-sm"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>{getTotal().toLocaleString()} XOF</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="flex-1"
                    >
                      Vider
                    </Button>
                    <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Link href="/checkout" onClick={() => setIsOpen(false)}>
                        Commander
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
