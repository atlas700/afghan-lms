import { db } from "@/db";
import { UserTable } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const syncNewUser = async () => {
  const user = await currentUser();

  const existingUser = await db.query.UserTable.findFirst({
    where: eq(UserTable.clerkId, user!.id),
  });

  if (!existingUser) {
    await db.insert(UserTable).values({
      clerkId: user!.id,
      email: user!.emailAddresses[0]!.emailAddress,
      firstName: user!.firstName,
      lastName: user!.lastName,
    });
  }

  // Redirect after syncing
  redirect("/dashboard");
};

export default async function SyncUserAndRedirect() {
  await syncNewUser();

  // Since this component is async, nothing is rendered
  return null;
}
