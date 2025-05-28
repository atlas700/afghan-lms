import { db } from "@/db";
import { UserTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function validateAdmin(userId: string) {
  if (!userId) {
    console.warn("validateAdmin called with undefined userId");
    return false;
  }

  const admin = await db.query.UserTable.findFirst({
    where: and(eq(UserTable.clerkId, userId), eq(UserTable.isAdmin, true)),
  });

  if (admin?.isAdmin) {
    return true;
  }

  return false;
}
