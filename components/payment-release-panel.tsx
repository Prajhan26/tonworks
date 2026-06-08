"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Bounty } from "@/lib/types";
import { shortAddress } from "@/lib/wallet";

type Props = {
  bounty: Bounty;
};

export function PaymentReleasePanel({ bounty }: Props) {
  const router = useRouter();
  const [released, setReleased] = useState(bounty.status === "paid");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const workerLabel = shortAddress(bounty.worker_wallet) ?? "No worker wallet yet";
  const isReady = Boolean(bounty.worker_wallet) && (bounty.status === "approved" || bounty.status === "paid");

  const statusLabel = useMemo(() => {
    if (released) {
      return "Payment Released";
    }

    if (!isReady) {
      return "Waiting for approval";
    }

    return "Release payment";
  }, [isReady, released]);

  async function releasePayment() {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/bounties/${bounty.id}/release`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to release payment.");
      }

      setReleased(true);
      setMessage("Payment Released");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to release payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/50">Payment release</p>
          <h2 className="mt-2 text-2xl font-semibold">{statusLabel}</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
            released ? "bg-teal/20 text-teal" : "bg-white/10 text-white/60"
          }`}
        >
          {released ? "Payment Released" : "Pending"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Worker wallet</p>
          <p className="mt-3 text-sm text-white/80">{workerLabel}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">TON amount</p>
          <p className="mt-3 text-sm text-white/80">{bounty.amount_ton} TON</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || !isReady || released}
          onClick={releasePayment}
          className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Releasing..." : released ? "Payment Released" : "Release payment"}
        </button>
        <p className="text-sm text-white/60">
          This sends a real testnet TON transfer from the backend wallet to the worker wallet.
        </p>
      </div>

      {message ? <p className="text-sm text-white/75">{message}</p> : null}
    </section>
  );
}
