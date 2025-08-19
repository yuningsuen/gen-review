import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Google Reviews API is working",
    hasApiKey: !!process.env.GOOGLE_PLACES_API_KEY,
    timestamp: new Date().toISOString(),
  });
}
