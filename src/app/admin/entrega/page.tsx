import { redirect } from "next/navigation";
import { adminUrl, isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDelivery } from "@/components/admin/AdminDelivery";

export default async function AdminDeliveryPage() {
  if (!(await isAdminAuthenticated())) redirect(adminUrl("login"));
  return (
    <AdminShell>
      <AdminDelivery />
    </AdminShell>
  );
}
