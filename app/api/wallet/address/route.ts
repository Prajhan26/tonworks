import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { address: null, message: "Escrow wallet endpoint ready." },
    { status: 501 },
  );
}
