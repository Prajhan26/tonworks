import { NextResponse } from "next/server";

export function GET(request: Request) {
  const { origin } = new URL(request.url);

  return NextResponse.json(
    {
      url: origin,
      name: "TONWORK",
      iconUrl: `${origin}/icon.png`,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    }
  );
}
