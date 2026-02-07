"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BookmarkPlus, Eye, Heart, Sparkles } from "lucide-react";
import type { NavItem, LibraryTab } from "@/types";
import { EASE_OUT } from "@/types";

interface ProfileViewProps {
    watchlistCount: number;
    watchedCount: number;
    favoritesCount: number;
    onNavigate: (nav: NavItem, tab?: LibraryTab) => void;
}

export default function ProfileView({
    watchlistCount,
    watchedCount,
    favoritesCount,
    onNavigate,
}: ProfileViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="flex flex-col items-center py-4 min-h-[calc(100vh-8rem)]"
        >
            {/* Logo */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex items-center gap-3 mb-4"
            >
                <div className="relative">
                    <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-orange-500/30 rounded-full scale-150" />
                    <div className="relative w-14 h-14 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg flex items-center justify-center">
                        <Image src="/logo.png" alt="Replay" width={32} height={32} className="invert" priority />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[var(--foreground)]">Replay</h2>
                    <p className="text-xs text-[var(--muted)]">Discover. Watch. Remember.</p>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-2 w-full max-w-xs mb-4"
            >
                <button
                    onClick={() => onNavigate("library", "watchlist")}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-3 text-center hover:border-amber-500/40 transition-all duration-200 hover:scale-102"
                >
                    <BookmarkPlus size={16} className="mx-auto mb-1 text-amber-500" />
                    <p className="text-lg font-bold text-[var(--foreground)]">{watchlistCount}</p>
                    <p className="text-[10px] text-[var(--muted)]">Watchlist</p>
                </button>

                <button
                    onClick={() => onNavigate("library", "watched")}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-3 text-center hover:border-green-500/40 transition-all duration-200 hover:scale-102"
                >
                    <Eye size={16} className="mx-auto mb-1 text-green-500" />
                    <p className="text-lg font-bold text-[var(--foreground)]">{watchedCount}</p>
                    <p className="text-[10px] text-[var(--muted)]">Watched</p>
                </button>

                <button
                    onClick={() => onNavigate("library", "favorites")}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-3 text-center hover:border-red-500/40 transition-all duration-200 hover:scale-102"
                >
                    <Heart size={16} className="mx-auto mb-1 text-red-500" />
                    <p className="text-lg font-bold text-[var(--foreground)]">{favoritesCount}</p>
                    <p className="text-[10px] text-[var(--muted)]">Favorites</p>
                </button>
            </motion.div>

            {/* Explore button */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-xs mb-4"
            >
                <button
                    onClick={() => onNavigate("home")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--foreground)] text-[var(--background)] font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                    <Sparkles size={16} />
                    Explore Movies & TV Shows
                </button>
            </motion.div>

            {/* About */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-xs p-4 rounded-xl bg-[var(--card-bg)]/50 border border-[var(--card-border)]/30"
            >
                <h3 className="text-xs font-semibold text-[var(--foreground)] mb-2">About Replay</h3>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed mb-2">
                    Your personal movie & TV companion. All data stored{" "}
                    <span className="text-[var(--foreground)]">locally on your device</span> — no accounts, no tracking.
                </p>
                <p className="text-[9px] text-[var(--muted)]/70">Built with ♥ • Data from TMDB</p>
            </motion.div>

            <div className="flex-1" />

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] text-[var(--muted)]/50 mt-4"
            >
                Powered by TMDB API
            </motion.p>
        </motion.div>
    );
}