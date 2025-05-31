/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "@/db";
import { ChapterTable, CourseTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { list } = await req.json();

    const ownCourse = await db.query.CourseTable.findFirst({
      where: and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)),
    });

    if (!ownCourse) {
      return new Response("Unauthorized", { status: 401 });
    }

    for (const item of list) {
      await db
        .update(ChapterTable)
        .set({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          position: item.position,
        })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        .where(eq(ChapterTable.id, item.id));
    }

    return new Response("Success", { status: 200 });
  } catch (error) {
    console.log("[REORDER]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
