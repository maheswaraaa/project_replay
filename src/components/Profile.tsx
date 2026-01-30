import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, BookmarkPlus, Eye, Heart, HardDrive, Info, Shield, ExternalLink } from "lucide-react";
import { NavItem, LibraryTab } from "@/types";

interface ProfileProps {
    setActiveNav: (nav: NavItem) => void;
    setActiveLibraryTab: (tab: LibraryTab) => void;
    watchlist: number[];
    watched: number[];
    favorites: number[];
}

export default function Profile({
    setActiveNav,
    setActiveLibraryTab,
    watchlist,
    watched,
    favorites,
}: ProfileProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center py-8 max-w-lg mx-auto"
        >
            {/* Logo with Glow Effect */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-orange-500/30 rounded-full scale-150" />
                <div className="relative w-24 h-24 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl flex items-center justify-center">
                    <Image
                        src="/logo.png"
                        alt="Replay"
                        width={56}
                        height={56}
                        className="invert"
                        priority
                    />
                </div>
            </motion.div>

            {/* App Title */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
            >
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">Replay</h2>
                <p className="text-sm text-[var(--muted)] tracking-wide">Discover. Watch. Remember.</p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-3 gap-3 w-full mb-6"
            >
                <button
                    onClick={() => { setActiveNav("library"); setActiveLibraryTab("watchlist"); }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-3 text-center hover:border-amber-500/40 transition-all duration-300 hover:scale-105"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <BookmarkPlus size={18} className="mx-auto mb-1.5 text-amber-500" />
                    <p className="text-xl font-bold text-[var(--foreground)]">{watchlist.length}</p>
                    <p className="text-[10px] text-[var(--muted)]">Watchlist</p>
                </button>

                <button
                    onClick={() => { setActiveNav("library"); setActiveLibraryTab("watched"); }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-3 text-center hover:border-green-500/40 transition-all duration-300 hover:scale-105"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Eye size={18} className="mx-auto mb-1.5 text-green-500" />
                    <p className="text-xl font-bold text-[var(--foreground)]">{watched.length}</p>
                    <p className="text-[10px] text-[var(--muted)]">Watched</p>
                </button>

                <button
                    onClick={() => { setActiveNav("library"); setActiveLibraryTab("favorites"); }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-3 text-center hover:border-red-500/40 transition-all duration-300 hover:scale-105"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Heart size={18} className="mx-auto mb-1.5 text-red-500" />
                    <p className="text-xl font-bold text-[var(--foreground)]">{favorites.length}</p>
                    <p className="text-[10px] text-[var(--muted)]">Favorites</p>
                </button>
            </motion.div>

            {/* Explore Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full mb-6"
            >
                <button
                    onClick={() => setActiveNav("home")}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[var(--foreground)] to-[var(--muted)] text-[var(--background)] font-semibold rounded-2xl hover:opacity-90 transition-opacity"
                >
                    <Sparkles size={18} />
                    Explore Movies & TV Shows
                </button>
            </motion.div>

            {/* Data Storage Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="w-full mb-4"
            >
                <div className="p-4 bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10">
                            <HardDrive size={18} className="text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">Your Data Stays Private</h3>
                            <p className="text-xs text-[var(--muted)] leading-relaxed">
                                All your watchlists, favorites, and viewing history are saved locally on your device.
                                No account needed, no cloud sync — your movie memories are yours alone.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--card-border)]/50">
                        <Shield size={12} className="text-green-500" />
                        <span className="text-[10px] text-[var(--muted)]">Data stored in browser&apos;s local storage • Works offline</span>
                    </div>
                </div>
            </motion.div>

            {/* About Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full"
            >
                <div className="p-4 bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-purple-500/10">
                            <Info size={18} className="text-purple-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">About Replay</h3>
                            <p className="text-xs text-[var(--muted)] leading-relaxed">
                                Your personal companion for tracking movies and TV shows. Build your cinema memory vault —
                                discover what to watch next, remember what you&apos;ve seen, and curate your favorites.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2 text-xs text-[var(--muted)]">
                        <div className="flex items-center justify-between py-2 border-t border-[var(--card-border)]/50">
                            <span>Version</span>
                            <span className="font-medium text-[var(--foreground)]">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-[var(--card-border)]/50">
                            <span>Data Source</span>
                            <a
                                href="https://www.themoviedb.org/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 font-medium text-[var(--foreground)] hover:underline"
                            >
                                TMDB API
                                <ExternalLink size={10} />
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-8 text-[10px] text-[var(--muted)] text-center"
            >
                Made with ♥ for movie lovers everywhere
            </motion.p>
        </motion.div>
    );
}
