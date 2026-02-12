"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import TrackItem from "./TrackItem";
import GroupContainer from "./GroupContainer";
import ViewToggle from "./ViewToggle";

interface PlayHistory {
    track: SpotifyApi.TrackObjectFull;
    played_at: string;
    context: SpotifyApi.ContextObject | null;
}

const fetcher = (url: string) => fetch(url).then(async (res) => {
    if (res.status === 401) throw { status: 401, message: "Unauthorized" };
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
});

export default function RecentList() {
    const [view, setView] = useState<"all" | "categorised">("all");

    const { data, error, isLoading } = useSWR("/api/recent", fetcher, {
        refreshInterval: 30000, // Poll every 30 seconds
        revalidateOnFocus: true,
    });

    const tracks: PlayHistory[] = data?.items || [];
    const playlists: Record<string, { name: string; image: string | null }> = data?.playlists || {};

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        if (error.message.includes("401") || error.status === 401) {
            return (
                <div className="flex justify-center p-8">
                    <p className="font-mono text-sm text-gray-500">Session expired. Please log in again.</p>
                </div>
            );
        }
        return <div className="text-center p-8 font-mono text-red-500">Could not load tracks. {error.message}</div>;
    }

    // Grouping Logic
    const groups: Record<string, {
        id: string;
        type: "album" | "playlist";
        title: string;
        image: string;
        latestPlayedAt: number;
        items: PlayHistory[];
    }> = {};

    if (view === "categorised") {
        console.log("Playlists metadata received:", playlists);
        console.log("Playlist URIs in metadata:", Object.keys(playlists));

        tracks.forEach((item) => {
            let key: string;
            let type: "album" | "playlist";
            let title: string;
            let image: string;

            // Determine grouping context
            if (item.context && item.context.type === "playlist") {
                key = item.context.uri;
                type = "playlist";
                console.log(`Looking up playlist with URI: ${key}`);
                const meta = playlists[key];
                console.log(`Found metadata:`, meta);
                title = meta?.name || "Playlist";
                // Prefer playlist image, fallback to track album image
                image = meta?.image || item.track.album.images[0]?.url;
            } else {
                // Group by album
                key = item.track.album.uri;
                type = "album";
                title = item.track.album.name;
                image = item.track.album.images[0]?.url;
            }

            if (!groups[key]) {
                groups[key] = {
                    id: key,
                    type,
                    title,
                    image,
                    latestPlayedAt: 0,
                    items: []
                };
            }

            groups[key].items.push(item);
            const playedAtTime = new Date(item.played_at).getTime();
            if (playedAtTime > groups[key].latestPlayedAt) {
                groups[key].latestPlayedAt = playedAtTime;
            }
        });
    }

    const sortedGroups = Object.values(groups).sort((a, b) => b.latestPlayedAt - a.latestPlayedAt);

    return (
        <div className="pb-20">
            <ViewToggle view={view} setView={setView} />

            <AnimatePresence mode="wait">
                {view === "all" ? (
                    <motion.div
                        key="all"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                    >
                        {tracks.map((item, i) => (
                            <TrackItem
                                key={`${item.played_at}-${i}`}
                                track={item.track}
                                playedAt={item.played_at}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="categorised"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {sortedGroups.map((group) => (
                            <GroupContainer
                                key={group.id}
                                title={group.title}
                                type={group.type}
                                imageUrl={group.image}
                            >
                                {group.items.map((item, i) => (
                                    <TrackItem
                                        key={`${item.played_at}-${i}-grouped`}
                                        track={item.track}
                                        playedAt={item.played_at}
                                    />
                                ))}
                            </GroupContainer>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
