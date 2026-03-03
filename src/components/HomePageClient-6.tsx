"use client";

import Hero from "./new-design/Hero";
import HowItWorks from "./new-design/HowItWorks";
import Navbar from "./new-design/Navbar";
import Problem from "./new-design/Problem";
import StatsStrip from "./new-design/StatsStrip";

interface User {
  email?: string | null;
  user_metadata?: { avatar_url?: string; full_name?: string; name?: string };
}
interface Props {
  user: User | null;
}

export default function HomePageClient({ user }: Props) {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <Problem />
        <HowItWorks/>
        {/* ... */}
      </main>
    </>
  );
}
