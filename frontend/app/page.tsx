"use client";

import { WalletButton } from "../components/WalletButton";
import { PresaleStatusBanner } from "../components/PresaleStatusBanner";
import { UserStatsCard } from "../components/UserStatsCard";
import { DepositSection } from "../components/DepositSection";
import { ClaimSection } from "../components/ClaimSection";
import { TransactionHistory } from "../components/TransactionHistory";
import { ActivityFeed } from "../components/ActivityFeed";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Token Presale Platform</h1>
        <WalletButton />
      </div>

      <PresaleStatusBanner />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <UserStatsCard />
          <DepositSection />
          <ClaimSection />
        </div>
        <div className="space-y-6">
          <TransactionHistory />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

