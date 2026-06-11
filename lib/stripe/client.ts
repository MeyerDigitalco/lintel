import Stripe from "stripe";

/**
 * Server-side Stripe client. Never import in client components.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
  typescript: true,
  appInfo: { name: "Lintel" },
});
