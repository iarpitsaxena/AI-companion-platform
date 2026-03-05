import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingCTASection({ userId }: { userId: string | null }) {
  return (
    <section
      id="pricing"
      className="relative bg-white px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-black p-12">
          <div className="relative">
            <div className="mb-6 flex justify-center gap-1 text-white">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xl leading-none">
                  ★
                </span>
              ))}
            </div>

            <h2 className="mb-6 text-4xl text-white sm:text-5xl">
              Ready to Boost Your Productivity?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-white/90">
              Join thousands of users who&apos;ve transformed their workflow
              with AI. Start your free trial today—no credit card required.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={userId ? "/dashboard" : "/sign-up"}
                className="inline-flex items-center rounded-xl bg-white px-8 py-6 text-lg font-semibold text-black shadow-lg transition-colors hover:bg-gray-100"
              >
                {userId ? "Open Dashboard" : "Start Free Trial"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href={userId ? "/chat" : "/sign-in"}
                className="inline-flex items-center rounded-xl border border-white px-8 py-6 text-lg font-semibold text-white transition-colors hover:bg-white/10"
              >
                {userId ? "Open Chat" : "Schedule a Demo"}
              </Link>
            </div>

            <p className="mt-8 text-sm text-white/70">
              Free 14-day trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
