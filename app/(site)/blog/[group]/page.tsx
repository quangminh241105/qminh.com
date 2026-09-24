import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ group: string }>;
};

export default async function BlogGroupPage({ params }: PageProps) {
  const { group: groupSlug } = await params;
  redirect(`/blog?group=${encodeURIComponent(groupSlug)}`);
}
