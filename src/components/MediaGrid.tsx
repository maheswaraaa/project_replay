import { Film } from "lucide-react";
import type { Movie } from "@/lib/tmdb";
import MediaCard from "./MediaCard";
import MovieListItem from "./MovieListItem";
import EmptyState from "./EmptyState";
import type { ViewMode } from "@/types";

interface MediaGridProps {
    movies: Movie[];
    loading: boolean;
    viewMode: ViewMode;
    showEmpty?: boolean;
    watchlist: number[];
    watched: number[];
    favorites: number[];
    onOpenDetail: (movie: Movie) => void;
    onToggleWatchlist: (id: number, e?: React.MouseEvent) => void;
    onMarkWatched: (id: number, e?: React.MouseEvent) => void;
    onToggleFavorite: (id: number, e?: React.MouseEvent) => void;
}

export default function MediaGrid({
    movies,
    loading,
    viewMode,
    showEmpty = true,
    watchlist,
    watched,
    favorites,
    onOpenDetail,
    onToggleWatchlist,
    onMarkWatched,
    onToggleFavorite,
}: MediaGridProps) {
    if (loading) {
        return viewMode === "grid" ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                {[...Array(18)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-xl skeleton" />
                ))}
            </div>
        ) : (
            <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl skeleton" />
                ))}
            </div>
        );
    }

    if (movies.length === 0 && showEmpty) {
        return (
            <EmptyState
                icon={Film}
                title="No movies found"
                description="Try adjusting your search or filters"
            />
        );
    }

    if (viewMode === "list") {
        return (
            <div className="space-y-2">
                {movies.map((movie) => (
                    <MovieListItem
                        key={movie.id}
                        movie={movie}
                        onOpenDetail={() => onOpenDetail(movie)}
                        onAddWatchlist={() => onToggleWatchlist(movie.id)}
                        onMarkWatched={() => onMarkWatched(movie.id)}
                        onToggleFavorite={() => onToggleFavorite(movie.id)}
                        isInWatchlist={watchlist.includes(movie.id)}
                        isWatched={watched.includes(movie.id)}
                        isFavorite={favorites.includes(movie.id)}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {movies.map((movie, index) => (
                <MediaCard
                    key={`${movie.id}-${index}`}
                    movie={movie}
                    onOpenDetail={() => onOpenDetail(movie)}
                    isInWatchlist={watchlist.includes(movie.id)}
                    isWatched={watched.includes(movie.id)}
                    isFavorite={favorites.includes(movie.id)}
                    onToggleWatchlist={onToggleWatchlist}
                    onMarkWatched={onMarkWatched}
                    onToggleFavorite={onToggleFavorite}
                />
            ))}
        </div>
    );
}