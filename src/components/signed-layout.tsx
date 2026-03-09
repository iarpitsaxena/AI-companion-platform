"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import {
  Bell,
  FileText,
  History,
  LayoutDashboard,
  ListTodo,
  Menu,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
  User,
  X,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companions", label: "Companions", icon: Sparkles },
  { href: "/todos", label: "Todo Lists", icon: ListTodo },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/history", label: "History", icon: History },
  { href: "/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
];

export function SignedLayout({
  children,
  showNav = true,
  mainScrollable = true,
  mainClassName,
}: {
  children: ReactNode;
  showNav?: boolean;
  mainScrollable?: boolean;
  mainClassName?: string;
}) {
  const { isLoaded, userId } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isCompanionChatRoute = pathname.startsWith("/chat/");
  const shouldMainScroll = isCompanionChatRoute ? false : mainScrollable;
  const shouldSidebarScroll = !isCompanionChatRoute;

  useEffect(() => {
    if (!isCompanionChatRoute) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [isCompanionChatRoute]);

  if (!isLoaded) {
    return (
      <div className="app-shell py-8 muted">Loading your workspace...</div>
    );
  }

  if (!userId) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        <div className="card w-full">
          <h1 className="text-2xl font-bold">Sign in required</h1>
          <p className="muted mt-2">
            Please sign in to access your AI companion workspace.
          </p>
          <div className="mt-4">
            <Link href="/sign-in" className="btn btn-primary">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mainClasses = [
    "flex h-full min-h-0 flex-col",
    shouldMainScroll
      ? "hamburger-scrollbar overflow-y-auto"
      : "overflow-hidden overscroll-none",
    mainClassName ?? "p-6",
  ].join(" ");

  return showNav ? (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-black">
      <button
        type="button"
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="Close menu"
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col overflow-hidden bg-black text-white transition-all duration-200 md:static md:translate-x-0 ${
          isSidebarCollapsed ? "md:w-20" : "md:w-64"
        } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-b border-gray-800 p-6">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 ${isSidebarCollapsed ? "md:justify-center" : ""}`}
          >
            <div className="rounded-lg bg-white p-2">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <span
              className={`text-xl ${isSidebarCollapsed ? "md:hidden" : ""}`}
            >
              AI Companion
            </span>
          </Link>
        </div>

        <nav
          className={`flex-1 p-4 ${
            shouldSidebarScroll
              ? "hamburger-scrollbar overflow-y-auto"
              : "overflow-hidden"
          }`}
        >
          <ul className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${isSidebarCollapsed ? "md:justify-center md:gap-0 md:px-0" : ""} ${
                      active
                        ? "bg-white text-black"
                        : "text-gray-400 hover:bg-gray-900 hover:text-white"
                    }`}
                    title={isSidebarCollapsed ? link.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className={isSidebarCollapsed ? "md:hidden" : ""}>
                      {link.label}
                    </span>
                    {active && (
                      <span
                        className={`h-2 w-2 rounded-full bg-black ${
                          isSidebarCollapsed ? "hidden" : "ml-auto"
                        }`}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
        <header className="shrink-0 border-b-2 border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="hidden rounded-lg border border-gray-200 p-2 hover:bg-gray-100 md:inline-flex"
              aria-label={
                isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            >
              {isSidebarCollapsed ? (
                <Menu className="h-5 w-5 text-gray-700" />
              ) : (
                <X className="h-5 w-5 text-gray-700" />
              )}
            </button>

            <button
              type="button"
              className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 md:hidden"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-gray-700" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700" />
              )}
            </button>

            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks, notes, or ask AI..."
                className="w-full rounded-lg border-2 border-gray-200 py-2 pl-10 pr-4 focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/chat"
                className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                Voice Mode
              </Link>
              <button
                type="button"
                className="relative rounded-lg p-2 hover:bg-gray-100"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6 text-gray-700" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              </button>
              <UserButton
                userProfileMode="navigation"
                userProfileUrl="/profile"
              />
            </div>
          </div>
        </header>

        <main className={mainClasses}>{children}</main>
      </div>
    </div>
  ) : (
    <>{children}</>
  );
}
