import { NextResponse } from "next/server";
import { createBounty, listBounties } from "@/lib/bounty-repository";
import { parseCreateBountyInput } from "@/lib/validators";

export async function GET() {
  try {
    return NextResponse.json({ data: await listBounties() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load bounties." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bounty = await createBounty(parseCreateBountyInput(body));
    return NextResponse.json({ bounty }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create bounty." },
      { status: 400 },
    );
  }
}
