import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const userId = await requireUserId();
    const supabase = getSupabaseAdmin();

    const [{ data: conversations }, { data: messages }] = await Promise.all([
      supabase
        .from("conversations")
        .select("id, companion_id, created_at")
        .eq("user_id", userId),
      supabase
        .from("messages")
        .select("id, role, conversation_id")
        .in(
          "conversation_id",
          (
            await supabase
              .from("conversations")
              .select("id")
              .eq("user_id", userId)
          ).data?.map((item) => item.id) ?? [
            "00000000-0000-0000-0000-000000000000",
          ],
        ),
    ]);

    const totalConversations = conversations?.length ?? 0;
    const totalMessages = messages?.length ?? 0;
    const avgConversationLength =
      totalConversations > 0 ? totalMessages / totalConversations : 0;

    const perCompanion = (conversations ?? []).reduce<Record<string, number>>(
      (acc, curr) => {
        acc[curr.companion_id] = (acc[curr.companion_id] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const mostActiveCompanion =
      Object.entries(perCompanion).sort((a, b) => b[1] - a[1])[0] ?? null;

    return NextResponse.json({
      data: {
        totalConversations,
        totalMessages,
        avgConversationLength,
        mostActiveCompanion,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
