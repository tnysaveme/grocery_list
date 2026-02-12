import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();

    // Clear all Spotify-related cookies
    cookieStore.delete("spotify_access_token");
    cookieStore.delete("spotify_refresh_token");

    // Redirect to home page
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}
