import { NavbarRoutes } from "@/components/navbar-routes";

import { CourseMobileSidebar } from "./course-mobile-sidebar";
import type { ChapterTable, CourseTable, UserProgressTable } from "@/db/schema";

interface CourseNavbarProps {
  course: typeof CourseTable.$inferSelect & {
    chapters: (typeof ChapterTable.$inferSelect & {
      userProgress: (typeof UserProgressTable.$inferSelect)[] | null;
    })[];
  };
  progressCount: number;
  isTeacher?: boolean;
  isAdmin?: boolean;
}

export const CourseNavbar = ({
  course,
  progressCount,
  isTeacher,
  isAdmin,
}: CourseNavbarProps) => {
  return (
    <div className="flex h-full items-center border-b bg-white p-4 shadow-sm">
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <NavbarRoutes isTeacher={isTeacher} isAdmin={isAdmin} />
    </div>
  );
};
