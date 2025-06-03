import { db } from "@/db";
import { UserTable } from "@/db/schema";
import { desc, gte } from "drizzle-orm";

export async function getAdminMetrics() {
  // total users

  const userCount = await db.query.UserTable.findMany();
  const newUsersThisWeek = await db.query.UserTable.findMany({
    where: gte(
      UserTable.createdAt,
      new Date(new Date().setDate(new Date().getDate() - 7)),
    ),
  });

  const activeUsers = await db.query.UserTable.findMany();
  const users = await db.query.UserTable.findMany({
    orderBy: desc(UserTable.createdAt),
  });

  return {
    userCount: userCount.length,
    newUsersThisWeek: newUsersThisWeek.length,
    activeUsers: activeUsers.length,
    users,
  };
}
