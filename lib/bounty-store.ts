import { Bounty, CreateBountyInput, BountyStatus } from "@/lib/types";

const seed: Bounty[] = [
  {
    id: "seed-1",
    title: "Write 300 words about TON",
    description: "A short explainer for non-technical readers.",
    requirements: "Include 3 concrete use cases and keep it clear.",
    work_type: "writing",
    amount_ton: 2,
    poster_wallet: "EQCposterSeedWallet",
    worker_wallet: null,
    status: "open",
    submitted_work: null,
    mira_verdict: null,
    mira_reason: null,
    revision_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __tonworkBounties: Bounty[] | undefined;
}

function store(): Bounty[] {
  if (!globalThis.__tonworkBounties) {
    globalThis.__tonworkBounties = [...seed];
  }

  return globalThis.__tonworkBounties;
}

export function getBounties(): Bounty[] {
  return [...store()].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getBounty(id: string): Bounty | undefined {
  return store().find((bounty) => bounty.id === id);
}

export function createBounty(input: CreateBountyInput): Bounty {
  const now = new Date().toISOString();
  const bounty: Bounty = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    requirements: input.requirements,
    work_type: input.work_type,
    amount_ton: input.amount_ton,
    poster_wallet: input.poster_wallet ?? "EQCposterWalletPlaceholder",
    worker_wallet: null,
    status: "open",
    submitted_work: null,
    mira_verdict: null,
    mira_reason: null,
    revision_count: 0,
    created_at: now,
    updated_at: now,
  };

  store().unshift(bounty);
  return bounty;
}

export function updateBounty(id: string, patch: Partial<Bounty>): Bounty | null {
  const list = store();
  const index = list.findIndex((bounty) => bounty.id === id);

  if (index === -1) {
    return null;
  }

  const updated: Bounty = {
    ...list[index],
    ...patch,
    updated_at: new Date().toISOString(),
  };

  list[index] = updated;
  return updated;
}

export function transitionBounty(id: string, nextStatus: BountyStatus): Bounty | null {
  return updateBounty(id, { status: nextStatus });
}

export function claimBounty(id: string, workerWallet = "EQCworkerWalletPlaceholder"): Bounty | null {
  const bounty = getBounty(id);
  if (!bounty || bounty.status !== "open") {
    return null;
  }

  return updateBounty(id, {
    status: "claimed",
    worker_wallet: workerWallet,
  });
}

export function submitBounty(id: string, submittedWork: string): Bounty | null {
  const bounty = getBounty(id);
  if (!bounty || (bounty.status !== "claimed" && bounty.status !== "rejected")) {
    return null;
  }

  const nextRevisionCount = bounty.status === "rejected" ? bounty.revision_count + 1 : bounty.revision_count;

  return updateBounty(id, {
    status: "submitted",
    submitted_work: submittedWork,
    revision_count: nextRevisionCount,
  });
}

export function recordVerdict(
  id: string,
  verdict: "approved" | "rejected",
  reason: string,
): Bounty | null {
  const bounty = getBounty(id);
  if (!bounty || bounty.status !== "submitted") {
    return null;
  }

  return updateBounty(id, {
    status: verdict === "approved" ? "approved" : "rejected",
    mira_verdict: verdict,
    mira_reason: reason,
  });
}

export function releasePayment(id: string): Bounty | null {
  const bounty = getBounty(id);
  if (!bounty || bounty.status !== "approved") {
    return null;
  }

  return updateBounty(id, { status: "paid" });
}
