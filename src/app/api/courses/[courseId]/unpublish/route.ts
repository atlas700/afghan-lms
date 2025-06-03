import { db } from "@/db";
import { CourseTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { userId } = await auth();

    const { courseId } = await params;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const course = await db.query.CourseTable.findFirst({
      where: and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)),
    });

    if (!course) {
      return new Response("Not found", { status: 404 });
    }

    const unpublishedCourse = await db
      .update(CourseTable)
      .set({
        isPublished: false,
      })
      .where(and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)));

    return new Response(JSON.stringify(unpublishedCourse));
  } catch (error) {
    console.log("[COURSE_ID_UNPUBLISH]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
