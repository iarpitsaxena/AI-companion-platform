import { NextRequest, NextResponse } from "next/server";
import { featureFlags } from "../../../../lib/feature-flags";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!featureFlags.stt) {
    return NextResponse.json(
      { error: "STT feature is disabled" },
      { status: 403 },
    );
  }

  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramApiKey) {
    return NextResponse.json(
      { error: "Missing DEEPGRAM_API_KEY" },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "Expected multipart form field: audio" },
        { status: 400 },
      );
    }

    const model =
      formData.get("model")?.toString().trim() ||
      process.env.DEEPGRAM_MODEL ||
      "nova-3";

    const audioBuffer = await audio.arrayBuffer();
    const transcriptionResponse = await fetch(
      `https://api.deepgram.com/v1/listen?model=${encodeURIComponent(model)}&smart_format=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${deepgramApiKey}`,
          "Content-Type": audio.type || "audio/webm",
        },
        body: audioBuffer,
      },
    );

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      return NextResponse.json({ error: errorText }, { status: 502 });
    }

    const payload = (await transcriptionResponse.json()) as {
      results?: {
        channels?: Array<{
          alternatives?: Array<{ transcript?: string }>;
        }>;
      };
    };

    const transcript =
      payload.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ||
      "";

    return NextResponse.json({ transcript, provider: "deepgram", model });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "STT request failed" },
      { status: 400 },
    );
  }
}
