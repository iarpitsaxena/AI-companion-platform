import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  content: z.string().default(""),
});

export async function GET() {
  try {
    const userId = await requireUserId();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("notes")
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
    const parsed = schema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    if (parsed.id) {
      const { data, error } = await supabase
        .from("notes")
        .update({
          title: parsed.title,
          content: parsed.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.id)
        .eq("user_id", userId)
        .select("*")
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json(
          { error: "Note not found. It may have been deleted." },
          { status: 404 },
        );
      }

      return NextResponse.json({ data });
    }

    const { data, error } = await supabase
      .from("notes")
      .insert({
        title: parsed.title,
        content: parsed.content,
        user_id: userId,
      })
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

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("notes")
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
