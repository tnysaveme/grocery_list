import ViewToggle from "./ViewToggle"; // Assuming we want the toggle in the header eventually, but for now just the design

export default function Header() {
    return (
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-sm rounded-full px-6 py-3 flex items-center gap-4 pointer-events-auto">
                <div className="w-3 h-3 rounded-full bg-black animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
                <h1 className="text-sm font-bold tracking-wide uppercase">tny&apos;s grocery list</h1>
            </div>
        </header>
    );
}
