import { createClient } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Skip known routes
  const reserved = ["api", "dashboard", "onboarding", "site", "leads", "ads", "profile", "login", "contact"];
  if (reserved.includes(slug)) notFound();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("onboarding_submissions")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!data) notFound();

  redirect(`/site/${data.id}`);
}
