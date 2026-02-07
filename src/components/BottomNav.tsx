"use client";

import { motion } from "framer-motion";
import { Home, Search, Bookmark, User } from "lucide-react";
import type { NavItem } from "@/types";

const NAV_ITEMS: { key: NavItem; icon: typeof Home; label: string }[] = [
    { key: "home", icon: Home, label: "Home" },
    { key: "search", icon: Search, label: "Search" },
    { key: "library", icon: Bookmark, label: "Library" },
    { key: "profile", icon: User, label: "Profile" },
];

interface BottomNavProps {
    activeNav: NavItem;
    onChange: (nav: NavItem) => void;
}

export default function BottomNav({ activeNav, onChange }: BottomNavProps) {
    return (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="flex items-center gap-1 px-2 py-2 bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl shadow-lg"
            >
                {NAV_ITEMS.map((item) => (
                    <motion.button
                        key={item.key}
                        onClick={() => onChange(item.key)}
                        className="relative flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-colors duration-200"
                        whileTap={{ scale: 0.95 }}
                    >
                        {activeNav === item.key && (
                            <motion.div
                                layoutId="activeNavBg"
                                className="absolute inset-0 bg-[var(--foreground)] rounded-xl"
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            />
                        )}
                        <motion.div
                            className="relative z-10 flex flex-col items-center gap-1"
                            animate={{ color: activeNav === item.key ? "var(--background)" : "var(--muted)" }}
                            transition={{ duration: 0.2 }}
                        >
                            <item.icon size={20} strokeWidth={activeNav === item.key ? 2.5 : 1.5} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </motion.div>
                    </motion.button>
                ))}
            </motion.div>
        </nav>
    );
}