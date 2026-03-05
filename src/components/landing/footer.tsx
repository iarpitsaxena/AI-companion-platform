import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="border-t-2 border-black bg-white px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-black p-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl text-black">AI Companion</span>
            </div>
            <p className="max-w-md text-gray-600">
              Your intelligent personal assistant for managing tasks, notes, and
              productivity with the power of AI.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-black">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 transition-colors hover:text-black"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  className="text-gray-600 transition-colors hover:text-black"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="text-gray-600 transition-colors hover:text-black"
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 transition-colors hover:text-black"
                >
                  Updates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-black">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 transition-colors hover:text-black"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-gray-600 transition-colors hover:text-black"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-600 transition-colors hover:text-black"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/companions"
                  className="text-gray-600 transition-colors hover:text-black"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t-2 border-black pt-8 sm:flex-row">
          <p className="text-sm text-gray-600">
            © {currentYear} AI Companion. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/profile"
              className="text-sm text-gray-600 transition-colors hover:text-black"
            >
              Privacy Policy
            </Link>
            <Link
              href="/profile"
              className="text-sm text-gray-600 transition-colors hover:text-black"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
