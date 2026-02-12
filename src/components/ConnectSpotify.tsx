"use client";

import { motion } from "framer-motion";

export default function ConnectSpotify() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.a
                href="/api/login"
                className="px-8 py-3 bg-black text-white rounded-full font-medium hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Log in to Spotify
            </motion.a>
        </div>
    );
}
