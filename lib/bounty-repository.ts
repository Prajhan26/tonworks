import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  claimBounty as claimLocalBounty,
  createBounty as createLocalBounty,
  getBounties as getLocalBounties,
  getBounty as getLocalBounty,
  recordVerdict as recordLocalVerdict,
  releasePayment as releaseLocalPayment,
  submitBounty as submitLocalBounty,
} from "@/lib/bounty-store";
import type { Bounty, CreateBountyInput } from "@/lib/types";

type DbBounty = Record<string, unknown>;

function mapRow(row: DbBounty): Bounty {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    requirements: String(row.requirements),
    work_type: String(row.work_type) as Bounty["work_type"],
    amount_ton: Number(row.amount_ton),
    poster_wallet: String(row.poster_wallet),
    worker_wallet: row.worker_wallet ? String(row.worker_wallet) : null,
    status: String(row.status) as Bounty["status"],
    submitted_work: row.submitted_work ? String(row.submitted_work) : null,
    mira_verdict:
      row.mira_verdict === "approved" || row.mira_verdict === "rejected"
        ? row.mira_verdict
        : null,
    mira_reason: row.mira_reason ? String(row.mira_reason) : null,
    revision_count: Number(row.revision_count ?? 0),
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

function hasDb() {
  return Boolean(supabaseAdmin);
}

export async function listBounties(): Promise<Bounty[]> {
  if (!hasDb()) {
    return getLocalBounties();
  }

  const { data, error } = await supabaseAdmin!
    .from("bounties")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapRow);
}

export async function readBounty(id: string): Promise<Bounty | null> {
  if (!hasDb()) {
    return getLocalBounty(id) ?? null;
  }

  const { data, error } = await supabaseAdmin!.from("bounties").select("*").eq("id", id).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRow(data) : null;
}

export async function createBounty(input: CreateBountyInput): Promise<Bounty> {
  if (!hasDb()) {
    return createLocalBounty(input);
  }

  const now = new Date().toISOString();
  const payload = {
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

  const { data, error } = await supabaseAdmin!.from("bounties").insert(payload).select("*").single();
  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data);
}

export async function claimBounty(id: string, workerWallet = "EQCworkerWalletPlaceholder") {
  if (!hasDb()) {
    return claimLocalBounty(id, workerWallet);
  }

  const bounty = await readBounty(id);
  if (!bounty || bounty.status !== "open") {
    return null;
  }

  const { data, error } = await supabaseAdmin!
    .from("bounties")
    .update({
      status: "claimed",
      worker_wallet: workerWallet,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data);
}

export async function submitBounty(id: string, submittedWork: string) {
  if (!hasDb()) {
    return submitLocalBounty(id, submittedWork);
  }

  const bounty = await readBounty(id);
  if (!bounty || (bounty.status !== "claimed" && bounty.status !== "rejected")) {
    return null;
  }

  const nextRevisionCount = bounty.status === "rejected" ? bounty.revision_count + 1 : bounty.revision_count;

  const { data, error } = await supabaseAdmin!
    .from("bounties")
    .update({
      status: "submitted",
      submitted_work: submittedWork,
      revision_count: nextRevisionCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data);
}

export async function recordVerdict(id: string, verdict: "approved" | "rejected", reason: string) {
  if (!hasDb()) {
    return recordLocalVerdict(id, verdict, reason);
  }

  const bounty = await readBounty(id);
  if (!bounty || bounty.status !== "submitted") {
    return null;
  }

  const { data, error } = await supabaseAdmin!
    .from("bounties")
    .update({
      status: verdict === "approved" ? "approved" : "rejected",
      mira_verdict: verdict,
      mira_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data);
}

export async function releasePayment(id: string) {
  if (!hasDb()) {
    return releaseLocalPayment(id);
  }

  const bounty = await readBounty(id);
  if (!bounty || bounty.status !== "approved") {
    return null;
  }

  const { data, error } = await supabaseAdmin!
    .from("bounties")
    .update({
      status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data);
}
