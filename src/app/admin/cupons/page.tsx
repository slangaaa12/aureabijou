import { redirect } from "next/navigation";
import { adminUrl, isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCoupons } from "@/components/admin/AdminCoupons";

export default async function AdminCouponsPage() {
  if (!(await isAdminAuthenticated())) redirect(adminUrl("login"));
  return (
    <AdminShell>
      <AdminCoupons />
    </AdminShell>
  );
}
