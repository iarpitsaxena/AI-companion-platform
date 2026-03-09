"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { SignedLayout } from "@/components/signed-layout";

interface ConversationRow {
  id: string;
  companion_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  companions?: { name?: string };
}

interface MessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function HistoryPage() {
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [query, setQuery] = useState("");
  const [companionFilter, setCompanionFilter] = useState("all");

  const load = async () => {
    const res = await fetch("/api/conversations");
    const json = await res.json();
    setRows(json.data ?? []);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch("/api/conversations");
      const json = await res.json();
      if (!cancelled) {
        setRows(json.data ?? []);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const companionOptions = useMemo(() => {
    return Array.from(
      new Set(rows.map((row) => row.companions?.name).filter(Boolean)),
    ) as string[];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesQuery = row.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCompanion =
        companionFilter === "all" || row.companions?.name === companionFilter;
      return matchesQuery && matchesCompanion;
    });
  }, [rows, query, companionFilter]);

  const getMessages = async (conversationId: string): Promise<MessageRow[]> => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    const json = await res.json();
    return json.data ?? [];
  };

  const exportConversation = async (
    row: ConversationRow,
    format: "txt" | "json" | "pdf",
  ) => {
    const messages = await getMessages(row.id);

    if (format === "json") {
      const blob = new Blob([JSON.stringify({ row, messages }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${row.title || "conversation"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (format === "txt") {
      const text = messages
        .map((message) => `[${message.role}] ${message.content}`)
        .join("\n\n");
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${row.title || "conversation"}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const doc = new jsPDF();
    let y = 10;
    doc.text(row.title || "Conversation", 10, y);
    y += 8;

    for (const message of messages) {
      const lines = doc.splitTextToSize(
        `${message.role}: ${message.content}`,
        180,
      );
      doc.text(lines, 10, y);
      y += lines.length * 6;

      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    }

    doc.save(`${row.title || "conversation"}.pdf`);
  };

  return (
    <SignedLayout>
      <div className="mb-4">
        <h1 className="page-title">Conversation History</h1>
        <p className="page-subtitle">
          Revisit chats, search by title, and export what matters.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <input
          className="input"
          placeholder="Search by title"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="select"
          value={companionFilter}
          onChange={(event) => setCompanionFilter(event.target.value)}
        >
          <option value="all">All companions</option>
          {companionOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="hamburger-scrollbar mt-4 grid max-h-[62vh] gap-3 overflow-y-auto pr-1">
        {filtered.map((row) => (
          <div key={row.id} className="card">
            <h3 className="font-semibold">{row.title || "Untitled"}</h3>
            <p className="muted text-sm">
              {row.companions?.name ?? "Unknown companion"} ·{" "}
              {new Date(row.updated_at).toLocaleString()}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => exportConversation(row, "txt")}
              >
                Export TXT
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => exportConversation(row, "json")}
              >
                Export JSON
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => exportConversation(row, "pdf")}
              >
                Export PDF
              </button>
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  await fetch(`/api/conversations?id=${row.id}`, {
                    method: "DELETE",
                  });
                  await load();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card muted">No conversations match your filters.</div>
        )}
      </div>
    </SignedLayout>
  );
}
