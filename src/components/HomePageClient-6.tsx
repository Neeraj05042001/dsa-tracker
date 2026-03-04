"use client";

import AnalyticsPreview from "./new-design/AnalyticsPreview";
import Features        from "./new-design/Features";
import FinalCTA        from "./new-design/FinalCTA";
import Footer          from "./new-design/Footer";
import Hero            from "./new-design/Hero";
import HowItWorks      from "./new-design/HowItWorks";
import Navbar          from "./new-design/Navbar";
import Problem         from "./new-design/Problem";
import StatsStrip      from "./new-design/StatsStrip";

export interface NavUser {
  name: string;
  email: string;
  avatar_url?: string;
}

interface Props {
  user?: NavUser | null;
}

export default function HomePageClient({ user }: Props) {
  return (
    <>
      <Navbar user={user} />
      <main>
        <Hero />
        <StatsStrip />
        <Problem />
        <HowItWorks />
        <Features />
        <AnalyticsPreview />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}