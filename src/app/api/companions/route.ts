import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const companionSchema = z.object({
  name: z.string().min(1),
  avatar_url: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  traits: z.array(z.string()).default([]),
  communication_style: z.string().default("casual"),
  expertise_area: z.string().default("general"),
  custom_prompt: z.string().optional().nullable(),
  background_story: z.string().optional().nullable(),
  relationship_type: z.string().default("friend"),
  tone_preference: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const userId = await requireUserId();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("companions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = companionSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("companions")
      .insert({
        ...parsed,
        user_id: userId,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 },
    );
  }
}
