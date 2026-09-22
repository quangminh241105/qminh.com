"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Button from "@/components/Button";
import {
  GitBranch,
  Webhook,
  ClipboardCheck,
  UploadCloud,
  KeyRound,
  FolderPlus,
  Container,
  HeartPulse,
  Globe,
  Layers,
  Atom,
  FileCode2,
  Palette,
  Database,
  Workflow,
  GitPullRequest,
  Server,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Step = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: GitBranch,
    title: "Push to GitHub",
    body: "Every change starts the same way: write code, commit it, and push to the main branch on GitHub. GitHub keeps a full history of the project, so nothing is ever lost and anyone can see exactly what changed and when.",
  },
  {
    icon: Webhook,
    title: "GitHub Notifies Jenkins",
    body: "The moment that push lands, GitHub sends a small notification - a webhook - straight to Jenkins, the automation server that runs the deployment. Nobody has to log in and click “deploy”; the pipeline just starts by itself.",
  },
  {
    icon: ClipboardCheck,
    title: "Jenkins Checks Out & Verifies",
    body: "Jenkins downloads the exact code that was just pushed and runs a quick sanity check: does package.json exist? Is there a Dockerfile? If something critical is missing, the pipeline stops right here instead of wasting time on a broken build.",
  },
  {
    icon: UploadCloud,
    title: "Files Sync to the Server",
    body: "The verified code is copied over a secure connection (SSH) to the real server that hosts qminh.com, using a tool called rsync. It only sends what actually changed, so updates stay fast even on a modest connection.",
  },
  {
    icon: KeyRound,
    title: "Secrets Injected Securely",
    body: "Passwords and API keys are never stored in the code itself. Jenkins keeps them in a locked-down credential and copies them onto the server as a .env file, right before the app starts - swapped in atomically so a half-written file can never be used.",
  },
  {
    icon: FolderPlus,
    title: "Upload Folder Prepared",
    body: "A dedicated folder on the server is made ready to store images and videos uploaded through the admin dashboard. It lives outside the code folder on purpose, so the next deployment can never accidentally delete it.",
  },
  {
    icon: Container,
    title: "Docker Builds & Restarts Everything",
    body: "Docker packages the whole app - code, dependencies, runtime - into a self-contained image. Docker Compose then starts two containers together: the website itself, and a MongoDB database that stores all the content. Any stale, old version is cleanly replaced.",
  },
  {
    icon: HeartPulse,
    title: "Automatic Health Check",
    body: "Before Jenkins calls the deployment a success, it repeatedly pings the live site for up to a minute. If the site doesn't respond in time, the pipeline is marked as failed - so a broken deploy never gets to quietly sit there pretending to work.",
  },
  {
    icon: Globe,
    title: "Live for Everyone",
    body: "Once healthy, that's the version visitors see at qminh.com. Content edited through the admin dashboard is saved straight to MongoDB, so updating text, projects, or blog posts never requires touching code or redeploying at all.",
  },
];

type TechItem = {
  icon: LucideIcon;
  name: string;
  note: string;
};

const TECH_STACK: TechItem[] = [
  { icon: Layers, name: "Next.js 16", note: "App Router, Server Actions" },
  { icon: Atom, name: "React 19", note: "UI library" },
  { icon: FileCode2, name: "TypeScript", note: "Type-safe code everywhere" },
  { icon: Palette, name: "Tailwind CSS", note: "Utility-first styling" },
  { icon: Database, name: "MongoDB", note: "Self-hosted content storage" },
  { icon: Container, name: "Docker", note: "Packages the app to run anywhere" },
  { icon: Workflow, name: "Jenkins", note: "Automates the whole deploy" },
  { icon: GitPullRequest, name: "GitHub", note: "Source of truth, triggers builds" },
  { icon: Server, name: "Node.js", note: "Runs the server in production" },
];

function TimelineStep({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;

  return (
    <div className="relative flex gap-6">
      <motion.div
        initial={{ scale: 0.86, opacity: 0.28 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black bg-blue-600 text-white shadow-[3px_3px_0px_#000000] dark:border-blue-400 dark:bg-blue-500 dark:shadow-[3px_3px_0px_#ffffff]"
      >
        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
      </motion.div>

      <motion.div
        initial={{ opacity: 0.3, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="flex-1 pb-2 pt-1"
      >
        <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
          Step {index + 1} of {STEPS.length}
        </p>
        <h3 className="mt-1 font-mono text-xl font-black uppercase text-slate-900 dark:text-slate-100">{step.title}</h3>
        <p className="mt-2 max-w-2xl font-sans leading-7 text-slate-600 dark:text-slate-400">{step.body}</p>
      </motion.div>
    </div>
  );
}

export default function PipelineContent() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <main>
      {/* Hero */}
      <section className="border-b-2 border-black bg-zinc-50 bg-geo-grid dark:border-blue-400 dark:bg-black">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/projects"
            className="inline-flex items-center border-2 border-black bg-white px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ffe600] hover:shadow-[3px_3px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[2px_2px_0px_#000000] dark:hover:bg-[#ffe600] dark:hover:text-black dark:hover:shadow-[3px_3px_0px_#000000]"
          >
            Back to projects
          </Link>

          <p className="mt-6 inline-flex border-2 border-black bg-[#ffe600] px-2 py-0.5 font-mono text-xs font-black uppercase tracking-[0.2em] text-black">
            Behind The Scenes
          </p>
          <h1 className="mt-5 text-4xl font-black uppercase tracking-tight text-black sm:text-5xl dark:text-white">
            How qminh.com Ships Itself
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-lg leading-8 text-slate-600 dark:text-slate-400">
            This page isn&apos;t about a client project - it&apos;s about this website itself. Every
            change you see here goes through a real, automated pipeline: no manual file uploads, no
            &ldquo;it works on my machine.&rdquo; Scroll down to walk through it step by step, in plain
            language.
          </p>

          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="mt-10 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
            Scroll to explore
          </motion.div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
          Built With
        </p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
          The tech stack
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-slate-600 dark:text-slate-400">
          Nothing exotic - a small set of well-understood tools, each doing one job well.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_STACK.map((tech, index) => (
            <div
              key={tech.name}
              className="group flex items-center gap-4 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#ffffff] dark:hover:shadow-[7px_7px_0px_#ffffff]"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black ${
                  index % 4 === 0
                    ? "bg-blue-600 text-white"
                    : index % 4 === 1
                      ? "bg-[#ffe600] text-black"
                      : index % 4 === 2
                        ? "bg-green-500 text-black"
                        : "bg-red-500 text-white"
                }`}
              >
                <tech.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <p className="font-mono text-sm font-black uppercase text-slate-800 dark:text-slate-100">{tech.name}</p>
                <p className="font-sans text-sm text-slate-500 dark:text-slate-400">{tech.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline timeline */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
        <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
          The Pipeline
        </p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
          From git push to live site
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-slate-600 dark:text-slate-400">
          Nine automated steps, every single time a change is pushed. Keep scrolling - the line fills
          in as you move through the flow.
        </p>

        <div ref={timelineRef} className="relative mt-16">
          <div
            className="absolute left-6 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800"
            aria-hidden
          />
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute left-6 top-2 bottom-2 w-px origin-top bg-blue-600"
            aria-hidden
          />

          <div className="flex flex-col gap-14">
            {STEPS.map((step, index) => (
              <TimelineStep key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="border-2 border-black bg-white p-8 text-center shadow-[6px_6px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[6px_6px_0px_#000000]">
          <h2 className="font-mono text-3xl font-black uppercase text-slate-800 dark:text-slate-100">Why bother with all this?</h2>
          <p className="mx-auto mt-3 max-w-2xl font-sans text-slate-600 dark:text-slate-400">
            Because a deploy should be boring. Push code, wait about two minutes, and the live site is
            either updated and healthy, or the pipeline stops and says exactly why - never a silent,
            half-broken deploy left running.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/projects" variant="primary">
              Back to Projects
            </Button>
            <Button href="/contact" variant="secondary">
              Get in Touch
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
