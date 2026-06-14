import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { themes } from "@/app/components/GeneratedSite";
import LeadForm from "@/app/components/LeadForm";

export const dynamic = "force-dynamic";

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: submission } = await supabase
    .from("onboarding_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (!submission) notFound();

  const photos: string[] = submission.project_photos || [];
  if (photos.length === 0) notFound();

  const theme = themes[submission.template as string] || themes.classic;
  const businessName = submission.business_name || "Your Business";
  const phone = submission.phone || "";
  const email = submission.email || "";

  return (
    <div style={{ background: theme.bg, color: theme.text }} className="min-h-screen font-sans antialiased">
      {/* NAV */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ borderColor: `${theme.text}10`, background: theme.navBg }}>
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <a href={`/site/${id}`} className="text-lg font-extrabold tracking-tight">{businessName}</a>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium" style={{ color: theme.muted }}>
            <a href={`/site/${id}#about`} className="hover:opacity-70 transition-opacity">About</a>
            <a href={`/site/${id}#services`} className="hover:opacity-70 transition-opacity">We offer</a>
            <a href={`/site/${id}/work`} className="hover:opacity-70 transition-opacity">Our Work</a>
            <a href={`/site/${id}#contact`} className="hover:opacity-70 transition-opacity">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            {email && (
              <a
                href={`mailto:${email}`}
                className="hidden md:inline text-sm font-semibold hover:opacity-70 transition-opacity"
                style={{ color: theme.muted }}
              >
                {email}
              </a>
            )}
            <a
              href={`tel:${phone}`}
              style={{ background: theme.accent, color: theme.accentText }}
              className="text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
            >
              {phone}
            </a>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="py-20 px-6 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>Our work</div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Recent projects from {businessName}</h1>
      </section>

      {/* GALLERY */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {photos.map((url, i) => (
            <div key={i} className="rounded-2xl overflow-hidden aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${businessName} project ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="py-20 px-6" style={{ background: theme.card }}>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Like what you see?</h2>
            <p className="text-base" style={{ color: theme.muted }}>Get in touch and let&apos;s talk about your project.</p>
          </div>
          <LeadForm
            siteId={id}
            accent={theme.accent}
            accentText={theme.accentText}
            textColor={theme.text}
            mutedColor={theme.muted}
            cardBg={theme.bg}
            borderColor={`${theme.text}14`}
          />
        </div>
      </section>

      <footer className="py-10 px-6 border-t text-center" style={{ borderColor: `${theme.text}10` }}>
        <p className="text-xs" style={{ color: theme.muted }}>
          Website by PietPilot · © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
