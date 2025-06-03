import { db } from "@/db";
import { ChapterTable, CourseTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> },
) {
  try {
    const { userId } = await auth();
    const { courseId, chapterId } = await params;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.query.CourseTable.findFirst({
      where: and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)),
    });

    if (!ownCourse) {
      return new Response("Unauthorized", { status: 401 });
    }

    const unpublishedChapter = await db
      .update(ChapterTable)
      .set({
        isPublished: false,
      })
      .where(
        and(
          eq(ChapterTable.id, chapterId),
          eq(ChapterTable.courseId, courseId),
        ),
      );

    const publishedChaptersInCourse = await db.query.ChapterTable.findMany({
      where: and(
        eq(ChapterTable.courseId, courseId),
        eq(ChapterTable.isPublished, true),
      ),
    });

    if (!publishedChaptersInCourse.length) {
      await db
        .update(CourseTable)
        .set({ isPublished: false })
        .where(eq(CourseTable.id, courseId));
    }

    return new Response(JSON.stringify(unpublishedChapter));
  } catch (error) {
    console.log("[CHAPTER_UNPUBLISH]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
