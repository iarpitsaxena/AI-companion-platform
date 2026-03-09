import { UserProfile } from "@clerk/nextjs";
import { SignedLayout } from "@/components/signed-layout";

export default function ProfilePage() {
  return (
    <SignedLayout>
      <h1 className="mb-4 text-2xl font-semibold">Profile</h1>
      <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
        <UserProfile />
      </div>
    </SignedLayout>
  );
}
