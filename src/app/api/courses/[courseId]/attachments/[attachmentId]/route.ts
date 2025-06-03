import { db } from "@/db";
import { AttachmentTable, CourseTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; attachmentId: string }> },
) {
  try {
    const { userId } = await auth();

    const { courseId, attachmentId } = await params;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.query.CourseTable.findFirst({
      where: and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)),
    });

    if (!courseOwner) {
      return new Response("Unauthorized", { status: 401 });
    }

    const attachment = await db
      .delete(AttachmentTable)
      .where(
        and(
          eq(AttachmentTable.id, attachmentId),
          eq(AttachmentTable.courseId, courseId),
        ),
      );

    return new Response(JSON.stringify(attachment));
  } catch (error) {
    console.log("ATTACHMENT_ID", error);
    return new Response("Internal Error", { status: 500 });
  }
}
