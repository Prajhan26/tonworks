import { NextResponse } from "next/server";
import { submitBounty } from "@/lib/bounty-repository";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as { submitted_work?: string };
    const submittedWork = String(body.submitted_work ?? "").trim();

    if (!submittedWork) {
      return NextResponse.json({ error: "Submitted work is required." }, { status: 400 });
    }

    const bounty = await submitBounty(params.id, submittedWork);

    if (!bounty) {
      return NextResponse.json(
        { error: "Bounty must be claimed or reopened before submission." },
        { status: 400 },
      );
    }

    return NextResponse.json({ bounty });
  } catch {
    return NextResponse.json({ error: "Failed to submit work." }, { status: 400 });
  }
}
