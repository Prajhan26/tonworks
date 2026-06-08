"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { toNano } from "@ton/core";
import type { WorkType } from "@/lib/types";

const workTypes: { label: string; value: WorkType }[] = [
  { label: "Writing", value: "writing" },
  { label: "Code", value: "code" },
  { label: "Research", value: "research" },
  { label: "Document", value: "document" },
];

export function PostBountyForm({ backendWalletAddress }: { backendWalletAddress?: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const [tonConnectUi] = useTonConnectUI();
  const wallet = useTonWallet();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData(event.currentTarget);
      const amountTon = String(formData.get("amount_ton") ?? "").trim();

      if (!backendWalletAddress) {
        throw new Error("Backend wallet address is not configured.");
      }

      if (!wallet?.account.address) {
        throw new Error("Connect a TON wallet before posting a bounty.");
      }

      if (!amountTon || Number.isNaN(Number(amountTon)) || Number(amountTon) <= 0) {
        throw new Error("Enter a valid TON amount.");
      }

      await tonConnectUi.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: "-3",
        from: wallet.account.address,
        messages: [
          {
            address: backendWalletAddress,
            amount: toNano(amountTon).toString(),
          },
        ],
      });

      const response = await fetch("/api/bounties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          requirements: formData.get("requirements"),
          work_type: formData.get("work_type"),
          amount_ton: amountTon,
          poster_wallet: wallet?.account.address,
        }),
      });

      const payload = (await response.json()) as { bounty?: { id: string }; message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create bounty.");
      }

      if (payload.bounty?.id) {
        router.push(`/bounties/${payload.bounty.id}`);
        return;
      }

      setMessage("Bounty created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur"
    >
      <Field name="title" label="Title" placeholder="Write 300 words about TON blockchain" />
      <Field name="description" label="Description" placeholder="What should the worker do?" textarea />
      <Field
        name="requirements"
        label="Requirements"
        placeholder="Must include 3 use cases and be concise"
        textarea
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="amount_ton" label="TON amount" placeholder="2" />
        <label className="space-y-2 text-sm text-white/70">
          <span className="block">Work type</span>
          <select
            name="work_type"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            defaultValue="writing"
          >
            {workTypes.map((type) => (
              <option key={type.value} value={type.value} className="bg-slate-950">
                {type.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create bounty"}
      </button>
      {message ? <p className="text-sm text-white/70">{message}</p> : null}
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
  textarea = false,
}: {
  name: string;
  label: string;
  placeholder: string;
  textarea?: boolean;
}) {
  return (
    <label className="space-y-2 text-sm text-white/70">
      <span className="block">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={5}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
        />
      ) : (
        <input
          name={name}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
        />
      )}
    </label>
  );
}
