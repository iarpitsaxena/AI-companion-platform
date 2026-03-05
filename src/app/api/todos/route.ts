import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  completed: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const status = request.nextUrl.searchParams.get("status");
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (status === "completed") {
      query = query.eq("completed", true);
    }

    if (status === "pending") {
      query = query.eq("completed", false);
    }

    const { data, error } = await query;

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
        .from("todos")
        .update({
          title: parsed.title,
          completed: parsed.completed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.id)
        .eq("user_id", userId)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    const { data, error } = await supabase
      .from("todos")
      .insert({
        title: parsed.title,
        completed: parsed.completed,
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
      .from("todos")
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
