import { NextResponse } from "next/server";

export const revalidate = 300; 

export async function GET() {
  const API_KEY = process.env.FOOTBALL_DATA_API_KEY || process.env.FOOTBALL_DATA_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "API key is missing in environment variables" },
      { status: 500 }
    );
  }

  // Team ID 86 = Real Madrid
  const URL = "https://api.football-data.org/v4/teams/86/matches";

  try {
    const response = await fetch(URL, {
      headers: {
        "X-Auth-Token": API_KEY,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Football-Data API Error [${response.status}]:`, errorText);

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit reached (10 requests/min). Please wait a minute and retry." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `API request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Internal API Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with external sports service." },
      { status: 500 }
    );
  }
}