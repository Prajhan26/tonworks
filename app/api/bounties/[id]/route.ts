import { NextResponse } from "next/server";
import { readBounty } from "@/lib/bounty-repository";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const bounty = await readBounty(params.id);

  if (!bounty) {
    return NextResponse.json({ error: "Bounty not found." }, { status: 404 });
  }

  return NextResponse.json({ bounty });
}
