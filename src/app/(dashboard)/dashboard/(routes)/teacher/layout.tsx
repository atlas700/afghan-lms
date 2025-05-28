import { validateAdmin } from "@/lib/admin";
import { validateTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const isTeacher = await validateTeacher(userId);
  const isAdmin = await validateAdmin(userId);

  if (isTeacher || isAdmin) {
    return <>{children}</>;
  } else {
    return redirect("/");
  }
}
