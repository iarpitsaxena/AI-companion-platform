import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "../../../../lib/auth";
import { getSupabaseAdmin } from "../../../../lib/supabase";
import { featureFlags } from "../../../../lib/feature-flags";
import {
  queryChromaMemories,
  storeChromaMemories,
} from "../../../../lib/chroma-memory";
import {
  executeTaskCommand,
  extractEmbeddedCommand,
} from "../../../../lib/chat/task-commands";
import {
  buildMemoryPrompt,
  buildSystemPrompt,
} from "../../../../lib/chat/prompt-builders";

const bodySchema = z.object({
  companionId: z.string().uuid(),
  content: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const payload = bodySchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    const { data: companion, error: companionError } = await supabase
      .from("companions")
      .select("*")
      .eq("id", payload.companionId)
      .eq("user_id", userId)
      .single();

    if (companionError || !companion) {
      return NextResponse.json(
        { error: "Companion not found" },
        { status: 404 },
      );
    }

    let conversationId = "";
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("companion_id", payload.companionId)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingConversation?.id) {
      conversationId = existingConversation.id;
    } else {
      const { data: createdConversation, error: createConversationError } =
        await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            companion_id: payload.companionId,
            title: payload.content.slice(0, 60),
          })
          .select("id")
          .single();

      if (createConversationError || !createdConversation) {
        return NextResponse.json(
          {
            error:
              createConversationError?.message ??
              "Failed to create conversation",
          },
          { status: 500 },
        );
      }

      conversationId = createdConversation.id;
    }

    const { error: userInsertError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: payload.content,
    });

    if (userInsertError) {
      return NextResponse.json(
        { error: userInsertError.message },
        { status: 500 },
      );
    }

    const persistAssistantMessage = async (content: string) => {
      const { data: savedAssistant, error: assistantError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role: "assistant",
          content,
        })
        .select("*")
        .single();

      if (assistantError || !savedAssistant) {
        throw new Error(assistantError?.message ?? "Failed to save message");
      }

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)
        .eq("user_id", userId);

      return savedAssistant;
    };

    let taskCommandResult = await executeTaskCommand(
      supabase,
      userId,
      payload.content,
    );

    const { data: memory } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(20);

    const history = (memory ?? []).reverse();

    const memorySnippets = featureFlags.chromaMemory
      ? await queryChromaMemories({
          userId,
          companionId: payload.companionId,
          text: payload.content,
          limit: 5,
        })
      : [];

    const memoryPrompt = buildMemoryPrompt(memorySnippets);

    const groqApiKey = process.env.GROQ_API_KEY;
    const groqModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY" },
        { status: 500 },
      );
    }

    const llmRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: buildSystemPrompt(companion),
            },
            ...(memoryPrompt
              ? [
                  {
                    role: "system",
                    content: memoryPrompt,
                  },
                ]
              : []),
            ...(taskCommandResult
              ? [
                  {
                    role: "system",
                    content: taskCommandResult,
                  },
                ]
              : []),
            ...history,
          ],
        }),
      },
    );

    if (!llmRes.ok) {
      const text = await llmRes.text();
      return NextResponse.json({ error: text }, { status: 502 });
    }

    const json = await llmRes.json();
    let assistantMessage = json.choices?.[0]?.message?.content as
      | string
      | undefined;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 502 },
      );
    }

    if (!taskCommandResult) {
      const embeddedCommand = extractEmbeddedCommand(assistantMessage);
      if (embeddedCommand) {
        taskCommandResult = await executeTaskCommand(
          supabase,
          userId,
          embeddedCommand,
        );

        if (taskCommandResult?.startsWith("Task action successful")) {
          assistantMessage = `${assistantMessage}\n\n${taskCommandResult}`;
        }
      }
    }

    const savedAssistant = await persistAssistantMessage(assistantMessage);

    if (featureFlags.chromaMemory) {
      await storeChromaMemories({
        userId,
        companionId: payload.companionId,
        conversationId,
        messages: [
          {
            id: `u-${Date.now()}`,
            role: "user",
            content: payload.content,
            createdAt: new Date().toISOString(),
          },
          {
            id: savedAssistant.id,
            role: "assistant",
            content: assistantMessage,
            createdAt: savedAssistant.created_at,
          },
        ],
      });
    }

    return NextResponse.json({
      conversationId,
      message: savedAssistant,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 },
    );
  }
}
