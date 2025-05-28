import { NavbarRoutes } from "@/components/navbar-routes";

import { validateAdmin } from "@/lib/admin";
import { validateTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { MobileSidebar } from "./mobile-sidebar";

export const Navbar = async () => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const isTeacher = await validateTeacher(userId);
  const isAdmin = await validateAdmin(userId);

  return (
    <div className="flex h-full items-center border-b bg-white p-4 shadow-sm">
      <MobileSidebar />
      <NavbarRoutes isTeacher={isTeacher} isAdmin={isAdmin} />
    </div>
  );
};
