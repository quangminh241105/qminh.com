import type { Skill } from "@/lib/portfolio";
import SkillCard from "@/components/SkillCard";

type SkillsChartProps = {
  skills: Skill[];
};

export default function SkillsChart({ skills }: SkillsChartProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {skills.map((skill) => (
        <SkillCard key={skill.name} name={skill.name} category={skill.category} level={skill.level} />
      ))}
    </ul>
  );
}
