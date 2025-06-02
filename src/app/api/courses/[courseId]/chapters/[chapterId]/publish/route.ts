import { db } from "@/db";
import { ChapterTable, CourseTable, MuxDataTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> },
) {
  try {
    const { courseId, chapterId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const ownCourse = await db.query.CourseTable.findFirst({
      where: and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)),
    });

    if (!ownCourse) {
      return new Response("Unauthorized", { status: 401 });
    }
    const chapter = await db.query.ChapterTable.findFirst({
      where: and(
        eq(ChapterTable.id, chapterId),
        eq(ChapterTable.courseId, courseId),
      ),
    });

    const muxData = await db.query.MuxDataTable.findFirst({
      where: eq(MuxDataTable.chapterId, chapterId),
    });

    if (
      !chapter ||
      !muxData ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl
    ) {
      return new Response("Missing required fields", { status: 400 });
    }

    const publishedChapter = await db
      .update(ChapterTable)
      .set({
        isPublished: true,
      })
      .where(
        and(
          eq(ChapterTable.id, chapterId),
          eq(ChapterTable.courseId, courseId),
        ),
      );

    return new Response(JSON.stringify(publishedChapter));
  } catch (error) {
    console.log("[CHAPTER_PUBLISH]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
