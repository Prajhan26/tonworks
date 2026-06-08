"use client";

import { useTonWallet } from "@tonconnect/ui-react";
import { shortAddress } from "@/lib/wallet";

export function WalletState() {
  const wallet = useTonWallet();
  const address = shortAddress(wallet?.account.address);

  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/75">
      <span className="h-2 w-2 rounded-full bg-teal" />
      <span>{address ? `Connected: ${address}` : "Wallet not connected"}</span>
    </div>
  );
}
