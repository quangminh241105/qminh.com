export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type ResumeFile = {
  url: string;
  name: string;
  size: number;
  format: "doc" | "docx" | "pdf";
  updatedAt: string;
};

export class Skill {
  public readonly id: string;

  constructor(
    public readonly name: string,
    public readonly category: string,
    public readonly level: number,
    public readonly order?: number,
  ) {
    this.id = name;
  }
}

export class Project {
  public readonly id: string;
  public readonly images: string[];
  public readonly thumbnail: string | undefined;
  public readonly videoUrl: string | undefined;
  public readonly customVars: Record<string, string>;

  constructor(
    public readonly title: string,
    public readonly summary: string,
    public readonly technologies: string[],
    public readonly repoUrl: string,
    public readonly demoUrl: string,
    public readonly featured: boolean,
    public readonly pictures: string[] = [],
    public readonly videos: string[] = [],
    public readonly customVariables: Record<string, string> = {},
    public readonly content: string = "",
    public readonly order?: number,
    thumbnail?: string,
  ) {
    this.id = title;
    this.images = pictures;
    this.thumbnail = thumbnail || pictures[0];
    this.videoUrl = videos[0];
    this.customVars = customVariables;
  }

  get primaryTechnology(): string {
    return this.technologies[0] ?? "General";
  }

}

export class Testimonial {
  constructor(
    public readonly quote: string,
    public readonly author: string,
    public readonly role: string,
    public readonly order?: number,
  ) {}
}

export class Article {
  public readonly id: string;
  public readonly body: string;
  public readonly thumbnail: string | undefined;
  public readonly coverImage: string | undefined;
  public readonly videoUrl: string | undefined;

  constructor(
    public readonly title: string,
    public readonly excerpt: string,
    public readonly slug: string,
    public readonly groupSlug: string = "engineering-notes",
    public readonly publishedAt: string,
    public readonly content: string = "",
    public readonly pictures: string[] = [],
    public readonly videos: string[] = [],
    public readonly order?: number,
    thumbnail?: string,
  ) {
    this.id = slug;
    this.body = content;
    this.thumbnail = thumbnail || pictures[0];
    this.coverImage = this.thumbnail;
    this.videoUrl = videos[0];
  }
}

export class ArticleGroup {
  public readonly id: string;
  public readonly coverImage: string | undefined;
  public readonly articleCount: number = 0;

  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string,
  ) {
    this.id = slug;
    this.coverImage = undefined;
  }
}

export class ResumeItem {
  public readonly id: string;

  constructor(
    public readonly period: string,
    public readonly title: string,
    public readonly details: string,
    public readonly order?: number,
  ) {
    this.id = title;
  }
}

export class PortfolioStore {
  readonly name = "Quang Minh";
  readonly profession = "IT Student";
  readonly tagline = "Building reliable web apps with clean architecture and practical UX.";
  readonly location = "Ho Chi Minh City, Vietnam";
  readonly avatar: string | undefined = undefined;
  readonly resumeFile: ResumeFile | undefined = undefined;
  readonly quickSummary = [
    "Focused on scalable frontend architecture",
    "Hands-on with Next.js, TypeScript, and APIs",
    "Interested in internships and collaborations",
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
    { label: "GitHub", href: "https://github.com/quangminh241105" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/qminh2005" },
    { label: "Instagram", href: "https://www.instagram.com/qminh1142" },
    { label: "Email", href: "mailto:phamlequangminh2411@gmail.com" },
  ];

  readonly about = {
    intro:
      "I am an IT student focused on software engineering, cloud-native development, and frontend architecture.",
    background:
      "I enjoy turning coursework and side projects into production-style applications with maintainable code structures.",
    interests: ["Web Architecture", "Cloud & DevOps", "API Design", "Human-Centered UX"],
  };

  readonly skills = [
    new Skill("TypeScript", "Language", 90, 0),
    new Skill("Next.js", "Frontend", 88, 1),
    new Skill("React", "Frontend", 86, 2),
    new Skill("Tailwind CSS", "Frontend", 84, 3),
    new Skill("Node.js", "Backend", 78, 4),
    new Skill("PostgreSQL", "Database", 72, 5),
    new Skill("Docker", "DevOps", 70, 6),
    new Skill("GitHub Actions", "DevOps", 68, 7),
  ];

  readonly projects = [
    new Project(
      "Campus Event Hub",
      "A portal where students browse, register, and receive reminders for department events.",
      ["Next.js", "TypeScript", "Tailwind"],
      "https://github.com/",
      "https://example.com",
      true,
      [],
      [],
      { "Role": "Full-Stack Developer", "Status": "Completed", "Database": "MongoDB" },
      "Campus Event Hub is an event discovery and reservation platform built for university departments. It simplifies how organizers manage registrations, track attendance via QR codes, and send automated notifications.",
      0
    ),
    new Project(
      "Study Sprint Tracker",
      "A productivity dashboard for planning Pomodoro sessions, streaks, and weekly reports.",
      ["React", "TypeScript", "Node.js"],
      "https://github.com/",
      "https://example.com",
      true,
      [],
      [],
      { "Role": "Frontend Lead", "Status": "Active", "Version": "v1.2.0" },
      "Study Sprint Tracker helps students maintain productive focus habits through customizable Pomodoro sprints, streak visualization, and weekly summary charts.",
      1
    ),
    new Project(
      "IT Knowledge Notes",
      "A markdown knowledge base for networking, OS, and data structure notes with search.",
      ["Next.js", "MDX", "Vercel"],
      "https://github.com/",
      "https://example.com",
      false,
      [],
      [],
      { "Role": "Author & Maintainer", "Category": "Documentation" },
      "A comprehensive, searchable repository of technical study guides, algorithms, networking cheat sheets, and systems architecture summaries.",
      2
    ),
  ];

  readonly testimonials = [
    new Testimonial(
      "Minh consistently writes clean, understandable code and communicates technical choices clearly.",
      "Team Lead",
      "Student Software Project",
      0
    ),
    new Testimonial(
      "Strong problem-solving mindset and excellent ownership from prototype to polish.",
      "Mentor",
      "Frontend Internship Program",
      1
    ),
  ];

  readonly articleGroups = [
    new ArticleGroup(
      "Engineering Notes",
      "engineering-notes",
      "Long-form thoughts on architecture, TypeScript, and building maintainable web apps."
    ),
  ];

  readonly articles = [
    new Article(
      "How I Structure Next.js App Router Projects",
      "A practical folder strategy for reusable components, routes, and shared logic.",
      "nextjs-structure",
      "engineering-notes",
      "2026-03-15",
      `## Why Structure Matters in Next.js App Router

When developing scalable Next.js applications, adopting a consistent directory layout simplifies navigation and prevents spaghetti dependencies.

### 1. Colocate Components with Route Groups
Separate presentation components from data-fetching routes. Use \`lib/\` for shared stores and client instances.

### 2. Server Components by Default
Keep data fetching in server components to avoid client-side waterfalls and reduce JavaScript payload sent to browsers.`,
      [],
      [],
      0
    ),
    new Article(
      "Type Safety Patterns for Student Projects",
      "Simple TypeScript patterns that reduce bugs and improve readability.",
      "typescript-patterns",
      "engineering-notes",
      "2026-03-03",
      `## Type Safety Tips for Everyday TypeScript

TypeScript gives you superpowers when you define strict domain models early.

### Discriminated Unions
Always prefer discriminated unions over generic boolean flags for asynchronous state and entity variants.

### Strict Schemas
Pair your TypeScript types with runtime validation schemas for external API inputs to prevent unexpected runtime crashes.`,
      [],
      [],
      1
    ),
  ];

  readonly resume = [
    new ResumeItem(
      "2024 - Present",
      "BSc in Information Technology",
      "Focused on software engineering, databases, and distributed systems.",
      0
    ),
    new ResumeItem(
      "2025",
      "Frontend Developer Intern",
      "Built reusable UI components and improved page performance in a student startup project.",
      1
    ),
    new ResumeItem(
      "2025 - Present",
      "Freelance Student Developer",
      "Developing portfolio projects and internal tools for clubs and classmates.",
      2
    ),
  ];

  get featuredProjects(): Project[] {
    return this.projects.filter((project) => project.featured);
  }
}

export const portfolioStore = new PortfolioStore();
