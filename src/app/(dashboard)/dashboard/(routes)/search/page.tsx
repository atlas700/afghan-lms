import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import { SearchInput } from "@/components/search-input";

import { Categories } from "./_components/categories";
import { db } from "@/db";
import { asc } from "drizzle-orm";
import { CategoryTable } from "@/db/schema";

interface SearchPageProps {
  searchParams: Promise<{
    title: string;
    categoryId: string;
  }>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { userId } = await auth();
  const { categoryId, title } = await searchParams;

  if (!userId) {
    return redirect("/");
  }

  const categories = await db.query.CategoryTable.findMany({
    orderBy: asc(CategoryTable.name),
  });

  const courses = await getCourses({
    userId,
    categoryId,
    title,
  });

  return (
    <>
      <div className="block px-6 pt-6 md:mb-0 md:hidden">
        <SearchInput />
      </div>
      <div className="space-y-4 p-6">
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>
    </>
  );
};

export default SearchPage;
