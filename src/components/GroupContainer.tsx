import { motion } from "framer-motion";
import Image from "next/image";

interface GroupProps {
    title: string;
    type: "album" | "playlist";
    imageUrl: string;
    children: React.ReactNode;
}

export default function GroupContainer({ title, type, imageUrl, children }: GroupProps) {
    return (
        <motion.div
            className="mb-6 md:mb-8 border border-black p-3 md:p-4 rounded-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 border-b border-black/10 pb-3 md:pb-4">
                <div className="relative w-12 h-12 md:w-16 md:h-16 shadow-md border border-black flex-shrink-0">
                    {imageUrl ? (
                        <Image src={imageUrl} alt={title} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200" />
                    )}
                </div>
                <div>
                    <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded-sm">
                        {type}
                    </span>
                    <h3 className="text-base md:text-lg font-bold mt-1 leading-tight line-clamp-1">{title}</h3>
                </div>
            </div>

            <div className="space-y-1 md:space-y-2 pl-2 md:pl-4 border-l border-black/5">
                {children}
            </div>
        </motion.div>
    );
}
