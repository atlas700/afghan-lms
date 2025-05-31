/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { auth } from "@clerk/nextjs/server";
import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { env } from "@/env";
import { and, eq } from "drizzle-orm";
import { CourseTable } from "@/db/schema";

const { video } = new Mux({
  tokenId: env.MUX_TOKEN_ID,
  tokenSecret: env.MUX_TOKEN_SECRET,
});

export async function DELETE(
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

    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await video.assets.delete(chapter.muxData.assetId);
      }
    }

    const deletedCourse = await db
      .delete(CourseTable)
      .where(eq(CourseTable.id, courseId));

    return new Response(JSON.stringify(deletedCourse));
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new Response("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { userId } = await auth();
    const { courseId } = await params;
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db
      .update(CourseTable)
      .set(values)
      .where(and(eq(CourseTable.id, courseId), eq(CourseTable.userId, userId)));

    return new Response(JSON.stringify(course));
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
