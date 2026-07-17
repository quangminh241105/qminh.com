import ContactForm from "@/components/ContactForm";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";

export default async function ContactPage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Contact"
        title="Let us build something useful"
        description="Reach out for internships, freelance work, or collaboration on student projects."
      />

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ContactForm />

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Direct Links</h3>
          <ul className="mt-4 grid gap-3">
            {portfolio.socialLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Response time: usually within 24 hours.</p>
        </aside>
      </section>
    </main>
  );
}
