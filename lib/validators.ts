import { CreateBountyInput, WorkType } from "@/lib/types";

const workTypes: WorkType[] = ["writing", "code", "research", "document"];

export function isWorkType(value: string): value is WorkType {
  return workTypes.includes(value as WorkType);
}

export function parseCreateBountyInput(data: unknown): CreateBountyInput {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid request body.");
  }

  const record = data as Record<string, unknown>;
  const title = String(record.title ?? "").trim();
  const description = String(record.description ?? "").trim();
  const requirements = String(record.requirements ?? "").trim();
  const work_type = String(record.work_type ?? "").trim();
  const amount_ton = Number(record.amount_ton);
  const poster_wallet = record.poster_wallet ? String(record.poster_wallet).trim() : undefined;

  if (!title || !description || !requirements) {
    throw new Error("Title, description, and requirements are required.");
  }

  if (!isWorkType(work_type)) {
    throw new Error("Invalid work type.");
  }

  if (!Number.isFinite(amount_ton) || amount_ton <= 0) {
    throw new Error("TON amount must be a positive number.");
  }

  return {
    title,
    description,
    requirements,
    work_type,
    amount_ton,
    poster_wallet,
  };
}
