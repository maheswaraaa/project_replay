import { motion } from "framer-motion";
import { Bookmark, ListPlus, Eye, Heart, Sparkles } from "lucide-react";
import { LibraryTab, NavItem } from "@/types";
import { Movie } from "@/lib/tmdb";
import MovieGrid from "./MovieGrid";
import MovieListItem from "./MovieListItem";

interface LibraryProps {
    activeLibraryTab: LibraryTab;
    setActiveLibraryTab: (tab: LibraryTab) => void;
    movies: Movie[];
    watchlist: number[];
    watched: number[];
    favorites: number[];
    searchQuery: string;
    activeGenre: number | null;
    activeYear: number | null;
    activeLanguage: string | null;
    viewMode: "grid" | "list";
    setActiveNav: (nav: NavItem) => void;
    openMovieDetail: (id: number) => void;
    toggleWatchlist: (id: number, e?: React.MouseEvent) => void;
    markAsWatched: (id: number, e?: React.MouseEvent) => void;
    toggleFavorite: (id: number, e?: React.MouseEvent) => void;
}

export default function Library({
    activeLibraryTab,
    setActiveLibraryTab,
    movies,
    watchlist,
    watched,
    favorites,
    searchQuery,
    activeGenre,
    activeYear,
    activeLanguage,
    viewMode,
    setActiveNav,
    openMovieDetail,
    toggleWatchlist,
    markAsWatched,
    toggleFavorite,
}: LibraryProps) {
    const libraryTabs: { key: LibraryTab; label: string; icon: typeof Bookmark }[] = [
        { key: "watchlist", label: "Watchlist", icon: ListPlus },
        { key: "watched", label: "Watched", icon: Eye },
        { key: "favorites", label: "Favorites", icon: Heart },
    ];

    const applyFilters = (movieList: Movie[]) => {
        let filtered = movieList;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.title.toLowerCase().includes(query) ||
                m.original_title?.toLowerCase().includes(query)
            );
        }

        if (activeGenre) {
            filtered = filtered.filter(m => m.genre_ids?.includes(activeGenre));
        }

        if (activeYear) {
            filtered = filtered.filter(m => {
                const releaseYear = m.release_date ? parseInt(m.release_date.split("-")[0]) : null;
                return releaseYear === activeYear;
            });
        }

        if (activeLanguage) {
            filtered = filtered.filter(m => m.original_language === activeLanguage);
        }

        return filtered;
    };

    const getTabCount = (tabKey: LibraryTab) => {
        const tabMovies = tabKey === "watchlist"
            ? movies.filter(m => watchlist.includes(m.id))
            : tabKey === "watched"
                ? movies.filter(m => watched.includes(m.id))
                : movies.filter(m => favorites.includes(m.id));
        const filteredCount = applyFilters(tabMovies).length;
        const loadedCount = tabMovies.length;
        const savedCount = tabKey === "watchlist" ? watchlist.length
            : tabKey === "watched" ? watched.length
                : favorites.length;
        return { filteredCount, loadedCount, savedCount };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Your Library</h2>

            {/* Library Tabs */}
            <div className="mb-6">
                {/* Mobile: underline tabs */}
                <div className="sm:hidden border-b border-[var(--card-border)]">
                    <div className="flex">
                        {libraryTabs.map((tab) => {
                            const Icon = tab.icon;
                            const { filteredCount } = getTabCount(tab.key);
                            const isActive = activeLibraryTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveLibraryTab(tab.key)}
                                    className="flex-1 relative"
                                >
                                    <div className={`flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors duration-200 ${isActive
                                            ? "text-[var(--foreground)]"
                                            : "text-[var(--muted)]"
                                        }`}>
                                        <Icon size={14} />
                                        <span>{tab.label}</span>
                                        {filteredCount > 0 && (
                                            <span className={`min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold rounded-full leading-none ${isActive
                                                    ? "bg-[var(--foreground)] text-[var(--background)]"
                                                    : "bg-[var(--card-border)] text-[var(--muted)]"
                                                }`}>
                                                {filteredCount}
                                            </span>
                                        )}
                                    </div>
                                    {/* Active indicator bar */}
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

                {/* Desktop: original pill tabs */}
                <div className="hidden sm:flex gap-2">
                    {libraryTabs.map((tab) => {
                        const Icon = tab.icon;
                        const { filteredCount, loadedCount, savedCount } = getTabCount(tab.key);
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveLibraryTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeLibraryTab === tab.key
                                    ? "bg-[var(--foreground)] text-[var(--background)]"
                                    : "bg-[var(--card-bg)] text-[var(--muted)] border border-[var(--card-border)] hover:border-[var(--foreground)]/30"
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                                {filteredCount > 0 && (
                                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${activeLibraryTab === tab.key
                                        ? "bg-[var(--background)] text-[var(--foreground)]"
                                        : "bg-[var(--card-border)] text-[var(--foreground)]"
                                        }`}>
                                        {filteredCount}{loadedCount > filteredCount ? `/${loadedCount}` : savedCount > loadedCount ? `/${savedCount}` : ""}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Nudge: Has watchlist but no watched */}
            {activeLibraryTab === "watchlist" && watchlist.length > 0 && watched.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-xl flex items-center gap-3"
                >
                    <Eye size={20} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm text-[var(--foreground)]">
                        Have you watched any of these? <span className="text-[var(--muted)]">Mark them as watched!</span>
                    </p>
                </motion.div>
            )}

            {/* Watchlist Tab Content */}
            {activeLibraryTab === "watchlist" && (
                <>
                    {watchlist.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <ListPlus size={48} className="text-[var(--muted)] mb-4" />
                            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Your watchlist is empty!</h3>
                            <p className="text-[var(--muted)] text-sm mb-4">Browse and add movies you want to watch.</p>
                            <button
                                onClick={() => setActiveNav("home")}
                                className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <Sparkles size={16} />
                                Discover Movies
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            <MovieGrid
                                movies={applyFilters(movies.filter(m => watchlist.includes(m.id)))}
                                loading={false}
                                viewMode={viewMode}
                                watchlist={watchlist}
                                watched={watched}
                                favorites={favorites}
                                toggleWatchlist={toggleWatchlist}
                                markAsWatched={markAsWatched}
                                toggleFavorite={toggleFavorite}
                                openMovieDetail={openMovieDetail}
                                showEmpty={false}
                            />
                            {movies.filter(m => watchlist.includes(m.id)).length === 0 && watchlist.length > 0 && (
                                <div className="col-span-full text-center py-10 text-[var(--muted)]">
                                    <p>Loading your watchlist...</p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Watched Tab Content */}
            {activeLibraryTab === "watched" && (
                <>
                    {watched.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <Eye size={48} className="text-[var(--muted)] mb-4" />
                            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No watched movies yet</h3>
                            <p className="text-[var(--muted)] text-sm">Mark movies as watched to track what you&apos;ve seen!</p>
                        </motion.div>
                    ) : (
                        <MovieGrid
                            movies={applyFilters(movies.filter(m => watched.includes(m.id)))}
                            loading={false}
                            viewMode={viewMode}
                            watchlist={watchlist}
                            watched={watched}
                            favorites={favorites}
                            toggleWatchlist={toggleWatchlist}
                            markAsWatched={markAsWatched}
                            toggleFavorite={toggleFavorite}
                            openMovieDetail={openMovieDetail}
                        />
                    )}
                </>
            )}

            {/* Favorites Tab Content */}
            {activeLibraryTab === "favorites" && (
                <>
                    {favorites.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <Heart size={48} className="text-[var(--muted)] mb-4" />
                            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No favorites yet</h3>
                            <p className="text-[var(--muted)] text-sm">Movies worth rewatching will appear here!</p>
                        </motion.div>
                    ) : (
                        <MovieGrid
                            movies={applyFilters(movies.filter(m => favorites.includes(m.id)))}
                            loading={false}
                            viewMode={viewMode}
                            watchlist={watchlist}
                            watched={watched}
                            favorites={favorites}
                            toggleWatchlist={toggleWatchlist}
                            markAsWatched={markAsWatched}
                            toggleFavorite={toggleFavorite}
                            openMovieDetail={openMovieDetail}
                        />
                    )}
                </>
            )}
        </motion.div>
    );
}