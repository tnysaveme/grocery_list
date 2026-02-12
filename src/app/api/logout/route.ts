import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const cookieStore = await cookies();

    // Clear all Spotify-related cookies
    cookieStore.delete("spotify_access_token");
    cookieStore.delete("spotify_refresh_token");

    // Get the origin from the request
    const url = new URL(request.url);
    const origin = url.origin;

    // Redirect to home page
    return NextResponse.redirect(`${origin}/`);
}
