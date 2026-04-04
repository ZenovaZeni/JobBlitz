import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@14.16.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Requires service role for backend updates
  { auth: { persistSession: false, autoRefreshToken: false } }
);

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')!;
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const { data, type } = event;

  try {
    switch (type) {
      case 'checkout.session.completed': {
        const session = data.object as Stripe.Checkout.Session;
        const supabaseUserId = session.metadata?.supabase_user_id;
        
        if (supabaseUserId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_status: 'pending', // Waiting for initial invoice.paid
              cancel_at_period_end: false,
            })
            .eq('id', supabaseUserId);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // PRO UPGRADE & MONTHLY RESET
        await supabaseAdmin
          .from('profiles')
          .update({
            plan_tier: 'pro',
            subscription_status: 'active',
            cancel_at_period_end: false, // Reset on renewal
            tailors_used: 0,
            cover_letters_used: 0,
            current_period_end: new Date(invoice.lines.data[0].period.end * 1000).toISOString(),
            last_reset_date: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'past_due',
          })
          .eq('stripe_subscription_id', subscriptionId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = data.object as Stripe.Subscription;
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = data.object as Stripe.Subscription;
        await supabaseAdmin
          .from('profiles')
          .update({
            plan_tier: 'free',
            subscription_status: 'canceled',
            cancel_at_period_end: false,
            stripe_subscription_id: null,
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new Response(`Webhook Error: ${error.message}`, { status: 500 });
  }
});
