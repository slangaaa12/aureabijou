import { redirect } from "next/navigation";
import { adminUrl, isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProducts } from "@/components/admin/AdminProducts";

export default async function AdminProductsPage() {
  if (!(await isAdminAuthenticated())) redirect(adminUrl("login"));
  return (
    <AdminShell>
      <AdminProducts />
    </AdminShell>
  );
}
