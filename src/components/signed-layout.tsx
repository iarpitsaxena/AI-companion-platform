"use client";

import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Nav } from "@/components/nav";

export function SignedLayout({ children }: { children: ReactNode }) {
  const { isLoaded, userId } = useAuth();

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

  return (
    <>
      <Nav />
      <main className="app-shell py-6">{children}</main>
    </>
  );
}
