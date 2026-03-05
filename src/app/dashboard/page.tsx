"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignedLayout } from "@/components/signed-layout";
import { Companion } from "@/lib/types";

interface DashboardCounts {
  companions: number;
  notes: number;
  todos: number;
  conversations: number;
}

export default function DashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>({
    companions: 0,
    notes: 0,
    todos: 0,
    conversations: 0,
  });
  const [companions, setCompanions] = useState<Companion[]>([]);

  useEffect(() => {
    const load = async () => {
      const [companions, notes, todos, conversations] = await Promise.all([
        fetch("/api/companions").then((r) => r.json()),
        fetch("/api/notes").then((r) => r.json()),
        fetch("/api/todos").then((r) => r.json()),
        fetch("/api/conversations").then((r) => r.json()),
      ]);

      setCounts({
        companions: companions.data?.length ?? 0,
        notes: notes.data?.length ?? 0,
        todos: todos.data?.length ?? 0,
        conversations: conversations.data?.length ?? 0,
      });

      setCompanions(companions.data ?? []);
    };

    load();
  }, []);

  return (
    <SignedLayout>
      <div className="mb-6">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Your companion activity, memory, and productivity in one view.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="stat-card dashboard-stat">
          <p className="text-sm muted">Companions</p>
          <p className="text-2xl font-bold">{counts.companions}</p>
        </div>
        <div className="stat-card dashboard-stat">
          <p className="text-sm muted">Notes</p>
          <p className="text-2xl font-bold">{counts.notes}</p>
        </div>
        <div className="stat-card dashboard-stat">
          <p className="text-sm muted">To-Dos</p>
          <p className="text-2xl font-bold">{counts.todos}</p>
        </div>
        <div className="stat-card dashboard-stat">
          <p className="text-sm muted">Conversations</p>
          <p className="text-2xl font-bold">{counts.conversations}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Link className="card dashboard-link" href="/companions">
          <p className="font-semibold">Companions</p>
          <p className="muted text-sm">Create or edit companion profiles.</p>
        </Link>
        <Link className="card dashboard-link" href="/notes">
          <p className="font-semibold">Notes</p>
          <p className="muted text-sm">Capture ideas and persistent memory.</p>
        </Link>
        <Link className="card dashboard-link" href="/todos">
          <p className="font-semibold">To-Dos</p>
          <p className="muted text-sm">Track tasks and completion status.</p>
        </Link>
      </div>

      <div className="dashboard-chat-zone mt-6 rounded-2xl border border-(--border) p-4 md:p-5">
        <h2 className="text-lg font-semibold">Start chat with a companion</h2>
        <p className="muted text-sm">
          Open a chat directly from your dashboard.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {companions.map((companion) => (
            <Link
              key={companion.id}
              href={`/chat/${companion.id}`}
              className="card dashboard-chat-card"
            >
              <p className="font-semibold">{companion.name}</p>
              <p className="muted text-sm">
                {companion.description || "No description"}
              </p>
              <span className="mt-2 inline-block text-sm font-medium tracking-wide text-(--primary)">
                Open chat →
              </span>
            </Link>
          ))}
          {companions.length === 0 && (
            <div className="card muted">
              No companions yet. Create one to start chatting.
            </div>
          )}
        </div>
      </div>
    </SignedLayout>
  );
}
