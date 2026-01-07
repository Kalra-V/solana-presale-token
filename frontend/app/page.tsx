"use client";

import { HeroSection } from "../components/HeroSection";
import { PresaleStatusBanner } from "../components/PresaleStatusBanner";
import { StatsOverview } from "../components/StatsOverview";
import { UserStatsCard } from "../components/UserStatsCard";
import { DepositSection } from "../components/DepositSection";
import { ClaimSection } from "../components/ClaimSection";
import { TransactionHistory } from "../components/TransactionHistory";
import { ActivityFeed } from "../components/ActivityFeed";

export default function Home() {
  return (
    <div className="space-y-8">
      <HeroSection />
      
      <PresaleStatusBanner />

      <StatsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">
        <div className="space-y-6">
          <DepositSection />
          <ClaimSection />
        </div>
        <div className="space-y-6">
          <UserStatsCard />
          <TransactionHistory />
        </div>
      </div>

      <div className="px-6 pb-8">
        <ActivityFeed />
      </div>
    </div>
  );
}

