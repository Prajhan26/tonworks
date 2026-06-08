import { NextResponse } from "next/server";
import { claimBounty } from "@/lib/bounty-repository";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let workerWallet = "EQCworkerWalletPlaceholder";

  try {
    const body = (await request.json()) as { worker_wallet?: string };
    if (body.worker_wallet) {
      workerWallet = String(body.worker_wallet);
    }
  } catch {
    // Body is optional for claim.
  }

  const bounty = await claimBounty(params.id, workerWallet);

  if (!bounty) {
    return NextResponse.json(
      { error: "Bounty must be open before it can be claimed." },
      { status: 400 },
    );
  }

  return NextResponse.json({ bounty });
}
