"use client";

import { useEffect, useState } from "react";
import { SignedLayout } from "@/components/signed-layout";

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  avgConversationLength: number;
  mostActiveCompanion: [string, number] | null;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      setData(json.data ?? null);
    };

    load();
  }, []);

  return (
    <SignedLayout>
      <div className="mb-4">
        <h1 className="page-title">Conversation Analytics</h1>
        <p className="page-subtitle">
          Track engagement and usage trends over time.
        </p>
      </div>

      {!data && <div className="card">Loading analytics...</div>}

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="stat-card">
            <p className="muted text-sm">Total conversations</p>
            <p className="text-2xl font-bold">{data.totalConversations}</p>
          </div>
          <div className="stat-card">
            <p className="muted text-sm">Total messages</p>
            <p className="text-2xl font-bold">{data.totalMessages}</p>
          </div>
          <div className="stat-card">
            <p className="muted text-sm">Average conversation length</p>
            <p className="text-2xl font-bold">
              {data.avgConversationLength.toFixed(2)}
            </p>
          </div>
          <div className="stat-card">
            <p className="muted text-sm">Most active companion ID</p>
            <p className="text-2xl font-bold">
              {data.mostActiveCompanion?.[0] ?? "N/A"}
            </p>
          </div>
        </div>
      )}
    </SignedLayout>
  );
}
