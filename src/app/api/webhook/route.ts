/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { db } from "@/db";
import { PurchaseTable } from "@/db/schema";
import { env } from "@/env";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      env.STRIPE_WEBHOOK_SECRET,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;

  if (event.type === "checkout.session.completed") {
    if (!userId || !courseId) {
      return new Response(`Webhook Error: Missing metadata`, {
        status: 400,
      });
    }

    await db.insert(PurchaseTable).values({
      userId: userId,
      courseId: courseId,
    });
  } else {
    return new Response(`Webhook Error: Unhandled event type ${event.type}`, {
      status: 200,
    });
  }

  return new Response(null, { status: 200 });
}
