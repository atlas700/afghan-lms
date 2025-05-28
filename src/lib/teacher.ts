import { db } from "@/db";
import { UserTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function validateTeacher(userId: string) {
  const teacher = await db.query.UserTable.findFirst({
    where: and(eq(UserTable.clerkId, userId), eq(UserTable.isTeacher, true)),
  });

  if (teacher?.isTeacher) {
    return true;
  }

  return false;
}
