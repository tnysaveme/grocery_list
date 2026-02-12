"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in by checking if we're on the main page and can fetch data
        fetch("/api/recent")
            .then(res => {
                // Only consider logged in if we get a 200 response
                setIsLoggedIn(res.status === 200);
            })
            .catch(() => {
                // On any error, assume not logged in
                setIsLoggedIn(false);
            });
    }, [pathname]);

    return (
        <header className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-sm rounded-full px-4 py-2 md:px-6 md:py-3 flex items-center gap-4 pointer-events-auto">
                <div className="w-3 h-3 rounded-full bg-black animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
                <h1 className="text-sm font-bold tracking-wide uppercase">tny&apos;s grocery list</h1>
                {isLoggedIn && (
                    <a
                        href="/api/logout"
                        className="ml-2 text-xs px-3 py-1 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Logout
                    </a>
                )}
            </div>
        </header>
    );
}
