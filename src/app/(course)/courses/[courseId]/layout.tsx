import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getProgress } from "@/actions/get-progress";
import { db } from "@/db";

import { ChapterTable, CourseTable, UserProgressTable } from "@/db/schema";
import { validateAdmin } from "@/lib/admin";
import { validateTeacher } from "@/lib/teacher";
import { asc, eq } from "drizzle-orm";
import { CourseNavbar } from "./_components/course-navbar";
import { CourseSidebar } from "./_components/course-sidebar";

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) => {
  const { userId } = await auth();
  const { courseId } = await params;

  if (!userId) {
    return redirect("/dashboard");
  }

  const isTeacher = await validateTeacher(userId);
  const isAdmin = await validateAdmin(userId);

  const course = await db.query.CourseTable.findFirst({
    where: eq(CourseTable.id, courseId),
    with: {
      chapters: {
        where: eq(ChapterTable.isPublished, true),
        with: {
          userProgress: {
            where: eq(UserProgressTable.userId, userId),
          },
        },
        orderBy: asc(ChapterTable.position),
      },
    },
  });

  if (!course) {
    return redirect("/dashboard");
  }

  const progressCount = await getProgress(userId, course.id);

  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-50 h-[80px] w-full md:pl-80">
        <CourseNavbar
          isTeacher={isTeacher}
          isAdmin={isAdmin}
          course={course}
          progressCount={progressCount}
        />
      </div>
      <div className="fixed inset-y-0 z-50 hidden h-full w-80 flex-col md:flex">
        <CourseSidebar course={course} progressCount={progressCount} />
      </div>
      <main className="h-full pt-[80px] md:pl-80">{children}</main>
    </div>
  );
};

export default CourseLayout;
