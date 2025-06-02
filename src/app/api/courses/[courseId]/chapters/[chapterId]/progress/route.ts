import { db } from "@/db";
import { UserProgressTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> },
) {
  try {
    const { chapterId } = await params;
    const { userId } = await auth();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { isCompleted } = await req.json();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userProgress = await db
      .insert(UserProgressTable)
      .values({
        userId: userId,
        chapterId: chapterId,
        isCompleted: isCompleted as boolean,
      })
      .onConflictDoUpdate({
        target: UserProgressTable.id,
        set: {
          isCompleted: isCompleted as boolean,
        },
      })
      .returning(); // if you want the inserted/updated row back

    return new Response(JSON.stringify(userProgress));
  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
