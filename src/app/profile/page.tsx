import { UserProfile } from "@clerk/nextjs";
import { SignedLayout } from "@/components/signed-layout";

export default function ProfilePage() {
  return (
    <SignedLayout>
      <h1 className="mb-4 text-2xl font-semibold">Profile & Account</h1>
      <div className="card">
        <UserProfile />
      </div>
    </SignedLayout>
  );
}
