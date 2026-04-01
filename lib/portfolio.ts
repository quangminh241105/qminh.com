export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export class Skill {
  constructor(
    public readonly name: string,
    public readonly category: string,
    public readonly level: number,
  ) {}
}

export class Project {
  constructor(
    public readonly title: string,
    public readonly summary: string,
    public readonly technologies: string[],
    public readonly repoUrl: string,
    public readonly demoUrl: string,
    public readonly featured: boolean,
  ) {}

  get primaryTechnology(): string {
    return this.technologies[0] ?? "General";
  }
}

export class Testimonial {
  constructor(
    public readonly quote: string,
    public readonly author: string,
    public readonly role: string,
  ) {}
}

export class Article {
  constructor(
    public readonly title: string,
    public readonly excerpt: string,
    public readonly slug: string,
    public readonly publishedAt: string,
  ) {}
}

export class ResumeItem {
  constructor(
    public readonly period: string,
    public readonly title: string,
    public readonly details: string,
  ) {}
}

export class PortfolioStore {
  readonly name = "Quang Minh";
  readonly profession = "IT Student";
  readonly tagline = "Building reliable web apps with clean architecture and practical UX.";
  readonly location = "Ho Chi Minh City, Vietnam";
  readonly quickSummary = [
    "Focused on scalable frontend architecture",
    "Hands-on with Next.js, TypeScript, and APIs",
    "Interested in internships and project collaborations",
  ];

  readonly navItems: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Resume", href: "/resume" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  readonly socialLinks: SocialLink[] = [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Email", href: "mailto:hello@qminh.com" },
  ];

  readonly about = {
    intro:
      "I am an IT student focused on software engineering, cloud-native development, and frontend architecture.",
    background:
      "I enjoy turning coursework and side projects into production-style applications with maintainable code structures.",
    interests: ["Web Architecture", "Cloud & DevOps", "API Design", "Human-Centered UX"],
  };

  readonly skills = [
    new Skill("TypeScript", "Language", 90),
    new Skill("Next.js", "Frontend", 88),
    new Skill("React", "Frontend", 86),
    new Skill("Tailwind CSS", "Frontend", 84),
    new Skill("Node.js", "Backend", 78),
    new Skill("PostgreSQL", "Database", 72),
    new Skill("Docker", "DevOps", 70),
    new Skill("GitHub Actions", "DevOps", 68),
  ];

  readonly projects = [
    new Project(
      "Campus Event Hub",
      "A portal where students browse, register, and receive reminders for department events.",
      ["Next.js", "TypeScript", "Tailwind"],
      "https://github.com/",
      "https://example.com",
      true,
    ),
    new Project(
      "Study Sprint Tracker",
      "A productivity dashboard for planning Pomodoro sessions, streaks, and weekly reports.",
      ["React", "TypeScript", "Node.js"],
      "https://github.com/",
      "https://example.com",
      true,
    ),
    new Project(
      "IT Knowledge Notes",
      "A markdown knowledge base for networking, OS, and data structure notes with search.",
      ["Next.js", "MDX", "Vercel"],
      "https://github.com/",
      "https://example.com",
      false,
    ),
  ];

  readonly testimonials = [
    new Testimonial(
      "Minh consistently writes clean, understandable code and communicates technical choices clearly.",
      "Team Lead",
      "Student Software Project",
    ),
    new Testimonial(
      "Strong problem-solving mindset and excellent ownership from prototype to polish.",
      "Mentor",
      "Frontend Internship Program",
    ),
  ];

  readonly articles = [
    new Article(
      "How I Structure Next.js App Router Projects",
      "A practical folder strategy for reusable components, routes, and shared logic.",
      "nextjs-structure",
      "2026-03-15",
    ),
    new Article(
      "Type Safety Patterns for Student Projects",
      "Simple TypeScript patterns that reduce bugs and improve readability.",
      "typescript-patterns",
      "2026-03-03",
    ),
  ];

  readonly resume = [
    new ResumeItem("2024 - Present", "BSc in Information Technology", "Focused on software engineering, databases, and distributed systems."),
    new ResumeItem("2025", "Frontend Developer Intern", "Built reusable UI components and improved page performance in a student startup project."),
    new ResumeItem("2025 - Present", "Freelance Student Developer", "Developing portfolio projects and internal tools for clubs and classmates."),
  ];

  get featuredProjects(): Project[] {
    return this.projects.filter((project) => project.featured);
  }
}

export const portfolioStore = new PortfolioStore();
