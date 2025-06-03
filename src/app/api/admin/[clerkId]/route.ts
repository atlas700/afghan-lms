/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "@/db";
import { UserTable } from "@/db/schema";
import { validateAdmin } from "@/lib/admin";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ clerkId: string }> },
) {
  try {
    const { userId } = await auth();
    const { clerkId } = await params;
    const values = await req.json();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const isAdmin = await validateAdmin(userId);

    if (!userId && !isAdmin) {
      return new Response("Unauthorized", { status: 401 });
    }

    const updatedUser = await db
      .update(UserTable)
      .set(values)
      .where(eq(UserTable.clerkId, clerkId));

    return new Response(JSON.stringify(updatedUser));
  } catch (error) {
    console.log(" ROLE_MANAGEMENT_USER_ID]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
