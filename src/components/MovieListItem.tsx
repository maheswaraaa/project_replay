import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Film, Star, BookmarkPlus, Eye, Heart } from "lucide-react";
import { getImageUrl, Movie } from "@/lib/tmdb";

interface MovieListItemProps {
    movie: Movie;
    onOpenDetail: () => void;
    onAddWatchlist: () => void;
    onMarkWatched: () => void;
    onToggleFavorite: () => void;
    isInWatchlist: boolean;
    isWatched: boolean;
    isFavorite: boolean;
}

export default function MovieListItem({
    movie,
    onOpenDetail,
    onAddWatchlist,
    onMarkWatched,
    onToggleFavorite,
    isInWatchlist,
    isWatched,
    isFavorite,
}: MovieListItemProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragX, setDragX] = useState(0);
    const swipeThreshold = 80;

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        if (dragX > swipeThreshold) {
            // Swiped RIGHT - Add to Watchlist
            onAddWatchlist();
        } else if (dragX < -swipeThreshold) {
            // Swiped LEFT - Mark as Watched
            onMarkWatched();
        }
        setDragX(0);
        setIsDragging(false);
    };

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Swipe action backgrounds - only visible when dragging */}
            {isDragging && (
                <>
                    {/* Right Swipe Background - Watchlist (Yellow) */}
                    {dragX > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center pl-4 bg-yellow-500"
                        >
                            <div className="flex items-center gap-2 text-white">
                                <BookmarkPlus size={20} />
                                <span className="text-sm font-medium">
                                    {isInWatchlist ? "Remove" : "Watchlist"}
                                </span>
                            </div>
                        </motion.div>
                    )}
                    {/* Left Swipe Background - Watched (Green) */}
                    {dragX < 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-end pr-4 bg-green-500"
                        >
                            <div className="flex items-center gap-2 text-white">
                                <span className="text-sm font-medium">
                                    {isWatched ? "Unwatch" : "Watched"}
                                </span>
                                <Eye size={20} />
                            </div>
                        </motion.div>
                    )}
                </>
            )}

            {/* Main content - draggable with spring snap */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragStart={handleDragStart}
                onDrag={(_, info) => setDragX(info.offset.x)}
                onDragEnd={handleDragEnd}
                onClick={() => !isDragging && onOpenDetail()}
                whileDrag={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative flex gap-3 p-3 bg-[var(--card-bg)] rounded-xl cursor-pointer"
                style={{ touchAction: "pan-y" }}
            >
                {/* Poster */}
                <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--card-border)]">
                    {movie.poster_path ? (
                        <Image
                            src={getImageUrl(movie.poster_path, "w200") || ""}
                            alt={movie.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Film size={20} className="text-[var(--muted)]" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] line-clamp-1">{movie.title}</h3>

                    {/* Meta info row */}
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-1">
                        <span>{movie.release_date?.split("-")[0] || "TBA"}</span>
                        <span>•</span>
                        <div className="flex items-center gap-0.5">
                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            <span>{(movie.vote_average ?? 0).toFixed(1)}</span>
                        </div>
                    </div>

                    {/* Overview - 2 lines */}
                    <p className="text-xs text-[var(--muted)] mt-1.5 line-clamp-2 leading-relaxed">
                        {movie.overview || "No description available."}
                    </p>

                    {/* Status Badges */}
                    {(isInWatchlist || isWatched || isFavorite) && (
                        <div className="flex items-center gap-1 mt-2">
                            {isInWatchlist && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-500 rounded font-medium">Watchlist</span>
                            )}
                            {isWatched && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-500 rounded font-medium">Watched</span>
                            )}
                            {isFavorite && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-500 rounded font-medium">Favorite</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons - Visible on desktop, swipe on mobile */}
                <div className="hidden sm:flex flex-col items-center justify-center gap-1 flex-shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddWatchlist(); }}
                        className={`p-2 rounded-lg transition-colors ${isInWatchlist
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-yellow-500"
                            }`}
                        title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                        <BookmarkPlus size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onMarkWatched(); }}
                        className={`p-2 rounded-lg transition-colors ${isWatched
                            ? "bg-green-500/20 text-green-500"
                            : "text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-green-500"
                            }`}
                        title={isWatched ? "Mark as Unwatched" : "Mark as Watched"}
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                        className={`p-2 rounded-lg transition-colors ${isFavorite
                            ? "bg-red-500/20 text-red-500"
                            : "text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-red-500"
                            }`}
                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                        <Heart size={16} className={isFavorite ? "fill-current" : ""} />
                    </button>
                </div>

                {/* Favorite button always visible (mobile too) */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                    className={`sm:hidden p-2 rounded-lg self-center flex-shrink-0 ${isFavorite
                        ? "text-red-500"
                        : "text-[var(--muted)]"
                        }`}
                >
                    <Heart size={18} className={isFavorite ? "fill-current" : ""} />
                </button>
            </motion.div>
        </div>
    );
}
