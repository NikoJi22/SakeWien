import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";

export default async function AdminHomePage() {
  const store = await cookies();
  if (!verifyAdminSession(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }
  return <AdminDashboard />;
}
