import type { Skill } from "@/lib/portfolio";

type SkillsChartProps = {
  skills: Skill[];
};

export default function SkillsChart({ skills }: SkillsChartProps) {
  return (
    <ul className="grid gap-4">
      {skills.map((skill) => (
        <li
          key={skill.name}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-800 dark:text-slate-100">{skill.name}</span>
            <span className="text-slate-500 dark:text-slate-400">{skill.level}%</span>
          </div>

          {/* Skill progress bars make technical strengths quickly scannable. */}
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-accent"
              style={{ width: `${skill.level}%` }}
            />
          </div>

          <p className="mt-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-500">
            {skill.category}
          </p>
        </li>
      ))}
    </ul>
  );
}
