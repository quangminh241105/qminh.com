import ContactForm from "@/components/ContactForm";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";
import type { Metadata } from "next";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Quang Minh",
  description: "Get in touch with Quang Minh about internships, freelance work, or a software project.",
};

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
                <a href={link.href} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 font-medium text-brand-600 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-slate-800 dark:text-brand-400 dark:hover:border-brand-800 dark:hover:bg-brand-950/30">
                  {link.label} <ArrowUpRight className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-7 grid gap-3 border-t border-slate-200 pt-5 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-500" /> {portfolio.location}</p>
            <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-brand-500" /> Usually replies within 24 hours</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
