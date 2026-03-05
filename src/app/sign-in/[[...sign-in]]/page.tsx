import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  );
}
