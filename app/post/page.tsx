import { PostBountyForm } from "@/components/post-bounty-form";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { WalletState } from "@/components/wallet-state";
import { Address } from "@ton/core";

export default function PostPage() {
  const backendWalletAddress = process.env.BACKEND_WALLET_ADDRESS
    ? Address.parse(process.env.BACKEND_WALLET_ADDRESS).toString({
        urlSafe: true,
        bounceable: false,
        testOnly: true,
      })
    : "";

  return (
    <main className="min-h-screen bg-hero-grid px-6 py-12 text-white lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/50">Create bounty</p>
            <h1 className="mt-2 text-4xl font-semibold">Post a bounty</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <WalletState />
            <WalletConnectButton />
            <a
              href="/"
              className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:bg-white/12"
            >
              Back home
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PostBountyForm backendWalletAddress={backendWalletAddress || undefined} />

          <aside className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-white/50">Flow</p>
            <div className="space-y-3 text-sm leading-7 text-white/75">
              <p>1. User fills bounty form.</p>
              <p>2. TON Connect asks the poster wallet to send TON to the backend wallet.</p>
              <p>3. Backend records the bounty in Supabase after the wallet accepts the transfer.</p>
              <p>4. The bounty appears on the open board.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
