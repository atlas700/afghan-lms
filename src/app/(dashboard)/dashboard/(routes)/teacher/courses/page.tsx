import { auth } from "@clerk/nextjs/server";

import { db } from "@/db";

import { CourseTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

const CoursesPage = async () => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const courses = await db.query.CourseTable.findMany({
    where: eq(CourseTable.userId, userId),
    orderBy: desc(CourseTable.createdAt),
  });

  return (
    <div className="p-6">
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default CoursesPage;
