import { redirect } from "next/navigation";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { getPortfolioContent, checkDbHealth } from "@/lib/portfolio-db";
import AdminDashboardClient from "@/app/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Quang Minh",
};

export default async function AdminPage() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const [portfolio, dbHealth] = await Promise.all([
    getPortfolioContent(),
    checkDbHealth(),
  ]);

  return (
    <main className="min-h-[85vh] bg-geo-dots py-6">
      <AdminDashboardClient portfolio={portfolio} dbHealth={dbHealth} />
    </main>
  );
}
