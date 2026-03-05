"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/companions", label: "Companions" },
  { href: "/notes", label: "Notes" },
  { href: "/todos", label: "To-Dos" },
  { href: "/history", label: "History" },
  { href: "/analytics", label: "Analytics" },
  { href: "/profile", label: "Profile" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-(--border) bg-(--surface)/85 backdrop-blur">
      <div className="app-shell flex flex-wrap items-center justify-between gap-3 py-3">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight"
        >
          AI Companion
        </Link>
        <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-1 md:order-2 md:w-auto md:pb-0">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link whitespace-nowrap ${
                  active ? "nav-link-active" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="order-2 md:order-3">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
