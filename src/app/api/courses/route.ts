import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { validateAdmin } from "@/lib/admin";
import { validateTeacher } from "@/lib/teacher";
import { CourseTable } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { title } = await req.json();

    console.log("HI FROM SERVER", userId);

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const isTeacher = await validateTeacher(userId);
    const isAdmin = await validateAdmin(userId);

    if (isTeacher || isAdmin) {
      const [course] = await db
        .insert(CourseTable)
        .values({
          userId,
          title: title as string,
        })
        .returning();

      return new Response(JSON.stringify(course));
    }
    return new NextResponse("Unauthorized", { status: 401 });
  } catch (error) {
    console.log("[COURSES]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
