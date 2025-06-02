import { db } from "@/db";
import { CourseTable, PurchaseTable, StripeCustomerTable } from "@/db/schema";
import { env } from "@/env";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const user = await currentUser();
    console.log(user);

    if (!user?.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new Response("Unauthorized", { status: 401 });
    }

    const course = await db.query.CourseTable.findFirst({
      where: and(
        eq(CourseTable.id, courseId),
        eq(CourseTable.isPublished, true),
      ),
    });

    const purchase = await db.query.PurchaseTable.findFirst({
      where: and(
        eq(PurchaseTable.userId, user.id),
        eq(PurchaseTable.courseId, courseId),
      ),
    });

    if (purchase) {
      return new Response("Already purchased", { status: 400 });
    }

    if (!course) {
      return new Response("Not found", { status: 404 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: "KES",
          product_data: {
            name: course.title,
            description: course.description!,
          },
          unit_amount: Math.round(parseFloat(course.price!) * 100),
        },
      },
    ];

    let stripeCustomer = await db.query.StripeCustomerTable.findFirst({
      where: eq(StripeCustomerTable.userId, user.id),
      columns: {
        stripeCustomerId: true,
      },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      stripeCustomer = await db
        .insert(StripeCustomerTable)
        .values({
          userId: user.id,
          stripeCustomerId: customer.id,
        })
        .returning();
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer?.stripeCustomerId,
      line_items,
      mode: "payment",
      success_url: `${env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
      metadata: {
        courseId: course.id,
        userId: user.id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }));
  } catch (error) {
    console.log("[COURSE_ID_CHECKOUT]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
