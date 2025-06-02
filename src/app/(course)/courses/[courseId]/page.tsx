import { db } from "@/db";
import { ChapterTable, CourseTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const CourseIdPage = async ({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) => {
  const { courseId } = await params;
  const course = await db.query.CourseTable.findFirst({
    where: eq(CourseTable.id, courseId),
    with: {
      chapters: {
        where: eq(ChapterTable.isPublished, true),
        orderBy: asc(ChapterTable.position),
      },
    },
  });

  if (!course) {
    return redirect("/dashboard");
  }

  return redirect(`/courses/${course.id}/chapters/${course.chapters[0]?.id}`);
};

export default CourseIdPage;
