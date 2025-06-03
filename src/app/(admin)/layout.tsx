import { validateAdmin } from "@/lib/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/dashboard");
  }

  const isAdmin = await validateAdmin(userId);

  return (
    <div className="grainy h-full">
      {isAdmin === true ? <main>{children}</main> : redirect("/")}
    </div>
  );
};

export default AdminLayout;
