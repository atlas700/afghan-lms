/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "@/db";
import { AttachmentTable, CourseTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const { userId } = await auth();
    const { url } = await req.json();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.query.CourseTable.findFirst({
      where: and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)),
    });

    if (!courseOwner) {
      return new Response("Unauthorized", { status: 401 });
    }

    const [attachment] = await db
      .insert(AttachmentTable)
      .values({
        url,
        name: url.split("/").pop(),
        courseId,
      })
      .returning();

    return new Response(JSON.stringify(attachment));
  } catch (error) {
    console.log("COURSE_ID_ATTACHMENTS", error);
    return new Response("Internal Error", { status: 500 });
  }
}
