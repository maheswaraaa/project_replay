"use client";

import { motion } from "framer-motion";
import {
    ListPlus, Eye, Heart, Loader2, Sparkles,
} from "lucide-react";
import type { Movie } from "@/lib/tmdb";
import MediaTypeToggle from "./MediaTypeToggle";
import MediaGrid from "./MediaGrid";
import EmptyState from "./EmptyState";
import type { LibraryTab, MediaTypeFilter, ViewMode } from "@/types";
import { EASE_OUT } from "@/types";

const LIBRARY_TABS: { key: LibraryTab; label: string; icon: typeof ListPlus }[] = [
    { key: "watchlist", label: "Watchlist", icon: ListPlus },
    { key: "watched", label: "Watched", icon: Eye },
    { key: "favorites", label: "Favorites", icon: Heart },
];

interface LibraryViewProps {
    activeTab: LibraryTab;
    setActiveTab: (tab: LibraryTab) => void;
    activeMediaType: MediaTypeFilter;
    setActiveMediaType: (type: MediaTypeFilter) => void;
    viewMode: ViewMode;
    libraryMovies: Movie[];
    libraryLoading: boolean;
    watchlist: number[];
    watched: number[];
    favorites: number[];
    searchQuery: string;
    activeGenre: number | null;
    activeYear: number | null;
    activeLanguage: string | null;
    onOpenDetail: (movie: Movie) => void;
    onToggleWatchlist: (id: number, e?: React.MouseEvent) => void;
    onMarkWatched: (id: number, e?: React.MouseEvent) => void;
    onToggleFavorite: (id: number, e?: React.MouseEvent) => void;
    onNavigateHome: () => void;
}

function applyLibraryFilters(
    movieList: Movie[],
    {
        searchQuery,
        activeMediaType,
        activeGenre,
        activeYear,
        activeLanguage,
    }: {
        searchQuery: string;
        activeMediaType: MediaTypeFilter;
        activeGenre: number | null;
        activeYear: number | null;
        activeLanguage: string | null;
    }
): Movie[] {
    let filtered = movieList;

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
            (m) =>
                m.title.toLowerCase().includes(query) ||
                m.original_title?.toLowerCase().includes(query)
        );
    }

    if (activeMediaType !== "all") {
        filtered = filtered.filter((m) => {
            const mt = (m as unknown as { media_type?: string }).media_type;
            if (activeMediaType === "movie") return mt === "movie" || mt === undefined;
            return mt === "tv";
        });
    }

    if (activeGenre) filtered = filtered.filter((m) => m.genre_ids?.includes(activeGenre));

    if (activeYear) {
        filtered = filtered.filter((m) => {
            const y = m.release_date ? parseInt(m.release_date.split("-")[0]) : null;
            return y === activeYear;
        });
    }

    if (activeLanguage) filtered = filtered.filter((m) => m.original_language === activeLanguage);

    return filtered;
}

export default function LibraryView({
    activeTab,
    setActiveTab,
    activeMediaType,
    setActiveMediaType,
    viewMode,
    libraryMovies,
    libraryLoading,
    watchlist,
    watched,
    favorites,
    searchQuery,
    activeGenre,
    activeYear,
    activeLanguage,
    onOpenDetail,
    onToggleWatchlist,
    onMarkWatched,
    onToggleFavorite,
    onNavigateHome,
}: LibraryViewProps) {
    const filterParams = { searchQuery, activeMediaType, activeGenre, activeYear, activeLanguage };

    const getTabIds = (tab: LibraryTab) =>
        tab === "watchlist" ? watchlist : tab === "watched" ? watched : favorites;

    const getTabMovies = (tab: LibraryTab) =>
        libraryMovies.filter((m) => getTabIds(tab).includes(m.id));

    const getFilteredTabMovies = (tab: LibraryTab) =>
        applyLibraryFilters(getTabMovies(tab), filterParams);

    const currentIds = getTabIds(activeTab);
    const currentMovies = getFilteredTabMovies(activeTab);

    const emptyConfig: Record<LibraryTab, {
        icon: typeof ListPlus;
        title: string;
        description: string;
        action?: { label: string; icon: typeof Sparkles; onClick: () => void };
    }> = {
        watchlist: {
            icon: ListPlus,
            title: "Your watchlist is empty!",
            description: "Browse and add movies you want to watch.",
            action: { label: "Discover Movies", icon: Sparkles, onClick: onNavigateHome },
        },
        watched: {
            icon: Eye,
            title: "No watched movies yet",
            description: "Mark movies as watched to track what you've seen!",
        },
        favorites: {
            icon: Heart,
            title: "No favorites yet",
            description: "Movies worth rewatching will appear here!",
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--foreground)]">Your Library</h2>
                <MediaTypeToggle
                    value={activeMediaType}
                    onChange={setActiveMediaType}
                    size="sm"
                />
            </div>

            {libraryLoading && (
                <div className="flex items-center gap-2 mb-4 text-[var(--muted)]">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Loading library items...</span>
                </div>
            )}

            {/* Tabs */}
            <div className="mb-6">
                {/* Mobile tabs */}
                <div className="sm:hidden border-b border-[var(--card-border)]">
                    <div className="flex">
                        {LIBRARY_TABS.map((tab) => {
                            const count = getFilteredTabMovies(tab.key).length;
                            const isActive = activeTab === tab.key;
                            const Icon = tab.icon;
                            return (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex-1 relative">
                                    <div
                                        className={`flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors duration-200 ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                                            }`}
                                    >
                                        <Icon size={14} />
                                        <span>{tab.label}</span>
                                        {count > 0 && (
                                            <span
                                                className={`min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold rounded-full leading-none ${isActive
                                                    ? "bg-[var(--foreground)] text-[var(--background)]"
                                                    : "bg-[var(--card-border)] text-[var(--muted)]"
                                                    }`}
                                            >
                                                {count}
                                            </span>
                                        )}
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeLibraryTab"
                                            className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--foreground)] rounded-full"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Desktop tabs */}
                <div className="hidden sm:flex gap-2">
                    {LIBRARY_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const tabMovies = getTabMovies(tab.key);
                        const filteredCount = applyLibraryFilters(tabMovies, filterParams).length;
                        const savedCount = getTabIds(tab.key).length;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab.key
                                    ? "bg-[var(--foreground)] text-[var(--background)]"
                                    : "bg-[var(--card-bg)] text-[var(--muted)] border border-[var(--card-border)] hover:border-[var(--foreground)]/30"
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                                {filteredCount > 0 && (
                                    <span
                                        className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.key
                                            ? "bg-[var(--background)] text-[var(--foreground)]"
                                            : "bg-[var(--card-border)] text-[var(--foreground)]"
                                            }`}
                                    >
                                        {filteredCount}
                                        {tabMovies.length > filteredCount
                                            ? `/${tabMovies.length}`
                                            : savedCount > tabMovies.length
                                                ? `/${savedCount}`
                                                : ""}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Watchlist nudge */}
            {activeTab === "watchlist" && watchlist.length > 0 && watched.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-xl flex items-center gap-3"
                >
                    <Eye size={20} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm text-[var(--foreground)]">
                        Have you watched any of these?{" "}
                        <span className="text-[var(--muted)]">Mark them as watched!</span>
                    </p>
                </motion.div>
            )}

            {/* Content */}
            {currentIds.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <EmptyState {...emptyConfig[activeTab]} />
                </motion.div>
            ) : (
                <MediaGrid
                    movies={currentMovies}
                    loading={false}
                    viewMode={viewMode}
                    showEmpty={false}
                    watchlist={watchlist}
                    watched={watched}
                    favorites={favorites}
                    onOpenDetail={onOpenDetail}
                    onToggleWatchlist={onToggleWatchlist}
                    onMarkWatched={onMarkWatched}
                    onToggleFavorite={onToggleFavorite}
                />
            )}
        </motion.div>
    );
}