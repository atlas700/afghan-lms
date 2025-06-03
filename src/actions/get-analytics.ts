import { db } from "@/db";
import { CourseTable, PurchaseTable } from "@/db/schema";
import { eq } from "drizzle-orm";
type PurchaseWithCourse = typeof PurchaseTable.$inferSelect & {
  course: typeof CourseTable.$inferSelect;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: Record<string, number> = {};

  purchases.forEach((purchase) => {
    const courseTitle = purchase.course.title;
    grouped[courseTitle] ??= 0;
    grouped[courseTitle] += parseFloat(purchase.course.price!);
  });

  return grouped;
};

export const getAnalytics = async (userId: string) => {
  try {
    const purchases = await db
      .select({
        PurchaseTable: PurchaseTable,
        CourseTable: CourseTable,
      })
      .from(PurchaseTable)
      .innerJoin(CourseTable, eq(PurchaseTable.courseId, CourseTable.id))
      .where(eq(CourseTable.userId, userId));

    const groupedEarnings = groupByCourse(
      purchases.map((purchase) => ({
        ...purchase.PurchaseTable,
        course: purchase.CourseTable,
      })),
    );
    const data = Object.entries(groupedEarnings).map(
      ([courseTitle, total]) => ({
        name: courseTitle,
        total: total,
      }),
    );

    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = purchases.length;

    return {
      data,
      totalRevenue,
      totalSales,
    };
  } catch (error) {
    console.log("[GET_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};
