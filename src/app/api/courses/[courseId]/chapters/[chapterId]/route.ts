/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "@/db";
import { ChapterTable, CourseTable, MuxDataTable } from "@/db/schema";
import { env } from "@/env";
import { auth } from "@clerk/nextjs/server";
import Mux from "@mux/mux-node";
import { and, eq } from "drizzle-orm";

const { video } = new Mux({
  tokenId: env.MUX_TOKEN_ID,
  tokenSecret: env.MUX_TOKEN_SECRET,
});

export async function DELETE(
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

    if (!chapter) {
      return new Response("Not Found", { status: 404 });
    }

    if (chapter.videoUrl) {
      const existingMuxData = await db.query.MuxDataTable.findFirst({
        where: eq(MuxDataTable.chapterId, chapterId),
      });

      if (existingMuxData) {
        await video.assets.delete(existingMuxData.assetId);
        await db
          .delete(MuxDataTable)
          .where(eq(MuxDataTable.id, existingMuxData.id));
      }
    }

    const deletedChapter = await db
      .delete(ChapterTable)
      .where(eq(ChapterTable.id, chapterId));

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

    return new Response(JSON.stringify(deletedChapter));
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new Response("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> },
) {
  try {
    const { courseId, chapterId } = await params;
    const { userId } = await auth();
    const { isPublished, ...values } = await req.json();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.query.CourseTable.findFirst({
      where: and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)),
    });

    if (!ownCourse) {
      return new Response("Unauthorized", { status: 401 });
    }

    const chapter = await db
      .update(ChapterTable)
      .set(values)
      .where(
        and(
          eq(ChapterTable.id, chapterId),
          eq(ChapterTable.courseId, courseId),
        ),
      );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (values.videoUrl) {
      const existingMuxData = await db.query.MuxDataTable.findFirst({
        where: eq(MuxDataTable.chapterId, chapterId),
      });

      if (existingMuxData) {
        await video.assets.delete(existingMuxData.assetId);
        await db
          .delete(MuxDataTable)
          .where(eq(MuxDataTable.id, existingMuxData.id));
      }

      const asset = await video.assets.create({
        input: values.videoUrl,
        playback_policy: ["public"],
        test: false,
        inputs: [],
      });

      await db.insert(MuxDataTable).values({
        chapterId,
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id,
      });
    }

    return new Response(JSON.stringify(chapter));
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
