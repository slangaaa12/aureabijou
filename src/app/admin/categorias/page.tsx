import { redirect } from "next/navigation";
import { adminUrl, isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCategories } from "@/components/admin/AdminCategories";

export default async function AdminCategoriesPage() {
  if (!(await isAdminAuthenticated())) redirect(adminUrl("login"));
  return (
    <AdminShell>
      <AdminCategories />
    </AdminShell>
  );
}
