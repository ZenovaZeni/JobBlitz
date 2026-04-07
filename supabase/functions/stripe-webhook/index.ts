import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@14.16.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function logEvent(userId: string | null, type: string, action: string, severity: 'info' | 'warning' | 'error', message: string, payload: any = {}) {
  try {
    await supabaseAdmin.from('system_logs').insert({
      user_id: userId,
      event_type: type,
      action: action,
      severity: severity,
      message: message,
      payload: payload,
    });
  } catch (err) {
    console.error('Failed to log event:', err);
  }
}

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
        const customerEmail = session.customer_details?.email;
        
        let targetId = supabaseUserId;

        // FALLBACK: Lookup by email if metadata is missing
        if (!targetId && customerEmail) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', customerEmail)
            .single();
          targetId = profile?.id;
        }

        if (targetId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_status: 'pending',
              last_webhook_received: new Date().toISOString(),
            })
            .eq('id', targetId);
            
          await logEvent(targetId, 'billing', 'checkout.completed', 'info', 'Stripe checkout linked successfully', { sessionId: session.id });
        } else {
          await logEvent(null, 'billing', 'checkout.unreconciled', 'warning', `No profile found for checkout: ${customerEmail}`, { session });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // Lookup profile by subscription ID
        let { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        // FALLBACK: Check by customer email if subscription ID not linked yet
        if (!profile && invoice.customer_email) {
          const { data: fallbackProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('email', invoice.customer_email)
            .single();
          profile = fallbackProfile;
        }

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({
              plan_tier: 'pro',
              subscription_status: 'active',
              stripe_subscription_id: subscriptionId, // Repair link if missing
              cancel_at_period_end: false,
              tailors_used: 0,
              cover_letters_used: 0,
              current_period_end: new Date(invoice.lines.data[0].period.end * 1000).toISOString(),
              last_reset_date: new Date().toISOString(),
              last_webhook_received: new Date().toISOString(),
              last_billing_error: null,
            })
            .eq('id', profile.id);

          await logEvent(profile.id, 'billing', 'invoice.paid', 'info', 'Pro tier activated/renewed', { invoiceId: invoice.id });
        } else {
          await logEvent(null, 'billing', 'invoice.unreconciled', 'error', `Payment received but no profile found: ${invoice.customer_email}`, { invoice });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'past_due',
              last_billing_error: 'Recent payment failed',
              last_webhook_received: new Date().toISOString(),
            })
            .eq('id', profile.id);
            
          await logEvent(profile.id, 'billing', 'invoice.failed', 'warning', 'Payment failed', { invoiceId: invoice.id });
        }
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
            last_webhook_received: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = data.object as Stripe.Subscription;
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({
              plan_tier: 'free',
              subscription_status: 'canceled',
              cancel_at_period_end: false,
              stripe_subscription_id: null,
              last_webhook_received: new Date().toISOString(),
            })
            .eq('id', profile.id);
            
          await logEvent(profile.id, 'billing', 'subscription.deleted', 'info', 'Subscription canceled', { subscriptionId: subscription.id });
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    await logEvent(null, 'system', 'webhook.error', 'error', error.message, { eventType: type });
    return new Response(`Webhook Error: ${error.message}`, { status: 500 });
  }
});
