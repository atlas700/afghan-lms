import { db } from "@/db";
import { ChapterTable, UserProgressTable } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const getProgress = async (
  userId: string,
  courseId: string,
): Promise<number> => {
  try {
    const publishedChapters = await db.query.ChapterTable.findMany({
      where: and(
        eq(ChapterTable.courseId, courseId),
        eq(ChapterTable.isPublished, true),
      ),
      columns: {
        id: true,
      },
    });

    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

    const validCompletedChapters = await db.query.UserProgressTable.findMany({
      where: and(
        eq(UserProgressTable.userId, userId),
        eq(UserProgressTable.isCompleted, true),
        inArray(UserProgressTable.chapterId, publishedChapterIds),
      ),
    });

    const progressPercentage =
      (validCompletedChapters.length / publishedChapterIds.length) * 100;

    return progressPercentage;
  } catch (error) {
    console.log("[GET_PROGRESS]", error);
    return 0;
  }
};
