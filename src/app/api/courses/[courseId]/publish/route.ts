import { db } from "@/db";
import { CourseTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const course = await db.query.CourseTable.findFirst({
      where: and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)),
      with: {
        chapters: {
          with: {
            muxData: true,
          },
        },
      },
    });

    if (!course) {
      return new Response("Not found", { status: 404 });
    }

    const hasPublishedChapter = course.chapters.some(
      (chapter) => chapter.isPublished,
    );

    if (
      !course.title ||
      !course.description ||
      !course.imageUrl ||
      !course.categoryId ||
      !hasPublishedChapter
    ) {
      return new Response("Missing required fields", { status: 401 });
    }

    const publishedCourse = await db
      .update(CourseTable)
      .set({
        isPublished: true,
      })
      .where(and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)));

    return new Response(JSON.stringify(publishedCourse));
  } catch (error) {
    console.log("[COURSE_ID_PUBLISH]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
