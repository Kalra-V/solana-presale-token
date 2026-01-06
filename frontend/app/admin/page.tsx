"use client";

import { WalletButton } from "../../components/WalletButton";
import { AdminStats } from "../../components/admin/AdminStats";
import { ParticipantsTable } from "../../components/admin/ParticipantsTable";
import { EnableDistributionButton } from "../../components/admin/EnableDistributionButton";
import { BulkDistributeButton } from "../../components/admin/BulkDistributeButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { ADMIN_WALLET } from "../../lib/solana";
import { PublicKey } from "@solana/web3.js";

export default function AdminPage() {
  const { publicKey } = useWallet();
  const isAdmin = publicKey?.toString() === ADMIN_WALLET;

  if (!publicKey) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <WalletButton />
        </div>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <p className="text-red-400">Please connect your wallet to access the admin dashboard</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <WalletButton />
        </div>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <p className="text-red-400">
            Unauthorized. Only the admin wallet can access this page.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Connected: {publicKey.toString()}
          </p>
          <p className="text-gray-400 text-sm">
            Required: {ADMIN_WALLET}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <WalletButton />
      </div>

      <AdminStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnableDistributionButton />
        <BulkDistributeButton />
      </div>

      <ParticipantsTable />
    </div>
  );
}

