import { NextResponse } from "next/server";
import { releasePayment, readBounty } from "@/lib/bounty-repository";
import { sendBackendPayout } from "@/lib/backend-wallet";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const bounty = await readBounty(params.id);

    if (!bounty) {
      return NextResponse.json({ error: "Bounty not found." }, { status: 404 });
    }

    if (!bounty.worker_wallet) {
      return NextResponse.json({ error: "Worker wallet is missing." }, { status: 400 });
    }

    if (bounty.status === "paid") {
      return NextResponse.json({ bounty });
    }

    if (bounty.status !== "approved") {
      return NextResponse.json(
        { error: "Bounty must be approved before payment can be released." },
        { status: 400 },
      );
    }

    await sendBackendPayout({
      amountTon: bounty.amount_ton,
      workerWallet: bounty.worker_wallet,
    });

    const updated = await releasePayment(params.id);

    if (!updated) {
      return NextResponse.json(
        { error: "Unable to mark bounty as paid." },
        { status: 500 },
      );
    }

    return NextResponse.json({ bounty: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to release payment." },
      { status: 500 },
    );
  }
}
