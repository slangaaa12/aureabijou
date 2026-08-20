import { redirect } from "next/navigation";
import { adminUrl, isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminHomePage() {
  if (!(await isAdminAuthenticated())) redirect(adminUrl("login"));
  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  );
}
