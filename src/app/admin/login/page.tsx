import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const store = await cookies();
  if (verifyAdminSession(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }
  return <AdminLoginForm />;
}
