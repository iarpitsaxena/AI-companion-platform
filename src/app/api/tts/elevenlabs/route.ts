import { NextRequest, NextResponse } from "next/server";
import { featureFlags } from "../../../../lib/feature-flags";

export const runtime = "nodejs";

const defaultVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
const defaultModelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

export async function POST(request: NextRequest) {
  if (!featureFlags.tts) {
    return NextResponse.json(
      { error: "TTS feature is disabled" },
      { status: 403 },
    );
  }

  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenLabsApiKey) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_API_KEY" },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      text?: string;
      voiceId?: string;
      modelId?: string;
    };

    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const voiceId = body.voiceId?.trim() || defaultVoiceId;
    const modelId = body.modelId?.trim() || defaultModelId;

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsApiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
          },
        }),
      },
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      return NextResponse.json({ error: errorText }, { status: 502 });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="speech.mp3"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "TTS request failed" },
      { status: 400 },
    );
  }
}
