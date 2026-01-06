"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePresale } from "../hooks/usePresale";
import { useUserState } from "../hooks/useUserState";
import { useToast } from "./ToastProvider";

const QUICK_AMOUNTS = [0.5, 1, 2, 5];

export function DepositSection() {
  const { publicKey } = useWallet();
  const { deposit, initializeUser } = usePresale();
  const { data: userState } = useUserState();
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);


  console.log("KEYY: ", publicKey?.toString());
  const handleDeposit = async () => {
    if (!publicKey) return;

    console.log("KEYY: ", publicKey?.toString());

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    console.log(1);
    try {
      // Initialize user if needed
      console.log(2);
      if (!userState && !isInitializing) {
        console.log(3);
        setIsInitializing(true);
        try {
          console.log(4); 
          await initializeUser.mutateAsync();
          console.log(5);
        } catch (error: any) {
          // User might already be initialized, continue anyway
          console.log("Initialize user:", error.message);
        }
        console.log(6);
        setIsInitializing(false);
      }

      console.log(7);
      const result = await deposit.mutateAsync(amountNum);
      console.log(8);
      showToast(
        `Deposit successful! View on Explorer: ${result.explorerUrl}`,
        "success"
      );
      setAmount("");
    } catch (error: any) {
      showToast(`Deposit failed: ${error.message}`, "error");
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Deposit SOL</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.1"
            min="0"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {QUICK_AMOUNTS.map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {quickAmount} SOL
            </button>
          ))}
        </div>
        <button
          onClick={handleDeposit}
          disabled={!publicKey || deposit.isPending || isInitializing}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deposit.isPending || isInitializing
            ? "Processing..."
            : "Deposit SOL"}
        </button>
      </div>
    </div>
  );
}

