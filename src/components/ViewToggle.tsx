import { motion } from "framer-motion";
import clsx from "clsx";

interface ViewToggleProps {
    view: "all" | "categorized";
    setView: (view: "all" | "categorized") => void;
}

export default function ViewToggle({ view, setView }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full w-fit mx-auto mb-8 border border-transparent">
            {["all", "categorized"].map((v) => (
                <button
                    key={v}
                    onClick={() => setView(v as any)}
                    className={clsx(
                        "relative px-4 py-1.5 text-sm font-medium rounded-full capitalize z-10 transition-colors",
                        view === v ? "text-white" : "text-black hover:text-gray-600"
                    )}
                >
                    {view === v && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-black rounded-full -z-10"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                    {v}
                </button>
            ))}
        </div>
    );
}
