"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const envManifestUrl = process.env.NEXT_PUBLIC_TON_MANIFEST_URL;
  const manifestUrl =
    typeof window !== "undefined"
      ? envManifestUrl && !envManifestUrl.includes("localhost") && !envManifestUrl.includes("127.0.0.1")
        ? envManifestUrl
        : `${window.location.origin}/tonconnect-manifest.json`
      : envManifestUrl ?? "http://localhost:3000/tonconnect-manifest.json";

  return <TonConnectUIProvider manifestUrl={manifestUrl}>{children}</TonConnectUIProvider>;
}
