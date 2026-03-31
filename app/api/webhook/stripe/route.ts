import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  // 1. Get the raw text body and the Stripe signature header
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    // 2. Verify that this request ACTUALLY came from Stripe using your secret
    event = stripe.webhooks.constructEvent(payload, signature!, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 3. Handle the successful payment event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const userId = session.metadata?.userId;

    if (userId) {
      // Find out which plan they bought based on the amount (Stripe uses cents, so $10 = 1000)
      const planBought = session.amount_total === 10000 ? "YEARLY" : "MONTHLY";

      // Update the user in our database!
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: planBought,
          stripeCustomerId: session.customer as string,
        },
      });
      console.log(`✅ User ${userId} successfully subscribed to ${planBought}`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}