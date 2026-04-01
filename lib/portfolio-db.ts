import { cache } from "react";
import {
  portfolioStore,
  Skill,
  Project,
  Testimonial,
  Article,
  ResumeItem,
  type NavItem,
  type SocialLink,
} from "@/lib/portfolio";

type AboutSection = {
  intro: string;
  background: string;
  interests: string[];
};

export type PortfolioContent = {
  name: string;
  profession: string;
  tagline: string;
  location: string;
  navItems: NavItem[];
  socialLinks: SocialLink[];
  quickSummary: string[];
  about: AboutSection;
  skills: Skill[];
  projects: Project[];
  featuredProjects: Project[];
  testimonials: Testimonial[];
  articles: Article[];
  resume: ResumeItem[];
  source: "fallback";
};

export const getPortfolioContent = cache(async (): Promise<PortfolioContent> => {
  const plainSkills = portfolioStore.skills.map((item) => ({ ...item }));
  const plainProjects = portfolioStore.projects.map((item) => ({ ...item, primaryTechnology: item.technologies[0] ?? "General" }));
  const plainTestimonials = portfolioStore.testimonials.map((item) => ({ ...item }));
  const plainArticles = portfolioStore.articles.map((item) => ({ ...item }));
  const plainResume = portfolioStore.resume.map((item) => ({ ...item }));

  return {
    name: portfolioStore.name,
    profession: portfolioStore.profession,
    tagline: portfolioStore.tagline,
    location: portfolioStore.location,
    navItems: [...portfolioStore.navItems],
    socialLinks: [...portfolioStore.socialLinks],
    quickSummary: [...portfolioStore.quickSummary],
    about: { ...portfolioStore.about },
    skills: plainSkills,
    projects: plainProjects,
    featuredProjects: plainProjects.filter((p) => p.featured),
    testimonials: plainTestimonials,
    articles: plainArticles,
    resume: plainResume,
    source: "fallback",
  };
});
