import { NextResponse } from "next/server";
import spotifyApi from "@/lib/spotify";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "Code not provided" }, { status: 400 });
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token, expires_in } = data.body;

        const cookieStore = await cookies();

        cookieStore.set("spotify_access_token", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: expires_in,
            path: "/",
        });

        if (refresh_token) {
            cookieStore.set("spotify_refresh_token", refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
            });
        }

        return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
        console.error("Error exchanging code for token", error);
        return NextResponse.json({ error: "Invalid token" }, { status: 500 });
    }
}
