// app/checkout/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useCart } from "@/hooks/useCart"
import { supabase } from "@/lib/supabase/client"
import { ArrowLeft, CreditCard, Smartphone, Wallet } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, restaurantId, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    instructions: ""
  })
  const [serviceType, setServiceType] = useState<"delivery" | "pickup">("delivery")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money">("card")

  const deliveryFee = 1000
  const subtotal = getTotal()
  const total = serviceType === "delivery" ? subtotal + deliveryFee : subtotal

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Veuillez remplir les informations obligatoires")
      return
    }

    setLoading(true)

    try {
      // 1. Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurantId!,
          service_type: serviceType,
          delivery_address: serviceType === "delivery" ? customerInfo.address : null,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          subtotal: subtotal,
          delivery_fee: serviceType === "delivery" ? deliveryFee : 0,
          total_amount: total,
          payment_method: paymentMethod,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Ajouter les items de la commande
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_id: item.menu_id,
        menu_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        special_instructions: item.special_instructions
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 3. Initier le paiement FedaPay
      const paymentResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          order_id: order.id,
          customer: {
            email: customerInfo.email,
            firstname: customerInfo.name.split(' ')[0],
            lastname: customerInfo.name.split(' ').slice(1).join(' '),
            phone_number: customerInfo.phone
          }
        })
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error)
      }

      // 4. Rediriger vers FedaPay
      window.location.href = paymentData.payment_url

    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || "Erreur lors de la commande")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Panier vide</h2>
            <p className="text-gray-600 mb-6">Votre panier est vide</p>
            <Button onClick={() => router.push('/')}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="space-y-6">
              {/* Informations client */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations client</CardTitle>
                  <CardDescription>
                    Renseignez vos informations de contact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+229 XX XX XX XX"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Type de service */}
              <Card>
                <CardHeader>
                  <CardTitle>Type de service</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={serviceType} onValueChange={(value: any) => setServiceType(value)} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                      <Label
                        htmlFor="delivery"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Truck className="mb-3 h-6 w-6" />
                        Livraison
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                      <Label
                        htmlFor="pickup"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <ShoppingBag className="mb-3 h-6 w-6" />
                        À emporter
                      </Label>
                    </div>
                  </RadioGroup>

                  {serviceType === "delivery" && (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="address">Adresse de livraison *</Label>
                      <Input
                        id="address"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Votre adresse complète"
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Méthode de paiement */}
              <Card>
                <CardHeader>
                  <CardTitle>Paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="card" id="card" className="peer sr-only" />
                      <Label
                        htmlFor="card"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <CreditCard className="mb-3 h-6 w-6" />
                        Carte
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="mobile_money" id="mobile_money" className="peer sr-only" />
                      <Label
                        htmlFor="mobile_money"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Smartphone className="mb-3 h-6 w-6" />
                        Mobile Money
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Récapitulatif */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.menu_id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.quantity}x {item.name}</p>
                          {item.special_instructions && (
                            <p className="text-sm text-gray-600">{item.special_instructions}</p>
                          )}
                        </div>
                        <p className="font-semibold">
                          {(item.price * item.quantity).toLocaleString()} XOF
                        </p>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Sous-total</span>
                        <span>{subtotal.toLocaleString()} XOF</span>
                      </div>
                      {serviceType === "delivery" && (
                        <div className="flex justify-between">
                          <span>Frais de livraison</span>
                          <span>{deliveryFee.toLocaleString()} XOF</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total</span>
                        <span>{total.toLocaleString()} XOF</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleCheckout}
                disabled={loading || !customerInfo.name || !customerInfo.phone || (serviceType === "delivery" && !customerInfo.address)}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Traitement...
                  </div>
                ) : (
                  `Payer ${total.toLocaleString()} XOF`
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
