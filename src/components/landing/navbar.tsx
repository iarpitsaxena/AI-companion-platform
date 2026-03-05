import Link from "next/link";
import { Sparkles, Menu } from "lucide-react";

export function LandingNavbar({ userId }: { userId: string | null }) {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-black p-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl text-black">AI Companion</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-gray-700 transition-colors hover:text-black"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-700 transition-colors hover:text-black"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-gray-700 transition-colors hover:text-black"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-700 transition-colors hover:text-black"
            >
              Contact
            </a>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href={userId ? "/dashboard" : "/sign-in"}
              className="rounded-md px-3 py-2 text-black transition-colors hover:bg-gray-100"
            >
              Sign In
            </Link>
            <Link
              href={userId ? "/dashboard" : "/sign-up"}
              className="rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
            >
              Get Started
            </Link>
          </div>

          <button
            className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
            type="button"
          >
            <Menu className="h-6 w-6 text-black" />
          </button>
        </div>
      </div>
    </nav>
  );
}
