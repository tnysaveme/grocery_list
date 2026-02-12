import { NextResponse } from "next/server";
import spotifyApi from "@/lib/spotify";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("spotify_access_token")?.value;
    const refreshToken = cookieStore.get("spotify_refresh_token")?.value;

    if (!accessToken && !refreshToken) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    if (accessToken) {
        spotifyApi.setAccessToken(accessToken);
    } else if (refreshToken) {
        // Access token expired, use refresh token
        spotifyApi.setRefreshToken(refreshToken);
        try {
            const data = await spotifyApi.refreshAccessToken();
            const newAccessToken = data.body.access_token;
            const expiresIn = data.body.expires_in;

            spotifyApi.setAccessToken(newAccessToken);

            cookieStore.set("spotify_access_token", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: expiresIn,
                path: "/",
            });
        } catch (err) {
            console.error("Could not refresh access token", err);
            return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
        }
    }

    try {
        const recentlyPlayed = await spotifyApi.getMyRecentlyPlayedTracks({
            limit: 50,
        });

        // Enhance with Playlist Metadata
        const historyItems = recentlyPlayed.body.items;
        const playlistUris = new Set<string>();

        historyItems.forEach(item => {
            if (item.context && item.context.type === 'playlist') {
                playlistUris.add(item.context.uri);
            }
        });

        const playlistMetadata: Record<string, { name: string; image: string | null }> = {};

        // Fetch playlist details
        // Fetch sequentially to avoid rate limits
        for (const uri of Array.from(playlistUris)) {
            try {
                const id = uri.split(':').pop();
                if (id) {
                    console.log(`Fetching playlist: ${id} (URI: ${uri})`);
                    const playlist = await spotifyApi.getPlaylist(id);
                    playlistMetadata[uri] = {
                        name: playlist.body.name,
                        image: playlist.body.images[0]?.url || null
                    };
                    console.log(`Successfully fetched: ${playlist.body.name}`);
                }
            } catch (e: any) {
                console.error(`Failed to fetch playlist ${uri}:`, e?.message || e);
                console.error('Full error:', e);
                // Add fallback with error info for debugging
                playlistMetadata[uri] = {
                    name: `[Error fetching playlist]`,
                    image: null
                };
            }
        }

        console.log("Fetched playlists:", Object.keys(playlistMetadata));

        return NextResponse.json({
            items: historyItems,
            playlists: playlistMetadata
        });
    } catch (error) {
        console.error("Error fetching recently played", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
