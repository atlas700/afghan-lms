import { db } from "@/db";
import {
  AttachmentTable,
  ChapterTable,
  CourseTable,
  MuxDataTable,
  PurchaseTable,
  UserProgressTable,
} from "@/db/schema";
import { and, asc, eq, gt } from "drizzle-orm";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    const purchase = await db.query.PurchaseTable.findFirst({
      where: and(
        eq(PurchaseTable.userId, userId),
        eq(PurchaseTable.courseId, courseId),
      ),
    });

    const course = await db.query.CourseTable.findFirst({
      where: and(
        eq(CourseTable.isPublished, true),
        eq(CourseTable.id, courseId),
      ),
      columns: {
        price: true,
      },
    });

    const chapter = await db.query.ChapterTable.findFirst({
      where: and(
        eq(ChapterTable.isPublished, true),
        eq(ChapterTable.id, chapterId),
      ),
    });

    if (!chapter || !course) {
      throw new Error("Chapter or course not found");
    }

    let muxData = null;
    let attachments: (typeof AttachmentTable.$inferSelect)[] = [];
    let nextChapter: typeof ChapterTable.$inferSelect | null = null;

    if (purchase) {
      attachments = await db.query.AttachmentTable.findMany({
        where: eq(AttachmentTable.courseId, courseId),
      });
    }

    if (chapter.isFree || purchase) {
      muxData = await db.query.MuxDataTable.findFirst({
        where: eq(MuxDataTable.chapterId, chapterId),
      });

      nextChapter =
        (await db.query.ChapterTable.findFirst({
          where: and(
            eq(ChapterTable.courseId, courseId),
            eq(ChapterTable.isPublished, true),
            gt(ChapterTable?.position, chapter.position),
          ),
          orderBy: asc(ChapterTable.position),
        })) ?? null;
    }

    const userProgress = await db.query.UserProgressTable.findFirst({
      where: and(
        eq(UserProgressTable.userId, userId),
        eq(UserProgressTable.chapterId, chapterId),
      ),
    });

    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};
