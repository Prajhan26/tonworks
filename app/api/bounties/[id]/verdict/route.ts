import { NextResponse } from "next/server";
import { recordVerdict } from "@/lib/bounty-repository";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as { verdict?: string; reason?: string };
    const verdict = body.verdict === "approved" || body.verdict === "rejected" ? body.verdict : null;
    const reason = String(body.reason ?? "").trim();

    if (!verdict || !reason) {
      return NextResponse.json(
        { error: "Verdict and reason are required." },
        { status: 400 },
      );
    }

    const bounty = await recordVerdict(params.id, verdict, reason);

    if (!bounty) {
      return NextResponse.json(
        { error: "Bounty must be submitted before a verdict can be recorded." },
        { status: 400 },
      );
    }

    return NextResponse.json({ bounty });
  } catch {
    return NextResponse.json({ error: "Failed to record verdict." }, { status: 400 });
  }
}
