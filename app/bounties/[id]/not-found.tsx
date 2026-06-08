export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-grid px-6 text-white">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/6 p-8 text-center backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-white/45">Missing bounty</p>
        <h1 className="mt-3 text-3xl font-semibold">That bounty does not exist.</h1>
        <a
          href="/bounties"
          className="mt-6 inline-flex rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white shadow-glow"
        >
          Return to board
        </a>
      </div>
    </main>
  );
}
