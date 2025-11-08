// app/api/webhooks/fedapay/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Vérifier la signature FedaPay (important en production)
    // const signature = request.headers.get('x-fedapay-signature')
    
    if (body.status === 'approved') {
      // Mettre à jour le statut de la commande
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          payment_id: body.transaction_id,
          status: 'confirmed'
        })
        .eq('id', body.metadata.order_id)

      if (error) throw error

      // Envoyer un email de confirmation (optionnel)
      // await sendOrderConfirmation(body.metadata.order_id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
