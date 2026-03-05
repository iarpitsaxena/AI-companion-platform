import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  avatar_url: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
  traits: z.array(z.string()).optional(),
  communication_style: z.string().optional(),
  expertise_area: z.string().optional(),
  custom_prompt: z.string().nullable().optional(),
  background_story: z.string().nullable().optional(),
  relationship_type: z.string().optional(),
  tone_preference: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const payload = patchSchema.parse(body);
    const { id } = await params;

    const { data, error } = await supabase
      .from("companions")
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { error } = await supabase
      .from("companions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
