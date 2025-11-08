// app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, order_id, customer } = await request.json()

    // Simulation FedaPay (remplacez par l'API réelle)
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // En production, utilisez l'API FedaPay réelle :
    /*
    const response = await fetch('https://sandbox-api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convertir en centimes
        currency: 'XOF',
        description: `Commande #${order_id}`,
        callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/fedapay`,
        customer: {
          email: customer.email,
          firstname: customer.firstname,
          lastname: customer.lastname,
          phone_number: customer.phone_number
        }
      })
    })

    const data = await response.json()
    */

    // Simulation réussie
    return NextResponse.json({
      transaction_id: transactionId,
      payment_url: `${process.env.NEXTAUTH_URL}/payment/success?transaction_id=${transactionId}&order_id=${order_id}`
    })

  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}
