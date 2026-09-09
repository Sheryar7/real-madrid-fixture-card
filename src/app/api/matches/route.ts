import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_KEY;
  // Real Madrid's Official Team ID in Football-Data.org is 86
  const URL = "https://api.football-data.org/v4/teams/86/matches";

  try {
    const response = await fetch(URL, {
      headers: {
        "X-Auth-Token": API_KEY || "",
      },
      next: { revalidate: 3600 }, // Cache data for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch live match data from API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}