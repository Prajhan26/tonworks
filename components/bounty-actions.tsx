"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTonWallet } from "@tonconnect/ui-react";
import type { Bounty } from "@/lib/types";

type Props = {
  bounty: Bounty;
};

export function BountyActions({ bounty: initialBounty }: Props) {
  const [bounty, setBounty] = useState(initialBounty);
  const [submittedWork, setSubmittedWork] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const wallet = useTonWallet();
  const router = useRouter();

  const canClaim = bounty.status === "open";
  const canSubmit = bounty.status === "claimed" || bounty.status === "rejected";

  const labels = useMemo(
    () => ({
      claim: canClaim ? "Claim bounty" : "Claim unavailable",
      submit: canSubmit ? "Submit work" : "Submit unavailable",
    }),
    [canClaim, canSubmit],
  );

  async function mutate(path: string, body?: Record<string, unknown>) {
    setBusy(path);
    setStatusMessage(null);

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = (await response.json()) as {
        bounty?: Bounty;
        error?: string;
      };

      if (!response.ok || !payload.bounty) {
        throw new Error(payload.error ?? "Action failed.");
      }

      setBounty(payload.bounty);
      router.refresh();
      setStatusMessage(`Updated status: ${payload.bounty.status}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Submission text</p>
        <textarea
          value={submittedWork}
          onChange={(event) => setSubmittedWork(event.target.value)}
          placeholder="Paste the work, GitHub link, or doc link here"
          rows={5}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
        />
        <button
          type="button"
          disabled={!canSubmit || busy !== null}
          onClick={() => mutate(`/api/bounties/${bounty.id}/submit`, { submitted_work: submittedWork })}
          className="mt-4 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === `/api/bounties/${bounty.id}/submit` ? "Submitting..." : labels.submit}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!canClaim || busy !== null}
          onClick={() =>
            mutate(`/api/bounties/${bounty.id}/claim`, {
              worker_wallet: wallet?.account.address ?? "EQCworkerWalletPlaceholder",
            })
          }
          className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === `/api/bounties/${bounty.id}/claim` ? "Claiming..." : labels.claim}
        </button>
      </div>

      {statusMessage ? <p className="text-sm text-white/70">{statusMessage}</p> : null}

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
        <p className="font-semibold text-white/85">Current state: {bounty.status}</p>
        <p className="mt-2">
          Revision count: {bounty.revision_count}
          {bounty.worker_wallet ? ` • Worker wallet: ${bounty.worker_wallet}` : ""}
        </p>
      </div>
    </div>
  );
}
