import Link from "next/link";
import { listBounties } from "@/lib/bounty-repository";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { WalletState } from "@/components/wallet-state";

export default async function BountiesPage() {
  const bounties = await listBounties();

  return (
    <main className="min-h-screen bg-hero-grid px-6 py-12 text-white lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/50">Bounty board</p>
            <h1 className="mt-2 text-4xl font-semibold">Open bounties</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Workers should connect a wallet here first, then open any bounty to claim
              it and submit the finished work.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <WalletState />
            <WalletConnectButton />
            <Link
              href="/post"
              className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px]"
            >
              New bounty
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {bounties.map((bounty) => (
            <Link
              key={bounty.id}
              href={`/bounties/${bounty.id}`}
              className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white/8"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
                  {bounty.status}
                </span>
                <span className="text-sm font-semibold text-teal">{bounty.amount_ton} TON</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{bounty.title}</h2>
              <p className="mt-3 max-h-[6rem] overflow-hidden text-sm leading-6 text-white/72">
                {bounty.description}
              </p>
              <div className="mt-5 flex items-center justify-between text-xs text-white/45">
                <span>Type: {bounty.work_type}</span>
                <span>Revisions: {bounty.revision_count}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
