import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Try "images" bucket first, fall back to "logos" bucket
    let uploadError;
    let bucket = "images";

    ({ error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      }));

    if (uploadError) {
      // Fall back to logos bucket if images bucket doesn't exist yet
      bucket = "logos";
      ({ error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        }));
    }

    if (uploadError) {
      console.error("Image upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message || "Upload failed" }, { status: 500 });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (err) {
    console.error("Image upload error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
