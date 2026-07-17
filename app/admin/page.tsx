import { getPortfolioContent } from "@/lib/portfolio-db";
import { AdminDashboard } from "./_components/AdminDashboard";

export default async function AdminPage() {
  const portfolio = await getPortfolioContent();
  return <AdminDashboard portfolio={portfolio} />;
}
