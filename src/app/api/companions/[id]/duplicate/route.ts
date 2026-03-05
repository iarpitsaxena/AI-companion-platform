import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { data: original, error: readError } = await supabase
      .from("companions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (readError || !original) {
      return NextResponse.json(
        { error: "Companion not found" },
        { status: 404 },
      );
    }

    const {
      id: originalId,
      created_at: createdAt,
      updated_at: updatedAt,
      ...cloneBase
    } = original;

    void originalId;
    void createdAt;
    void updatedAt;

    const { data, error } = await supabase
      .from("companions")
      .insert({
        ...cloneBase,
        name: `${original.name} Copy`,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
