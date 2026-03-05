const toBool = (v: string | undefined, fallback = false) => {
  if (v == null) return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
};

export const featureFlags = {
  stt: toBool(process.env.FEATURE_STT, true),
  tts: toBool(process.env.FEATURE_TTS, true),
  voiceChat: toBool(process.env.FEATURE_VOICE_CHAT, true),
  chromaMemory: toBool(process.env.FEATURE_CHROMA_MEMORY, true),
};
