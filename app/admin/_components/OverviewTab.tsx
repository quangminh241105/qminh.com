"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PortfolioContent } from "@/lib/portfolio-db";

type HealthState =
  | { status: "loading" }
  | { status: "ok"; database: string }
  | { status: "error"; message: string };

export function OverviewTab({ portfolio }: { portfolio: PortfolioContent }) {
  const [health, setHealth] = useState<HealthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health/db")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setHealth({ status: "ok", database: data.database });
        } else {
          setHealth({ status: "error", message: data.message ?? "Unknown error" });
        }
      })
      .catch((err) => {
        if (!cancelled) setHealth({ status: "error", message: err instanceof Error ? err.message : "Request failed" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = [
    { label: "Skills", value: portfolio.skills.length },
    { label: "Projects", value: portfolio.projects.length },
    { label: "Testimonials", value: portfolio.testimonials.length },
    { label: "Articles", value: portfolio.articles.length },
    { label: "Resume entries", value: portfolio.resume.length },
  ];

  return (
    <div className="grid gap-6">
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Database status</h3>
          {health.status === "loading" ? <Badge>Checking…</Badge> : null}
          {health.status === "ok" ? <Badge variant="success">Connected · {health.database}</Badge> : null}
          {health.status === "error" ? <Badge variant="danger">Unreachable</Badge> : null}
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Content is currently served from{" "}
          <Badge variant={portfolio.source === "db" ? "brand" : "default"}>{portfolio.source}</Badge>.
          {portfolio.source === "fallback"
            ? " MongoDB was unreachable, so the site is showing the static content from lib/portfolio.ts."
            : ""}
        </p>
        {health.status === "error" ? (
          <p className="mt-2 text-xs text-rose-600">{health.message}</p>
        ) : null}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Quick stats</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {counts.map((item) => (
            <div key={item.label} className="rounded-xl bg-card px-4 py-3 text-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{item.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
