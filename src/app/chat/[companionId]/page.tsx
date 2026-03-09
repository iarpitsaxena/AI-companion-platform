"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { SignedLayout } from "@/components/signed-layout";
import { Message } from "@/lib/types";
import { getSupabaseBrowser } from "@/lib/supabase";

interface SessionData {
  conversation: { id: string } | null;
  messages: Message[];
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M3 11.5 20.5 3l-5 18-3.5-7-9-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <rect
        x="9"
        y="9"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="5"
        y="5"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="m5 12 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <rect
        x="9"
        y="3"
        width="6"
        height="11"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6 11.5a6 6 0 1 0 12 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 17.5V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  );
}

function VolumeOnIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 10h4l5-4v12l-5-4H4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M17 9c1.4 1.4 1.4 4.6 0 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M19.5 6.5c2.8 2.8 2.8 8.2 0 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 10h4l5-4v12l-5-4H4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m17 9 4 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m21 9-4 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path d="m8 6 10 6-10 6z" fill="currentColor" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M3 13h2l1.5-4 3 9 2.5-7 1.5 2H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 10.5a2 2 0 1 1 0 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 7V5h6v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 7l1 12h6l1-12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 animate-spin"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
        opacity="0.3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ChatPage() {
  const params = useParams<{ companionId: string }>();
  const companionId = params.companionId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null,
  );
  const [audioOutputEnabled, setAudioOutputEnabled] = useState(false);
  const [voiceError, setVoiceError] = useState<string>("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const isSttEnabled = process.env.NEXT_PUBLIC_FEATURE_STT !== "false";
  const isTtsEnabled = process.env.NEXT_PUBLIC_FEATURE_TTS !== "false";

  const scrollToEnd = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

  const loadSession = async () => {
    const res = await fetch(`/api/chat/session?companionId=${companionId}`);
    const json = await res.json();
    const data: SessionData = json.data;
    setConversationId(data.conversation?.id ?? null);
    setMessages(data.messages ?? []);
    setTimeout(scrollToEnd, 50);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch(`/api/chat/session?companionId=${companionId}`);
      const json = await res.json();
      const data: SessionData = json.data;
      if (!cancelled) {
        setConversationId(data.conversation?.id ?? null);
        setMessages(data.messages ?? []);
        setTimeout(scrollToEnd, 50);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [companionId]);

  useEffect(() => {
    if (!conversationId) return;

    const supabaseBrowser = getSupabaseBrowser();

    const channel = supabaseBrowser
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(scrollToEnd, 50);
        },
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [conversationId]);

  const playTts = async (text: string, messageId?: string) => {
    if (!isTtsEnabled || !text.trim()) {
      return;
    }

    try {
      setVoiceError("");
      if (messageId) {
        setSpeakingMessageId(messageId);
      }

      const response = await fetch("/api/tts/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const json = await response.json();
        setVoiceError(json.error ?? "Failed to synthesize voice.");
        if (messageId) {
          setSpeakingMessageId((prev) => (prev === messageId ? null : prev));
        }
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (messageId) {
          setSpeakingMessageId((prev) => (prev === messageId ? null : prev));
        }
      };

      await audio.play();
    } catch {
      setVoiceError("Unable to play voice response.");
      if (messageId) {
        setSpeakingMessageId((prev) => (prev === messageId ? null : prev));
      }
    }
  };

  const sendContent = async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isLoading) return;

    const optimisticId = `local-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      conversation_id: conversationId ?? "",
      role: "user",
      content: trimmedContent,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(scrollToEnd, 0);

    setIsLoading(true);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companionId,
          content: trimmedContent,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMessages((prev) =>
          prev.filter((message) => message.id !== optimisticId),
        );
        setVoiceError(json.error ?? "Failed to send message.");
        return;
      }

      if (json.conversationId) {
        setConversationId(json.conversationId);
      }

      await loadSession();

      if (
        audioOutputEnabled &&
        isTtsEnabled &&
        json.message?.role === "assistant"
      ) {
        await playTts(json.message.content, json.message.id);
      }
    } catch {
      setMessages((prev) =>
        prev.filter((message) => message.id !== optimisticId),
      );
      setVoiceError("Failed to send message.");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput("");
    await sendContent(currentInput);
  };

  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId((prev) => (prev === messageId ? null : prev));
      }, 1200);
    } catch {
      setCopiedMessageId(null);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    try {
      setVoiceError("");
      setIsTranscribing(true);

      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const response = await fetch("/api/stt/deepgram", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        setVoiceError(json.error ?? "Failed to transcribe audio.");
        return;
      }

      if (json.transcript) {
        await sendContent(json.transcript);
      }
    } catch {
      setVoiceError("Failed to transcribe audio.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
  };

  const startRecording = async () => {
    if (!isSttEnabled) {
      return;
    }

    try {
      setVoiceError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });

        if (audioBlob.size > 0) {
          await transcribeAudio(audioBlob);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setVoiceError("Microphone permission denied or unavailable.");
      setIsRecording(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    await startRecording();
  };

  const speakMessage = async (messageId: string, text: string) => {
    await playTts(text, messageId);
  };

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <SignedLayout mainScrollable={false} mainClassName="overflow-hidden p-0">
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mb-2 shrink-0 px-3 pt-3">
          <h1 className="page-title">Chat</h1>
          <p className="page-subtitle">
            Focused conversation with memory, voice, and task actions.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3 pb-3">
          <div
            ref={messagesContainerRef}
            className="card chat-window hamburger-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
          >
            {voiceError && (
              <p className="mb-2 rounded-md border border-(--border) bg-(--surface-soft) px-3 py-2 text-sm">
                {voiceError}
              </p>
            )}
            {messages.length === 0 && (
              <p className="muted">Start a conversation with your companion.</p>
            )}
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-bubble w-fit max-w-[80%] wrap-break-word whitespace-pre-wrap rounded-xl p-3 ${
                    message.role === "user"
                      ? "chat-bubble-user ml-auto"
                      : "chat-bubble-assistant"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                      {message.role === "user" ? "You" : "Companion"}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon-sm"
                        onClick={() => copyMessage(message.id, message.content)}
                        title={
                          copiedMessageId === message.id ? "Copied" : "Copy"
                        }
                        aria-label={
                          copiedMessageId === message.id ? "Copied" : "Copy"
                        }
                      >
                        {copiedMessageId === message.id ? (
                          <CheckIcon />
                        ) : (
                          <CopyIcon />
                        )}
                        <span className="sr-only">
                          {copiedMessageId === message.id ? "Copied" : "Copy"}
                        </span>
                      </button>
                      {isTtsEnabled && message.role === "assistant" && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon-sm"
                          onClick={() =>
                            speakMessage(message.id, message.content)
                          }
                          disabled={speakingMessageId === message.id}
                          title={
                            speakingMessageId === message.id
                              ? "Speaking"
                              : "Listen"
                          }
                          aria-label={
                            speakingMessageId === message.id
                              ? "Speaking"
                              : "Listen"
                          }
                        >
                          {speakingMessageId === message.id ? (
                            <WaveIcon />
                          ) : (
                            <PlayIcon />
                          )}
                          <span className="sr-only">
                            {speakingMessageId === message.id
                              ? "Speaking"
                              : "Listen"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            {isTyping && (
              <p className="chat-typing muted mt-3 text-sm">
                Companion is typing...
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={send}
            className="chat-composer flex shrink-0 gap-2 p-2"
          >
            <input
              className="input chat-input"
              placeholder="Type your message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button
              className="btn btn-primary btn-icon"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <LoaderIcon /> : <SendIcon />}
              <span className="sr-only">Send</span>
            </button>
            {isSttEnabled && (
              <button
                type="button"
                className={`btn btn-icon ${isRecording ? "btn-primary" : "btn-secondary"}`}
                onClick={toggleRecording}
                disabled={isTranscribing}
                title={
                  isRecording
                    ? "Stop microphone"
                    : isTranscribing
                      ? "Transcribing"
                      : "Use microphone"
                }
                aria-label={
                  isRecording
                    ? "Stop microphone"
                    : isTranscribing
                      ? "Transcribing"
                      : "Use microphone"
                }
              >
                {isRecording ? (
                  <StopIcon />
                ) : isTranscribing ? (
                  <LoaderIcon />
                ) : (
                  <MicIcon />
                )}
                <span className="sr-only">
                  {isRecording
                    ? "Stop microphone"
                    : isTranscribing
                      ? "Transcribing"
                      : "Use microphone"}
                </span>
              </button>
            )}
            {isTtsEnabled && (
              <button
                type="button"
                className={`btn btn-icon ${audioOutputEnabled ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setAudioOutputEnabled((prev) => !prev)}
                title={audioOutputEnabled ? "Audio on" : "Audio off"}
                aria-label={audioOutputEnabled ? "Audio on" : "Audio off"}
              >
                {audioOutputEnabled ? <VolumeOnIcon /> : <VolumeOffIcon />}
                <span className="sr-only">
                  {audioOutputEnabled ? "Audio on" : "Audio off"}
                </span>
              </button>
            )}
          </form>

          <button
            className="btn btn-secondary btn-icon shrink-0"
            title="Clear chat history"
            aria-label="Clear chat history"
            onClick={async () => {
              if (!conversationId) return;
              await fetch(`/api/conversations?id=${conversationId}`, {
                method: "DELETE",
              });
              setConversationId(null);
              setMessages([]);
            }}
          >
            <TrashIcon />
            <span className="sr-only">Clear chat history</span>
          </button>

          <div className="card chat-help shrink-0">
            <p className="text-sm font-semibold">
              Task commands (for companion actions)
            </p>
            <p className="muted mt-1 text-xs">
              note add | title | content · note update | id-or-title |
              new-content · note delete | id-or-title
            </p>
            <p className="muted mt-1 text-xs">
              todo add | title · todo update | id-or-title | new-title · todo
              complete | id-or-title · todo reopen | id-or-title · todo delete |
              id-or-title
            </p>
            <p className="muted mt-2 text-xs">
              Also works with natural phrases like: “add todo buy milk”,
              “complete task buy milk”, “delete note meeting notes”.
            </p>
          </div>
        </div>
      </div>
    </SignedLayout>
  );
}
