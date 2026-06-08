"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Bounty, WorkType } from "@/lib/types";

type Props = {
  bounty: Bounty;
};

const promptLabels: Record<WorkType, string> = {
  writing: "Writing / text submission",
  code: "Code submission",
  research: "Research submission",
  document: "Document submission",
};

function buildPrompt(bounty: Bounty) {
  const label = promptLabels[bounty.work_type];
  const submittedWork = bounty.submitted_work ?? "[submitted work goes here]";

  return `/verify

TYPE: ${label}

REQUIREMENTS:
${bounty.requirements}

SUBMITTED WORK:
${submittedWork}

Does the submitted work meet ALL the requirements? Output APPROVED or REJECTED with a 2-line reason.`;
}

export function MiraVerificationPanel({ bounty }: Props) {
  const [copied, setCopied] = useState(false);
  const [reason, setReason] = useState(bounty.mira_reason ?? "Looks good.");
  const [busy, setBusy] = useState<"approved" | "rejected" | null>(null);
  const router = useRouter();
  const prompt = useMemo(() => buildPrompt(bounty), [bounty]);

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function recordVerdict(verdict: "approved" | "rejected") {
    setBusy(verdict);

    try {
      const response = await fetch(`/api/bounties/${bounty.id}/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict, reason }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to record verdict.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/50">Mira verification</p>
          <h2 className="mt-2 text-2xl font-semibold">3-step review flow</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
          {promptLabels[bounty.work_type]}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          <Step
            number="1"
            title="Open Mira"
            body="Use the deep link below to open Mira in Telegram."
          />
          <a
            href="https://t.me/mira?start=verify"
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px]"
          >
            Open Mira
          </a>
          <p className="text-xs text-white/45">Deep link: https://t.me/mira?start=verify</p>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          <Step
            number="2"
            title="Copy prompt"
            body="The prompt is pre-filled with the bounty requirements and submitted work."
          />
          <textarea
            readOnly
            value={prompt}
            className="min-h-56 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyPrompt}
              className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              {copied ? "Copied" : "Copy prompt"}
            </button>
            <span className="self-center text-sm text-white/55">
              Template selected from {promptLabels[bounty.work_type]}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <Step
          number="3"
          title="Record verdict"
          body="Paste Mira’s verdict in the box, then choose APPROVED or REJECTED."
        />
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Enter Mira's reasoning here"
          rows={4}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => recordVerdict("approved")}
            className="rounded-full bg-teal px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === "approved" ? "Saving..." : "APPROVED"}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => recordVerdict("rejected")}
            className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === "rejected" ? "Saving..." : "REJECTED"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80">
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-white/90">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/65">{body}</p>
      </div>
    </div>
  );
}
