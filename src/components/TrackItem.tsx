import { motion } from "framer-motion";
import Image from "next/image";

interface TrackProps {
    track: SpotifyApi.TrackObjectFull;
    playedAt: string;
}

export default function TrackItem({ track, playedAt }: TrackProps) {
    const date = new Date(playedAt);
    const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const timeString = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <motion.a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 md:gap-4 py-3 px-2 rounded-lg hover:bg-black hover:text-white transition-colors cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 border border-black group-hover:border-white overflow-hidden rounded-sm">
                <Image
                    src={track.album.images[0]?.url || ""}
                    alt={track.album.name}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm md:text-base">{track.name}</p>
                <div className="flex items-center gap-2 text-xs md:text-sm opacity-60 group-hover:opacity-80">
                    <span className="truncate max-w-[100px] md:max-w-[150px]">{track.artists.map(a => a.name).join(", ")}</span>
                    <span className="w-1 h-1 rounded-full bg-current opacity-50 flex-shrink-0" />
                    <span className="truncate">{track.album.name}</span>
                </div>
            </div>

            <div className="text-right flex-shrink-0 ml-2">
                <div className="text-[10px] md:text-xs font-mono opacity-50 group-hover:opacity-80 hidden sm:block">
                    {dateString}
                </div>
                <div className="text-[10px] md:text-xs font-mono opacity-50 group-hover:opacity-80 uppercase">
                    {timeString}
                </div>
            </div>
        </motion.a>
    );
}
