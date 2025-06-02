import { getProgress } from "@/actions/get-progress";
import { db } from "@/db";
import {
  ChapterTable,
  PurchaseTable,
  type CategoryTable,
  type CourseTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

type CourseWithProgressWithCategory = typeof CourseTable.$inferSelect & {
  category: typeof CategoryTable.$inferSelect;
  chapters: (typeof ChapterTable.$inferSelect)[];
  progress: number | null;
};

interface DashboardCourses {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProgress: CourseWithProgressWithCategory[];
}

export const getDashboardCourses = async (
  userId: string,
): Promise<DashboardCourses> => {
  try {
    const purchasedCourses = await db.query.PurchaseTable.findMany({
      where: eq(PurchaseTable.userId, userId),
      columns: {},
      with: {
        course: {
          columns: {},
          with: {
            category: true,
            chapters: {
              where: eq(ChapterTable.isPublished, true),
            },
          },
        },
      },
    });

    const courses = purchasedCourses.map(
      (purchase) => purchase.course,
    ) as CourseWithProgressWithCategory[];

    for (const course of courses) {
      const progress = await getProgress(userId, course.id);
      course.progress = progress;
    }

    const completedCourses = courses.filter(
      (course) => course.progress === 100,
    );
    const coursesInProgress = courses.filter(
      (course) => (course.progress ?? 0) < 100,
    );

    return {
      completedCourses,
      coursesInProgress,
    };
  } catch (error) {
    console.log("[GET_DASHBOARD_COURSES]", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
};
