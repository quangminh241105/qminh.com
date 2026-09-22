import SectionTitle from "@/components/SectionTitle";
import BlogGroupCard from "@/components/BlogGroupCard";
import { getPortfolioContent } from "@/lib/portfolio-db";

export default async function BlogPage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Blog"
        title="Notes, tutorials, and engineering thoughts"
        description="Posts are organized into groups — pick one to see what's inside."
      />

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {portfolio.articleGroups.map((group) => (
          <BlogGroupCard key={group.slug} group={group} />
        ))}
      </section>
    </main>
  );
}
