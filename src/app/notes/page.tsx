"use client";

import { useEffect, useMemo, useState } from "react";
import { SignedLayout } from "@/components/signed-layout";
import { NoteItem } from "@/lib/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [actionError, setActionError] = useState<string>("");

  const load = async () => {
    const res = await fetch("/api/notes");
    const json = await res.json();
    setNotes(json.data ?? []);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch("/api/notes");
      const json = await res.json();
      if (!cancelled) {
        setNotes(json.data ?? []);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q),
    );
  }, [notes, query]);

  return (
    <SignedLayout>
      <div className="mb-4">
        <h1 className="page-title">Notes</h1>
        <p className="page-subtitle">Capture and organize thoughts quickly.</p>
      </div>
      <div className="card grid gap-3">
        {actionError && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </p>
        )}
        <input
          className="input"
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          className="textarea"
          placeholder="Content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!title.trim()) return;
              setActionError("");
              const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: editingId ?? undefined,
                  title,
                  content,
                }),
              });

              const json = await res.json();
              if (!res.ok) {
                setActionError(json.error ?? "Failed to save note.");
                return;
              }

              setEditingId(null);
              setTitle("");
              setContent("");
              await load();
            }}
          >
            {editingId ? "Update note" : "Create note"}
          </button>
          {editingId && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setContent("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <input
        className="input mt-4"
        placeholder="Search notes"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="mt-4 grid gap-3">
        {filtered.map((note) => (
          <div key={note.id} className="card">
            <h3 className="font-semibold">{note.title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm">{note.content}</p>
            <div className="mt-3 flex gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditingId(note.id);
                  setTitle(note.title);
                  setContent(note.content);
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  setActionError("");
                  const res = await fetch(`/api/notes?id=${note.id}`, {
                    method: "DELETE",
                  });
                  const json = await res.json();
                  if (!res.ok) {
                    setActionError(json.error ?? "Failed to delete note.");
                    return;
                  }

                  if (editingId === note.id) {
                    setEditingId(null);
                    setTitle("");
                    setContent("");
                  }

                  await load();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card muted">
            No notes found for your current search.
          </div>
        )}
      </div>
    </SignedLayout>
  );
}
