import { Film, Search, Loader2 } from "lucide-react";
import MovieCard from "./MovieCard";
import MovieListItem from "./MovieListItem";
import { Movie } from "@/lib/tmdb";
import { NavItem } from "@/types";

interface MovieGridProps {
    movies: Movie[];
    loading: boolean;
    viewMode: "grid" | "list";
    activeNav?: NavItem;
    searchQuery?: string;
    openMovieDetail: (id: number) => void;
    watchlist: number[];
    watched: number[];
    favorites: number[];
    toggleWatchlist: (id: number, e?: React.MouseEvent) => void;
    markAsWatched: (id: number, e?: React.MouseEvent) => void;
    toggleFavorite: (id: number, e?: React.MouseEvent) => void;
    showEmpty?: boolean;
}

export default function MovieGrid({
    movies,
    loading,
    viewMode,
    activeNav,
    searchQuery,
    openMovieDetail,
    watchlist,
    watched,
    favorites,
    toggleWatchlist,
    markAsWatched,
    toggleFavorite,
    showEmpty = true,
}: MovieGridProps) {

    if (loading) {
        if (viewMode === "list") {
            return (
                <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-20 rounded-xl skeleton" />
                    ))}
                </div>
            )
        }
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                {[...Array(18)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-xl skeleton" />
                ))}
            </div>
        );
    }

    if (movies.length === 0 && showEmpty) {
        if (activeNav === "search" && !searchQuery) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search size={48} className="text-[var(--muted)] mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Search for movies</h3>
                    <p className="text-[var(--muted)] text-sm">Type to start searching</p>
                </div>
            )
        }
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Film size={48} className="text-[var(--muted)] mb-4" />
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No movies found</h3>
                <p className="text-[var(--muted)] text-sm">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <>
            {viewMode === "grid" ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                    {movies.map((movie, index) => (
                        <MovieCard
                            key={`${movie.id}-${index}`}
                            movie={movie}
                            openMovieDetail={openMovieDetail}
                            toggleWatchlist={toggleWatchlist}
                            markAsWatched={markAsWatched}
                            toggleFavorite={toggleFavorite}
                            isInWatchlist={watchlist.includes(movie.id)}
                            isWatched={watched.includes(movie.id)}
                            isFavorite={favorites.includes(movie.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {movies.map((movie) => (
                        <MovieListItem
                            key={movie.id}
                            movie={movie}
                            onOpenDetail={() => openMovieDetail(movie.id)}
                            onAddWatchlist={() => toggleWatchlist(movie.id)}
                            onMarkWatched={() => markAsWatched(movie.id)}
                            onToggleFavorite={() => toggleFavorite(movie.id)}
                            isInWatchlist={watchlist.includes(movie.id)}
                            isWatched={watched.includes(movie.id)}
                            isFavorite={favorites.includes(movie.id)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
