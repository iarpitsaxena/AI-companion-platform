import { auth } from "@clerk/nextjs/server";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingCTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/footer";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen">
      <LandingNavbar userId={userId} />
      <LandingHero userId={userId} />
      <LandingFeatures />
      <LandingCTASection userId={userId} />
      <LandingFooter />
    </div>
  );
}
