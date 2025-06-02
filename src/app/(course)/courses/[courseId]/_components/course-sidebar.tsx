import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { CourseProgress } from "@/components/course-progress";
import { db } from "@/db";

import { CourseSidebarItem } from "./course-sidebar-item";
import {
  PurchaseTable,
  type ChapterTable,
  type CourseTable,
  type UserProgressTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

interface CourseSidebarProps {
  course: typeof CourseTable.$inferSelect & {
    chapters: (typeof ChapterTable.$inferSelect & {
      userProgress: (typeof UserProgressTable.$inferSelect)[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/dashboard");
  }

  const purchase = await db.query.PurchaseTable.findFirst({
    where: and(
      eq(PurchaseTable.userId, userId),
      eq(PurchaseTable.courseId, course.id),
    ),
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r shadow-sm">
      <div className="flex flex-col border-b p-8">
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <div className="mt-10">
            <CourseProgress variant="success" value={progressCount} />
          </div>
        )}
      </div>
      <div className="flex w-full flex-col">
        {course?.chapters?.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  );
};
