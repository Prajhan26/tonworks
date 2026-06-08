export type WorkType = "writing" | "code" | "research" | "document";

export type BountyStatus =
  | "draft"
  | "funding_pending"
  | "open"
  | "claimed"
  | "submitted"
  | "approved"
  | "rejected"
  | "paid"
  | "cancelled";

export type Bounty = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  work_type: WorkType;
  amount_ton: number;
  poster_wallet: string;
  worker_wallet: string | null;
  status: BountyStatus;
  submitted_work: string | null;
  mira_verdict: "approved" | "rejected" | null;
  mira_reason: string | null;
  revision_count: number;
  created_at: string;
  updated_at: string;
};

export type CreateBountyInput = {
  title: string;
  description: string;
  requirements: string;
  work_type: WorkType;
  amount_ton: number;
  poster_wallet?: string;
};
