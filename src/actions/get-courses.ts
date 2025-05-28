import { getProgress } from "@/actions/get-progress";
import { db } from "@/db";
import {
  ChapterTable,
  CourseTable,
  PurchaseTable,
  type CategoryTable,
} from "@/db/schema";
import { and, desc, eq, ilike } from "drizzle-orm";

type CourseWithProgressWithCategory = typeof CourseTable.$inferSelect & {
  category: typeof CategoryTable.$inferSelect | null;
  chapters: { id: string }[];
  progress: number | null;
};

type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
  try {
    const courses = await db.query.CourseTable.findMany({
      where: and(
        eq(CourseTable.isPublished, true),
        ilike(CourseTable.title, title!),
        eq(CourseTable.categoryId, categoryId!),
      ),
      with: {
        category: true,
        chapters: {
          where: eq(ChapterTable.isPublished, true),
          columns: { id: true },
        },
        purchases: {
          where: eq(PurchaseTable.userId, userId),
        },
      },
      orderBy: desc(CourseTable.createdAt),
    });

    const coursesWithProgress: CourseWithProgressWithCategory[] =
      await Promise.all(
        courses.map(async (course) => {
          if (course.purchases.length === 0) {
            return {
              ...course,
              progress: null,
            };
          }

          const progressPercentage = await getProgress(userId, course.id);

          return {
            ...course,
            progress: progressPercentage,
          };
        }),
      );

    return coursesWithProgress;
  } catch (error) {
    console.log("[GET_COURSES]", error);
    return [];
  }
};
