import Link from "next/link";
import { listBounties } from "@/lib/bounty-repository";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { WalletState } from "@/components/wallet-state";

const steps = [
  "Post a bounty and lock TON in escrow.",
  "Worker claims, completes, and submits the work.",
  "Poster verifies with Mira and records the verdict.",
  "Backend releases payment to the worker wallet.",
];

const checklist = [
  "Scaffold app and design system",
  "Supabase schema and client setup",
  "Bounty create/list flows",
  "TON Connect wallet integration",
  "Escrow funding and payout release",
  "Mira verification prompt flow",
  "Deploy and demo polish",
];

export default async function HomePage() {
  const bounties = await listBounties();

  return (
    <main className="min-h-screen bg-hero-grid">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <div className="flex flex-wrap justify-end gap-3 lg:hidden">
              <WalletState />
              <WalletConnectButton />
            </div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
              TONWORK • Mira verification • TON escrow
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Post work. Get paid. Let Mira verify it.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/72">
                A Telegram-native bounty platform on TON where posters fund escrow,
                workers submit work, and a lightweight verification flow helps decide
                whether payment should be released.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/post"
                className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px]"
              >
                Create bounty
              </a>
              <a
                href="#checklist"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
              >
                View build checklist
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/6 p-6 shadow-glow backdrop-blur-xl">
            <div className="mb-4 flex flex-wrap justify-end gap-3">
              <WalletState />
              <WalletConnectButton />
            </div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-white/50">Flow</p>
                <h2 className="text-2xl font-semibold">MVP path</h2>
              </div>
              <div className="rounded-full bg-teal/15 px-3 py-1 text-xs font-semibold text-teal">
                Demo first
              </div>
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-2xl border border-white/8 bg-black/15 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80">
                    0{index + 1}
                  </div>
                  <p className="text-sm leading-6 text-white/78">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="checklist" className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-white/50">Now</p>
            <h3 className="mt-2 text-2xl font-semibold">What we’re building first</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-white/76">
              {checklist.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-ember" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-white/50">Next page</p>
            <h3 className="mt-2 text-2xl font-semibold">Post bounty flow</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
              The `/post` screen will capture title, description, requirements,
              work type, and TON amount, then connect the wallet and route funds
              into the escrow flow.
            </p>
            <Link
              href="/post"
              className="mt-6 inline-flex rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              Open `/post`
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/50">Live board</p>
              <h3 className="mt-2 text-2xl font-semibold">Current bounties</h3>
            </div>
            <Link href="/bounties" className="text-sm text-white/60 underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bounties.slice(0, 3).map((bounty) => (
              <Link
                key={bounty.id}
                href={`/bounties/${bounty.id}`}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/45">
                    {bounty.status}
                  </span>
                  <span className="text-sm font-semibold text-teal">{bounty.amount_ton} TON</span>
                </div>
                <h4 className="mt-4 text-lg font-semibold">{bounty.title}</h4>
                <p className="mt-3 max-h-12 overflow-hidden text-sm leading-6 text-white/72">
                  {bounty.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
