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
          className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]"
        >
          <div className="mb-2 flex items-center justify-between font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-500 border border-black dark:border-green-400" />
              <span className="font-bold uppercase tracking-wider text-black dark:text-white">
                {skill.name}
              </span>
            </div>
            <span className="border border-black bg-[#ffe600] px-1.5 py-0.2 font-mono text-xs font-black text-black">
              {skill.level}%
            </span>
          </div>

          {/* Solid Geometric Progress Bar (Zero Gradients) */}
          <div className="h-3 border-2 border-black bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800">
            <div
              className="h-full bg-blue-600 border-r-2 border-black dark:bg-blue-500 dark:border-black"
              style={{ width: `${skill.level}%` }}
            />
          </div>

          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {skill.category}
          </p>
        </li>
      ))}
    </ul>
  );
}
