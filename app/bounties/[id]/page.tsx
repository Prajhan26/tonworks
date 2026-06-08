import Link from "next/link";
import { notFound } from "next/navigation";
import { readBounty } from "@/lib/bounty-repository";
import { BountyActions } from "@/components/bounty-actions";
import { MiraVerificationPanel } from "@/components/mira-verification-panel";
import { PaymentReleasePanel } from "@/components/payment-release-panel";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { WalletState } from "@/components/wallet-state";

export default async function BountyDetailPage({ params }: { params: { id: string } }) {
  const bounty = await readBounty(params.id);

  if (!bounty) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-hero-grid px-6 py-12 text-white lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/bounties" className="text-sm text-white/60 underline underline-offset-4">
              Back to bounties
            </Link>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
              {bounty.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <WalletState />
            <WalletConnectButton />
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">{bounty.title}</h1>
              <p className="mt-2 text-sm text-white/60">
                {bounty.amount_ton} TON • {bounty.work_type}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              Poster wallet: {bounty.poster_wallet}
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-2">
            <Card title="Description" body={bounty.description} />
            <Card title="Requirements" body={bounty.requirements} />
            <Card title="Submission" body={bounty.submitted_work ?? "No submission yet."} />
            <Card title="Mira verdict" body={bounty.mira_reason ?? "Pending verification."} />
          </section>

          <BountyActions bounty={bounty} />
          <MiraVerificationPanel bounty={bounty} />
          <PaymentReleasePanel bounty={bounty} />
        </div>
      </div>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/45">{title}</p>
      <p className="mt-3 text-sm leading-6 text-white/78">{body}</p>
    </div>
  );
}
