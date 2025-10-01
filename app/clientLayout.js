"use client";

import { FirstVisitGate } from "@/components/UIs/SplashScreen";
import { Toaster } from "sonner";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";

export default function ClientLayout({ children, isFirstVisit }) {
  const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
  const solanaWeb3JsAdapter = new SolanaAdapter();

  // Initialize AppKit on the client
  createAppKit({
    adapters: [solanaWeb3JsAdapter],
    networks: process.env.NEXT_PUBLIC_ENV == "dev" ? [solanaTestnet] : [solana], // Testnet first = default
    enableNetworkSwitch: false,
    allowUnsupportedChain: true,
    debug: process.env.NEXT_PUBLIC_ENV == "dev" ? true : false,
    enableWalletGuide: true,
    projectId,
    defaultTokens: [
      // USDC on Solana Mainnet
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      // USDC on Solana Testnet (for testing)
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    ],
    features: {
      analytics: true,
      swaps: true,
      onramp: true,
      history: true,
      socials: ["google", "discord", "apple", "x", "facebook"],
      connectMethodsOrder: ["social", "wallet"],
      emailShowWallets: false,
    },
    themeVariables: {
      "--w3m-accent": "#EBBD3F",
    },
  });
  return (
    <>
      <Toaster position="bottom-right" expand={true} richColors closeButton />
      <main>
        <FirstVisitGate isFirstVisit={isFirstVisit}>{children}</FirstVisitGate>
      </main>
    </>
  );
}
