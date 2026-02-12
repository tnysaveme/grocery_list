"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrackItem from "./TrackItem";
import GroupContainer from "./GroupContainer";
import ViewToggle from "./ViewToggle";

interface PlayHistory {
    track: SpotifyApi.TrackObjectFull;
    played_at: string;
    context: SpotifyApi.ContextObject | null;
}

export default function RecentList() {
    const [tracks, setTracks] = useState<PlayHistory[]>([]);
    const [playlists, setPlaylists] = useState<Record<string, { name: string; image: string | null }>>({});
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"all" | "categorized">("all");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/recent");
                if (!res.ok) {
                    if (res.status === 401) throw new Error("Unauthorized");
                    throw new Error("Failed to fetch");
                }
                const data = await res.json();
                setTracks(data.items || []);
                setPlaylists(data.playlists || {});
            } catch (err) {
                setError("Could not load tracks. Try reconnecting.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-8 font-mono text-red-500">{error}</div>;
    }

    // Grouping Logic
    // 1. Identify groups by context.uri (or album.uri fallback)
    // 2. Map groupKey -> Data (tracks, maxTimestamp, info)
    // 3. Sort groups by maxTimestamp
    const groups: Record<string, {
        id: string;
        type: "album" | "playlist";
        title: string;
        image: string;
        latestPlayedAt: number;
        items: PlayHistory[];
    }> = {};

    if (view === "categorized") {
        tracks.forEach((item) => {
            let key: string;
            let type: "album" | "playlist";
            let title: string;
            let image: string;

            // Determine grouping context
            if (item.context && item.context.type === "playlist") {
                key = item.context.uri;
                type = "playlist";
                const meta = playlists[key];
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
                        key="categorized"
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
