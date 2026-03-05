"use client";

import { useEffect, useState } from "react";
import { SignedLayout } from "@/components/signed-layout";
import { TodoItem } from "@/lib/types";

type StatusFilter = "all" | "completed" | "pending";

export default function TodosPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>("");

  const load = async (nextStatus: StatusFilter = status) => {
    const url =
      nextStatus === "all" ? "/api/todos" : `/api/todos?status=${nextStatus}`;
    const res = await fetch(url);
    const json = await res.json();
    setTodos(json.data ?? []);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const url =
        status === "all" ? "/api/todos" : `/api/todos?status=${status}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!cancelled) {
        setTodos(json.data ?? []);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status]);

  return (
    <SignedLayout>
      <div className="mb-4">
        <h1 className="page-title">To-Do List</h1>
        <p className="page-subtitle">
          Keep small tasks visible and manageable.
        </p>
      </div>

      <div className="card flex gap-2">
        {actionError && (
          <p className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </p>
        )}
        <input
          className="input"
          placeholder="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={async () => {
            if (!title.trim()) return;
            setActionError("");
            const res = await fetch("/api/todos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: editingId ?? undefined,
                title,
                completed: false,
              }),
            });

            const json = await res.json();
            if (!res.ok) {
              setActionError(json.error ?? "Failed to save task.");
              return;
            }

            setEditingId(null);
            setTitle("");
            await load();
          }}
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        {(["all", "pending", "completed"] as StatusFilter[]).map((item) => (
          <button
            key={item}
            className={`btn ${item === status ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatus(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="card flex items-center justify-between gap-3"
          >
            <div>
              <p className={todo.completed ? "line-through muted" : ""}>
                {todo.title}
              </p>
              <p className="muted text-xs">
                {todo.completed ? "Completed" : "Pending"} ·{" "}
                {new Date(todo.updated_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  setActionError("");
                  const res = await fetch("/api/todos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: todo.id,
                      title: todo.title,
                      completed: !todo.completed,
                    }),
                  });

                  const json = await res.json();
                  if (!res.ok) {
                    setActionError(json.error ?? "Failed to update task.");
                    return;
                  }

                  await load();
                }}
              >
                Toggle
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditingId(todo.id);
                  setTitle(todo.title);
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  setActionError("");
                  const res = await fetch(`/api/todos?id=${todo.id}`, {
                    method: "DELETE",
                  });
                  const json = await res.json();
                  if (!res.ok) {
                    setActionError(json.error ?? "Failed to delete task.");
                    return;
                  }
                  await load();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {todos.length === 0 && (
          <div className="card muted">No tasks yet for this filter.</div>
        )}
      </div>
    </SignedLayout>
  );
}
