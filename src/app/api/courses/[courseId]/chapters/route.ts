import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { ChapterTable, CourseTable } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { userId } = await auth();
    const { courseId } = await params;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { title } = await req.json();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.query.CourseTable.findFirst({
      where: and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)),
    });

    if (!courseOwner) {
      return new Response("Unauthorized", { status: 401 });
    }

    const lastChapterPosition = await db.query.ChapterTable.findFirst({
      where: eq(ChapterTable.courseId, courseId),
      orderBy: desc(ChapterTable.position),
    });

    const newPosition = lastChapterPosition
      ? lastChapterPosition.position + 1
      : 1;

    console.log();

    const [chapter] = await db
      .insert(ChapterTable)
      .values({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        title,
        courseId,
        position: newPosition,
      })
      .returning();

    return new Response(JSON.stringify(chapter));
  } catch (error) {
    console.log("[CHAPTERS]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
