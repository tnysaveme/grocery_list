"use client";

import { motion } from "framer-motion";

export default function ConnectSpotify() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.h2
                className="text-2xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                tny&apos;s grocery list
            </motion.h2>
            <motion.a
                href="/api/login"
                className="px-8 py-3 bg-black text-white rounded-full font-medium hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Connect Spotify
            </motion.a>
        </div>
    );
}
