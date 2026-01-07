"use client";

import { WalletButton } from "./WalletButton";

export function HeroSection() {
  return (
    <div className="relative w-full py-20 px-6 overflow-hidden">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            Launch Your Token
          </span>
          <br />
          <span className="text-white">on Solana</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-4 animate-fade-in-up animate-delay-200 animate-fill-both">
          Built for builders, by builders
        </p>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-400 animate-fill-both">
          The premier presale platform for Solana founders. Launch your token with confidence, 
          backed by secure smart contracts and real-time transparency.
        </p>
        <div className="animate-fade-in-up animate-delay-600 animate-fill-both">
          <WalletButton />
        </div>
      </div>
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

