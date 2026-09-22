import type { Metadata } from "next";
import PipelineContent from "./_components/PipelineContent";

export const metadata: Metadata = {
  title: "How qminh.com Ships Itself | Quang Minh",
  description:
    "An interactive walkthrough of the real CI/CD pipeline, tech stack, and infrastructure behind this website.",
};

export default function QminhFlowPage() {
  return <PipelineContent />;
}
