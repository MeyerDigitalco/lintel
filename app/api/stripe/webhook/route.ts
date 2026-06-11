import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { featureForPriceId } from "@/lib/stripe/config";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

// Stripe webhooks need the raw body, so disable body parsing assumptions.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook → syncs subscription status + entitlements into Postgres.
 * Uses the service-role client (bypasses RLS) because this is a trusted server
 * context with no user session.
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.org_id;
      if (!orgId) break;

      // Upsert subscription record.
      await supabase.from("subscriptions").upsert(
        {
          org_id: orgId,
          stripe_customer_id: String(sub.customer),
          stripe_subscription_id: sub.id,
          status: mapStatus(sub.status),
          trial_ends_at: sub.trial_end
            ? new Date(sub.trial_end * 1000).toISOString()
            : null,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "org_id" }
      );

      // Recompute entitlements from the subscription's line items.
      const activeFeatures = new Set<string>();
      const isLive = ["active", "trialing", "past_due"].includes(sub.status);
      if (isLive && event.type !== "customer.subscription.deleted") {
        for (const item of sub.items.data) {
          const feature = featureForPriceId(item.price.id);
          if (feature) activeFeatures.add(feature);
        }
      }

      const allFeatures = ["core", "voice", "tenant_portal", "maintenance_portal"];
      for (const feature of allFeatures) {
        await supabase.from("entitlements").upsert(
          {
            org_id: orgId,
            feature,
            active: activeFeatures.has(feature),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "org_id,feature" }
        );
      }
      break;
    }
    default:
      // Unhandled event types are acknowledged with 200.
      break;
  }

  return NextResponse.json({ received: true });
}

function mapStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      return "incomplete";
  }
}
