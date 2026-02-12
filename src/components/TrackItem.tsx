import { motion } from "framer-motion";
import Image from "next/image";

interface TrackProps {
    track: SpotifyApi.TrackObjectFull;
    playedAt: string;
}

export default function TrackItem({ track, playedAt }: TrackProps) {
    const date = new Date(playedAt);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-black hover:text-white transition-colors cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="relative w-12 h-12 flex-shrink-0 border border-black group-hover:border-white">
                <Image
                    src={track.album.images[0]?.url || ""}
                    alt={track.album.name}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{track.name}</p>
                <p className="text-sm opacity-60 group-hover:opacity-80 truncate">
                    {track.artists.map(a => a.name).join(", ")}
                </p>
            </div>

            <div className="text-xs font-mono opacity-50 group-hover:opacity-80">
                {timeString}
            </div>
        </motion.a>
    );
}
