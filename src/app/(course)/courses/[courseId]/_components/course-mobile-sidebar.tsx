import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { CourseSidebar } from "./course-sidebar";
import type { ChapterTable, CourseTable, UserProgressTable } from "@/db/schema";

interface CourseMobileSidebarProps {
  course: typeof CourseTable.$inferSelect & {
    chapters: (typeof ChapterTable.$inferSelect & {
      userProgress: (typeof UserProgressTable.$inferSelect)[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseMobileSidebar = ({
  course,
  progressCount,
}: CourseMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="pr-4 transition hover:opacity-75 md:hidden">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-white p-0">
        <CourseSidebar course={course} progressCount={progressCount} />
      </SheetContent>
    </Sheet>
  );
};
