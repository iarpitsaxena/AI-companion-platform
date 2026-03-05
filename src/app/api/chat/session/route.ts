import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const companionId = request.nextUrl.searchParams.get("companionId");

    if (!companionId) {
      return NextResponse.json(
        { error: "companionId is required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", userId)
      .eq("companion_id", companionId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }

    if (!conversation) {
      return NextResponse.json({ data: { conversation: null, messages: [] } });
    }

    const { data: messages, error: messageError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (messageError) {
      return NextResponse.json(
        { error: messageError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { conversation, messages } });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
