export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-black">
            <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight">tny&apos;s grocery list</h1>

                {/* Placeholder for potential other header items */}
                <div className="w-4 h-4 rounded-full bg-black animate-pulse" />
            </div>
        </header>
    );
}
