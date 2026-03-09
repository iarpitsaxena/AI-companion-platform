"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SignedLayout } from "@/components/signed-layout";
import { Companion } from "@/lib/types";

const traits = [
  "friendly",
  "professional",
  "humorous",
  "empathetic",
  "supportive",
  "creative",
];

const toneOptions = [
  "balanced",
  "warm",
  "professional",
  "encouraging",
  "direct",
  "playful",
  "calm",
] as const;

const emptyForm = {
  name: "",
  avatar_url: "",
  description: "",
  traits: ["friendly"],
  communication_style: "casual",
  expertise_area: "general",
  custom_prompt: "",
  background_story: "",
  relationship_type: "friend",
  tone_preference: "balanced",
};

export default function CompanionsPage() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [toneMode, setToneMode] = useState<string>(emptyForm.tone_preference);
  const [customTone, setCustomTone] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");

  const title = useMemo(
    () => (editingId ? "Edit companion" : "Create companion"),
    [editingId],
  );

  const load = async () => {
    const res = await fetch("/api/companions");
    const json = await res.json();
    setCompanions(json.data ?? []);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch("/api/companions");
      const json = await res.json();
      if (!cancelled) {
        setCompanions(json.data ?? []);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionError("");
    setActionSuccess("");

    const normalizedTone = toneMode === "custom" ? customTone.trim() : toneMode;

    const payload = {
      ...form,
      avatar_url: form.avatar_url || null,
      description: form.description || null,
      custom_prompt: form.custom_prompt || null,
      background_story: form.background_story || null,
      tone_preference: normalizedTone || null,
    };

    if (editingId) {
      const res = await fetch(`/api/companions/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error ?? "Failed to update companion.");
        return;
      }

      setActionSuccess("Companion updated successfully.");
    } else {
      const res = await fetch("/api/companions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error ?? "Failed to create companion.");
        return;
      }

      setActionSuccess("Companion created successfully.");
    }

    setForm(emptyForm);
    setToneMode(emptyForm.tone_preference);
    setCustomTone("");
    setEditingId(null);
    await load();
  };

  const startEdit = (companion: Companion) => {
    const tone = (companion.tone_preference ?? "").trim();
    const isPresetTone = toneOptions.includes(
      tone as (typeof toneOptions)[number],
    );

    setEditingId(companion.id);
    setForm({
      name: companion.name,
      avatar_url: companion.avatar_url ?? "",
      description: companion.description ?? "",
      traits: companion.traits,
      communication_style: companion.communication_style,
      expertise_area: companion.expertise_area,
      custom_prompt: companion.custom_prompt ?? "",
      background_story: companion.background_story ?? "",
      relationship_type: companion.relationship_type,
      tone_preference: tone,
    });
    setToneMode(isPresetTone ? tone : "custom");
    setCustomTone(isPresetTone ? "" : tone);
  };

  return (
    <SignedLayout>
      <div className="mb-4">
        <h1 className="page-title">Companions</h1>
        <p className="page-subtitle">
          Create and tune companion personalities for more meaningful chats.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium">Available companions</h2>
        <div className="hamburger-scrollbar grid max-h-[62vh] gap-3 overflow-y-auto pr-1">
          {companions.map((companion) => (
            <div key={companion.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{companion.name}</h3>
                  <p className="muted text-sm">{companion.description}</p>
                  <p className="muted mt-1 text-xs">
                    Traits: {companion.traits.join(", ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/chat/${companion.id}`}
                    className="btn btn-primary"
                  >
                    Chat
                  </Link>
                  <button
                    className="btn btn-secondary"
                    onClick={() => startEdit(companion)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      await fetch(`/api/companions/${companion.id}/duplicate`, {
                        method: "POST",
                      });
                      await load();
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      await fetch(`/api/companions/${companion.id}`, {
                        method: "DELETE",
                      });
                      await load();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {companions.length === 0 && (
            <div className="card muted">
              No companions yet. Create your first companion in the form below.
            </div>
          )}
        </div>
      </section>

      <form className="card mt-6 grid gap-3" onSubmit={submit}>
        <h2 className="text-lg font-medium">{title}</h2>
        {actionError && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </p>
        )}
        {actionSuccess && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {actionSuccess}
          </p>
        )}
        <label className="text-sm font-medium" htmlFor="companion-name">
          Companion name
        </label>
        <input
          id="companion-name"
          className="input"
          placeholder="Companion name"
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          required
        />
        <label className="text-sm font-medium" htmlFor="avatar-url">
          Avatar URL
        </label>
        <input
          id="avatar-url"
          className="input"
          placeholder="Avatar URL"
          value={form.avatar_url}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, avatar_url: event.target.value }))
          }
        />
        <label className="text-sm font-medium" htmlFor="short-description">
          Short description
        </label>
        <input
          id="short-description"
          className="input"
          placeholder="Short description"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="communication-style">
              Communication style
            </label>
            <select
              id="communication-style"
              className="select"
              value={form.communication_style}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  communication_style: event.target.value,
                }))
              }
            >
              {["casual", "formal", "enthusiastic", "calm", "playful"].map(
                (item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="expertise-area">
              Expertise area
            </label>
            <select
              id="expertise-area"
              className="select"
              value={form.expertise_area}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  expertise_area: event.target.value,
                }))
              }
            >
              {["general", "tech", "lifestyle", "wellness", "education"].map(
                (item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <label className="text-sm font-medium" htmlFor="relationship-type">
          Relationship type
        </label>
        <select
          id="relationship-type"
          className="select"
          value={form.relationship_type}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              relationship_type: event.target.value,
            }))
          }
        >
          {["friend", "mentor", "assistant", "coach"].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <p className="text-sm font-medium">Personality traits</p>
        <div className="grid gap-2 md:grid-cols-3">
          {traits.map((trait) => {
            const selected = form.traits.includes(trait);
            return (
              <button
                key={trait}
                type="button"
                className={`btn ${selected ? "btn-primary" : "btn-secondary"}`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    traits: selected
                      ? prev.traits.filter((item) => item !== trait)
                      : [...prev.traits, trait],
                  }))
                }
              >
                {trait}
              </button>
            );
          })}
        </div>

        <label className="text-sm font-medium" htmlFor="background-story">
          Background story
        </label>
        <textarea
          id="background-story"
          className="textarea"
          placeholder="Background story"
          value={form.background_story}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              background_story: event.target.value,
            }))
          }
        />
        <label className="text-sm font-medium" htmlFor="custom-system-prompt">
          Custom system prompt
        </label>
        <textarea
          id="custom-system-prompt"
          className="textarea"
          placeholder="Custom system prompt"
          value={form.custom_prompt}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, custom_prompt: event.target.value }))
          }
        />
        <label className="text-sm font-medium" htmlFor="tone-preference">
          Tone preference
        </label>
        <select
          id="tone-preference"
          className="select"
          value={toneMode}
          onChange={(event) =>
            setToneMode(event.target.value)
          }
        >
          {toneOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          <option value="custom">custom</option>
        </select>
        {toneMode === "custom" && (
          <input
            id="tone-preference-custom"
            className="input"
            placeholder="Enter custom tone"
            value={customTone}
            onChange={(event) => setCustomTone(event.target.value)}
          />
        )}

        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit">
            {editingId ? "Save changes" : "Create companion"}
          </button>
          {editingId && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setToneMode(emptyForm.tone_preference);
                setCustomTone("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </SignedLayout>
  );
}
