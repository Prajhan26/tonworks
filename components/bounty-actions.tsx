"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTonWallet } from "@tonconnect/ui-react";
import type { Bounty } from "@/lib/types";
import { shortAddress } from "@/lib/wallet";

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
  const connectedAddress = wallet?.account.address ?? null;
  const isPosterWallet = connectedAddress === bounty.poster_wallet;
  const isWorkerWallet = connectedAddress !== null && connectedAddress === bounty.worker_wallet;

  const canClaim =
    bounty.status === "open" && connectedAddress !== null && !isPosterWallet;
  const canSubmit =
    (bounty.status === "claimed" || bounty.status === "rejected") && isWorkerWallet;

  const nextAction = useMemo(() => {
    if (!connectedAddress) {
      return "Connect a wallet to continue.";
    }

    if (bounty.status === "open") {
      return isPosterWallet
        ? "You posted this bounty. A worker wallet needs to claim it."
        : "You are connected as a worker. Claim this bounty to start work.";
    }

    if (bounty.status === "claimed") {
      return isWorkerWallet
        ? "You claimed this bounty. Submit the work when ready."
        : "This bounty is claimed. Waiting for the worker submission.";
    }

    if (bounty.status === "submitted") {
      return isPosterWallet
        ? "The work is submitted. Review it with Mira and record a verdict."
        : "Work submitted. Waiting for the poster to review and approve.";
    }

    if (bounty.status === "approved") {
      return isPosterWallet
        ? "The work is approved. Release payment to finish the bounty."
        : "Work approved. Waiting for payment release.";
    }

    if (bounty.status === "rejected") {
      return isWorkerWallet
        ? "The submission was rejected. Revise the work and submit again."
        : "Submission rejected. Waiting for the worker to resubmit.";
    }

    if (bounty.status === "paid") {
      return "This bounty is complete and payment has been released.";
    }

    return `Current state: ${bounty.status}.`;
  }, [bounty.status, connectedAddress, isPosterWallet, isWorkerWallet]);

  const claimHint = useMemo(() => {
    if (canClaim) {
      return "Claim this bounty with a worker wallet.";
    }

    if (!connectedAddress) {
      return "Connect a worker wallet to claim this bounty.";
    }

    if (isPosterWallet) {
      return "The poster wallet cannot claim its own bounty.";
    }

    if (bounty.status !== "open") {
      return `Claim is unavailable because this bounty is ${bounty.status}.`;
    }

    return "Claim is currently unavailable.";
  }, [bounty.status, canClaim, connectedAddress, isPosterWallet]);

  const submitHint = useMemo(() => {
    if (canSubmit) {
      return "Submit the finished work, a document link, or a GitHub link.";
    }

    if (!connectedAddress) {
      return "Connect the worker wallet to submit work.";
    }

    if (bounty.status === "open") {
      return "A worker needs to claim this bounty before submitting.";
    }

    if (bounty.status === "claimed" && !isWorkerWallet) {
      return "Only the wallet that claimed the bounty can submit the work.";
    }

    if (bounty.status === "submitted") {
      return "Submission is locked while the poster reviews the work.";
    }

    if (bounty.status === "approved" || bounty.status === "paid") {
      return "Submission is closed because this bounty is already finished.";
    }

    return "Submit is currently unavailable.";
  }, [bounty.status, canSubmit, connectedAddress, isWorkerWallet]);

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
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">
        <p className="font-semibold text-white/90">
          {connectedAddress
            ? `Connected as ${isPosterWallet ? "poster" : isWorkerWallet ? "worker" : "viewer"} wallet`
            : "No wallet connected"}
        </p>
        <p className="mt-2 text-white/65">
          {connectedAddress ? `Wallet: ${shortAddress(connectedAddress)}` : "Connect the correct wallet for this step."}
        </p>
        <p className="mt-3 text-white/80">Next action: {nextAction}</p>
      </div>

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
        <p className="mt-3 text-sm text-white/60">{submitHint}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!canClaim || busy !== null}
          onClick={() =>
            mutate(`/api/bounties/${bounty.id}/claim`, {
              worker_wallet: wallet?.account.address,
            })
          }
          className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === `/api/bounties/${bounty.id}/claim` ? "Claiming..." : labels.claim}
        </button>
      </div>
      <p className="text-sm text-white/60">{claimHint}</p>

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
