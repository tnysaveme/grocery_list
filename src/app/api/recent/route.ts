import { NextResponse } from "next/server";
import SpotifyWebApi from 'spotify-web-api-node';
import { cookies } from "next/headers";

export async function GET() {
    console.log("API: /api/recent called");
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("spotify_access_token")?.value;
    const refreshToken = cookieStore.get("spotify_refresh_token")?.value;

    if (!accessToken && !refreshToken) {
        console.warn("API: No tokens found");
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Create a fresh instance for this request
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });

    if (accessToken) {
        spotifyApi.setAccessToken(accessToken);
    }

    // Always try to refresh if we have a refresh token, to ensure we have a valid session
    // Or only if we suspect it's expired. But explicit refresh is safer if we get 401.
    // For now, let's stick to the existing logic but using the local instance.

    if (refreshToken && !accessToken) {
        console.log("API: Access token missing, trying to refresh with refresh token");
        spotifyApi.setRefreshToken(refreshToken);
        try {
            const data = await spotifyApi.refreshAccessToken();
            const newAccessToken = data.body.access_token;
            const expiresIn = data.body.expires_in;

            console.log("API: Token refreshed successfully");
            spotifyApi.setAccessToken(newAccessToken);

            // Update cookies
            cookieStore.set("spotify_access_token", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: expiresIn,
                path: "/",
            });
        } catch (err: any) {
            console.error("API: Could not refresh access token", err);
            return NextResponse.json({ error: "Failed to refresh token: " + (err.message || err) }, { status: 401 });
        }
    }

    try {
        console.log("API: Fetching recently played tracks...");
        const recentlyPlayed = await spotifyApi.getMyRecentlyPlayedTracks({
            limit: 50,
        });
        console.log(`API: Fetched ${recentlyPlayed.body.items.length} tracks`);

        // Enhance with Playlist Metadata
        const historyItems = recentlyPlayed.body.items;
        const playlistUris = new Set<string>();

        historyItems.forEach(item => {
            if (item.context && item.context.type === 'playlist') {
                playlistUris.add(item.context.uri);
            }
        });

        console.log(`API: Found ${playlistUris.size} unique playlists to fetch`);

        const playlistMetadata: Record<string, { name: string; image: string | null }> = {};

        // Fetch playlist details
        // Fetch sequentially to avoid rate limits
        for (const uri of Array.from(playlistUris)) {
            try {
                const id = uri.split(':').pop();
                if (id) {
                    console.log(`API: Fetching playlist: ${id} (URI: ${uri})`);
                    const playlist = await spotifyApi.getPlaylist(id);
                    playlistMetadata[uri] = {
                        name: playlist.body.name,
                        image: playlist.body.images[0]?.url || null
                    };
                    console.log(`API: Successfully fetched playlist: ${playlist.body.name}`);
                }
            } catch (e: any) {
                console.error(`API: Failed to fetch playlist ${uri}:`, e?.message || e);
                // Keep the error silent in the metadata response to avoid breaking the UI,
                // but maybe we can return a placeholder or just null?
                // The current UI expects an object or undefined.
                // Let's store a placeholder so we know it failed.
                playlistMetadata[uri] = {
                    name: "Unknown Playlist",
                    image: null
                };
            }
        }

        return NextResponse.json({
            items: historyItems,
            playlists: playlistMetadata
        });
    } catch (error: any) {
        console.error("API: Error fetching recently played", error);

        // If it's a 401 from Spotify, we should probably try to refresh the token if we haven't already
        // But for now just return 500 with details
        return NextResponse.json({ error: "Failed to fetch data: " + (error.message || error) }, { status: 500 });
    }
}
