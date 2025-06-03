/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Button } from "@/components/ui/button";
import type { UserTable } from "@/db/schema";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function UserReportDownloadButton({
  users,
}: {
  users: (typeof UserTable.$inferSelect)[];
}) {
  const handleUserReportDownload = () => {
    const getRole = (user: typeof UserTable.$inferSelect) => {
      if (user.isAdmin && user.isTeacher) {
        return "Admin and Teacher";
      } else if (user.isTeacher) {
        return "Teacher";
      } else {
        return "Student";
      }
    };

    const doc = new jsPDF();

    // Add a title
    doc.text("User Report", 14, 20);

    // Create the table structure
    autoTable(doc, {
      startY: 30, // Starting Y position
      head: [["First Name", "Last Name", "Email", "Role"]], // Table Headers
      body: users.map((user) => [
        user.firstName,
        user.lastName,
        user.email,
        getRole(user),
      ]), // Table body
    });

    // Save the PDF
    doc.save("users_report.pdf");
  };

  return (
    <Button
      onClick={handleUserReportDownload}
      className="mt-6 rounded-lg bg-sky-700 px-4 py-2 text-white"
      variant={"outline"}
    >
      Print User Reports
    </Button>
  );
}
