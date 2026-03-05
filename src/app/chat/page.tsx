"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignedLayout } from "@/components/signed-layout";
import { Companion } from "@/lib/types";

export default function ChatIndexPage() {
  const [companions, setCompanions] = useState<Companion[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/companions");
      const json = await res.json();
      setCompanions(json.data ?? []);
    };

    load();
  }, []);

  return (
    <SignedLayout>
      <div className="mb-5">
        <h1 className="page-title">Choose a Companion</h1>
        <p className="page-subtitle">
          Start a focused conversation with the companion that fits your goal.
        </p>
      </div>

      <div className="chat-index-grid grid gap-3 md:grid-cols-2">
        {companions.map((companion) => (
          <Link
            key={companion.id}
            href={`/chat/${companion.id}`}
            className="card chat-index-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold tracking-tight">
                  {companion.name}
                </h3>
                <p className="muted mt-1 text-sm">
                  {companion.description || "No description provided yet."}
                </p>
              </div>
              <span className="chat-index-pill">Open</span>
            </div>
          </Link>
        ))}
        {companions.length === 0 && (
          <div className="card muted">
            No companions yet. Create one in the companions page first.
          </div>
        )}
      </div>
    </SignedLayout>
  );
}
