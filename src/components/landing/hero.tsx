import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  Users,
  Star,
  CheckCircle,
} from "lucide-react";

export function LandingHero({ userId }: { userId: string | null }) {
  return (
    <section id="about" className="relative overflow-hidden bg-white pt-16">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gray-100 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gray-100 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white mb-8 shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">
                Your AI-Powered Personal Assistant
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl text-black mb-6 tracking-tight">
              Meet Your New
              <br />
              <span className="italic">AI Companion</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-8">
              Transform your productivity with an intelligent assistant that
              manages your tasks, takes notes, analyzes your workflow, and
              responds to your voice commands.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-black" />
                <span className="text-sm text-black">
                  No credit card required
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-black" />
                <span className="text-sm text-black">14-day free trial</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-black" />
                <span className="text-sm text-black">Cancel anytime</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href={userId ? "/dashboard" : "/sign-up"}
                className="inline-flex items-center justify-center rounded-xl bg-black px-8 py-6 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-gray-800"
              >
                {userId ? "Open Workspace" : "Get Started Free"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href={userId ? "/chat" : "/sign-in"}
                className="inline-flex items-center justify-center rounded-xl border-2 border-black px-8 py-6 text-lg font-semibold text-black transition-colors hover:bg-gray-100"
              >
                <Play className="mr-2 w-5 h-5 fill-black" />
                {userId ? "Open Chat" : "Watch Demo"}
              </Link>
            </div>

            {/* Social proof stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t-2 border-gray-200">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-5 h-5 fill-black text-black" />
                  <span className="text-2xl text-black">4.9</span>
                </div>
                <p className="text-sm text-gray-600">User Rating</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Users className="w-5 h-5 text-black" />
                  <span className="text-2xl text-black">50K+</span>
                </div>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <CheckCircle className="w-5 h-5 text-black" />
                  <span className="text-2xl text-black">1M+</span>
                </div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
              </div>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="relative">
            {/* Decorative elements behind image */}
            <div className="absolute -top-10 -right-10 w-32 h-32 border-4 border-black rounded-full opacity-10" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black rounded-lg opacity-5" />

            {/* Main image with shadow */}
            <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-2xl border-2 border-gray-200">
              <Image
                src="/landing-hero.png"
                alt="AI Companion Illustration"
                width={760}
                height={740}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">AI is online and ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted by section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <p className="text-center text-sm text-gray-500 mb-8">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-40">
          <div className="text-2xl text-black">Company A</div>
          <div className="text-2xl text-black">Company B</div>
          <div className="text-2xl text-black">Company C</div>
          <div className="text-2xl text-black">Company D</div>
          <div className="text-2xl text-black">Company E</div>
        </div>
      </div>
    </section>
  );
}
