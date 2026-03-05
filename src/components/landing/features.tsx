import {
  BarChart3,
  CheckCircle2,
  FileText,
  ListTodo,
  MessageSquare,
  Mic,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: ListTodo,
    title: "Smart Todo Lists",
    description:
      "Organize your tasks with intelligent prioritization and automatic scheduling. Never miss a deadline again.",
  },
  {
    icon: FileText,
    title: "Smart Notes",
    description:
      "Capture ideas instantly with AI-powered note-taking that organizes and categorizes your thoughts automatically.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Track your productivity patterns and get insights on how to optimize your workflow with detailed analytics.",
  },
  {
    icon: MessageSquare,
    title: "Chat Mode",
    description:
      "Interact naturally with your AI companion through conversational chat for quick task management.",
  },
  {
    icon: Mic,
    title: "Voice Activation",
    description:
      "Control everything hands-free with advanced voice recognition. Just speak and let AI handle the rest.",
  },
  {
    icon: CheckCircle2,
    title: "Task Completion",
    description:
      "Experience satisfaction with smart task completion tracking and celebration of your achievements.",
  },
];

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="relative bg-gray-50 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-white">
            <Zap className="h-4 w-4" />
            Powerful Features
          </div>
          <h2 className="mb-6 text-4xl text-black sm:text-5xl">
            Everything You Need to
            <br />
            <span className="italic">Stay Organized</span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Powerful AI-driven features designed to boost your productivity and
            keep you on track.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border-2 border-black bg-white p-8 transition-all duration-300 hover:shadow-xl"
              >
                <div className="mb-6 inline-flex rounded-xl bg-black p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-xl text-black">{feature.title}</h3>
                <p className="leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
