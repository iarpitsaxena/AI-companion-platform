"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { SignedLayout } from "@/components/signed-layout";
import { Companion, NoteItem, TodoItem } from "@/lib/types";

interface ConversationSummary {
  id: string;
  title: string;
}

interface DashboardStats {
  tasksCompleted: number;
  hoursSaved: number;
  productivity: number;
  streakDays: number;
  companions: number;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "ai";
  time: string;
}

const chartData = [
  { day: "Mon", productivity: 65 },
  { day: "Tue", productivity: 75 },
  { day: "Wed", productivity: 70 },
  { day: "Thu", productivity: 85 },
  { day: "Fri", productivity: 90 },
  { day: "Sat", productivity: 78 },
  { day: "Sun", productivity: 82 },
];

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    text: "Hi! I'm your AI companion. How can I help you today?",
    sender: "ai",
    time: "10:30 AM",
  },
  {
    id: 2,
    text: "Can you summarize my tasks for today?",
    sender: "user",
    time: "10:31 AM",
  },
  {
    id: 3,
    text: "You have tasks due today. Open To-Dos and I can help prioritize them.",
    sender: "ai",
    time: "10:31 AM",
  },
];

export default function DashboardPage() {
  const { user } = useUser();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [searchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const load = async () => {
    const [todosRes, notesRes, companionsRes, conversationsRes] =
      await Promise.all([
        fetch("/api/todos"),
        fetch("/api/notes"),
        fetch("/api/companions"),
        fetch("/api/conversations"),
      ]);

    const [todosJson, notesJson, companionsJson, conversationsJson] =
      await Promise.all([
        todosRes.json(),
        notesRes.json(),
        companionsRes.json(),
        conversationsRes.json(),
      ]);

    setTodos(todosJson.data ?? []);
    setNotes(notesJson.data ?? []);
    setCompanions(companionsJson.data ?? []);
    setConversations(conversationsJson.data ?? []);
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };

    run();
  }, []);

  const stats: DashboardStats = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    const total = todos.length;
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      tasksCompleted: completed,
      hoursSaved: Number((completed * 0.35).toFixed(1)),
      productivity,
      streakDays: Math.max(
        1,
        Math.min(30, completed + (conversations.length > 0 ? 2 : 0)),
      ),
      companions: companions.length,
    };
  }, [todos, conversations.length, companions.length]);

  const filteredTodos = useMemo(() => {
    if (!searchQuery.trim()) return todos;
    const term = searchQuery.toLowerCase();
    return todos.filter((todo) => todo.title.toLowerCase().includes(term));
  }, [todos, searchQuery]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const term = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term),
    );
  }, [notes, searchQuery]);

  const displayName =
    user?.firstName || user?.fullName || user?.username || "there";

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTodo.trim(), completed: false }),
    });

    setNewTodo("");
    await load();
  };

  const toggleTodo = async (todo: TodoItem) => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: todo.id,
        title: todo.title,
        completed: !todo.completed,
      }),
    });

    await load();
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    await load();
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: chatInput.trim(),
      sender: "user",
      time: now,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: Date.now() + 1,
        text: "Open Chat to continue this conversation with your active companion.",
        sender: "ai",
        time: now,
      },
    ]);

    setChatInput("");
  };

  return (
    <SignedLayout>
      <div className="text-black">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl">Welcome back, {displayName}! 👋</h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your productivity today.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/history" className="btn btn-secondary">
              Open history
            </Link>
            <Link href="/profile" className="btn btn-secondary">
              Open profile
            </Link>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <p className="mb-1 text-sm text-gray-600">Tasks Completed</p>
            <p className="text-4xl">{stats.tasksCompleted}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <p className="mb-1 text-sm text-gray-600">Hours Saved</p>
            <p className="text-4xl">{stats.hoursSaved}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <p className="mb-1 text-sm text-gray-600">Productivity</p>
            <p className="text-4xl">{stats.productivity}%</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <p className="mb-1 text-sm text-gray-600">Streak Days</p>
            <p className="text-4xl">{stats.streakDays}</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl">Today&apos;s Tasks</h2>
                <span className="text-sm text-gray-600">
                  {todos.filter((todo) => todo.completed).length} of{" "}
                  {todos.length} completed
                </span>
              </div>

              <div className="mb-6 flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(event) => setNewTodo(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTodo();
                    }
                  }}
                  placeholder="Add a new task..."
                  className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-black focus:outline-none"
                />
                <button
                  onClick={addTodo}
                  className="rounded-lg bg-black p-2 text-white hover:bg-gray-800"
                  aria-label="Add todo"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="hamburger-scrollbar max-h-96 space-y-3 overflow-y-auto">
                {filteredTodos
                  .filter((todo) =>
                    searchQuery.trim()
                      ? todo.title
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      : true,
                  )
                  .map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex items-center gap-3 rounded-lg border-2 p-4 ${
                        todo.completed
                          ? "border-gray-200 bg-gray-50"
                          : "border-gray-200 bg-white hover:border-black"
                      }`}
                    >
                      <div
                        className={`h-8 w-1 rounded-full ${
                          todo.completed ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                      <button
                        onClick={() => toggleTodo(todo)}
                        className={`flex h-6 w-6 items-center justify-center rounded border-2 ${
                          todo.completed
                            ? "border-black bg-black"
                            : "border-gray-300 hover:border-black"
                        }`}
                        aria-label="Toggle todo"
                      >
                        {todo.completed && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </button>
                      <span
                        className={`flex-1 ${
                          todo.completed
                            ? "text-gray-400 line-through"
                            : "text-black"
                        }`}
                      >
                        {todo.title}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete todo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                {filteredTodos.length === 0 && (
                  <p className="text-sm text-gray-500">No matching tasks.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="h-full rounded-xl border-2 border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl">Quick Notes</h2>
                <Link
                  href="/notes"
                  className="rounded-lg bg-black p-2 text-white hover:bg-gray-800"
                  aria-label="Open notes"
                >
                  <Plus className="h-5 w-5" />
                </Link>
              </div>

              <div className="space-y-4">
                {filteredNotes.slice(0, 3).map((note, index) => (
                  <Link
                    key={note.id}
                    href="/notes"
                    className={`block rounded-lg border-2 border-gray-200 p-4 ${
                      index === 0
                        ? "bg-yellow-100"
                        : index === 1
                          ? "bg-blue-100"
                          : "bg-pink-100"
                    }`}
                  >
                    <div className="mb-2 flex items-start gap-3">
                      <FileText className="mt-1 h-5 w-5 text-gray-700" />
                      <div className="flex-1">
                        <h3 className="mb-1">{note.title}</h3>
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {note.content || "No content"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
                {filteredNotes.length === 0 && (
                  <p className="text-sm text-gray-500">No notes yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="mb-1 text-2xl">Weekly Productivity</h2>
                <p className="text-sm text-gray-600">
                  Your productivity trend this week
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600">+12%</span>
              </div>
            </div>

            <div className="h-64 rounded-lg border border-gray-200 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                >
                  <CartesianGrid stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    width={34}
                  />
                  <Tooltip
                    cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="productivity"
                    stroke="#000000"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#000000", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#000000", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t-2 border-gray-200 pt-6 text-center">
              <div>
                <p className="text-2xl">{stats.productivity}%</p>
                <p className="text-xs text-gray-600">Avg. Score</p>
              </div>
              <div>
                <p className="text-2xl">90%</p>
                <p className="text-xs text-gray-600">Peak Day</p>
              </div>
              <div>
                <p className="text-2xl">{stats.companions}</p>
                <p className="text-xs text-gray-600">Companions</p>
              </div>
            </div>
          </div>

          <div className="flex h-125 flex-col rounded-xl border-2 border-gray-200 bg-white">
            <div className="border-b-2 border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-black p-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl">AI Chat</h2>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">Online</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hamburger-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span
                      className={`mt-1 block text-xs ${
                        message.sender === "user"
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    >
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-black focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="rounded-lg bg-black p-2 text-white hover:bg-gray-800"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SignedLayout>
  );
}
