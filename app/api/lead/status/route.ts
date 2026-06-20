import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { leadId, status } = await req.json();
  if (!leadId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await supabase.from("leads").update({ status }).eq("id", leadId);
  return NextResponse.json({ ok: true });
}
