import { redirect } from "next/navigation";
import { adminUrl, isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Acesso",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect(adminUrl());
  return <AdminLoginForm />;
}
