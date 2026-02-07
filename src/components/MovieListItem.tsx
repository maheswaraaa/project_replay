"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Film, Star, BookmarkPlus, Eye, Heart } from "lucide-react";
import { getImageUrl, Movie } from "@/lib/tmdb";
import FadeImage from "./FadeImage";

interface MovieListItemProps {
    movie: Movie;
    index?: number;
    onOpenDetail: () => void;
    onAddWatchlist: () => void;
    onMarkWatched: () => void;
    onToggleFavorite: () => void;
    isInWatchlist: boolean;
    isWatched: boolean;
    isFavorite: boolean;
}

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        x: -20,
    },
    visible: (index: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.35,
            delay: Math.min(index * 0.04, 0.3),
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    }),
};

export default function MovieListItem({
    movie,
    index = 0,
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
            onAddWatchlist();
        } else if (dragX < -swipeThreshold) {
            onMarkWatched();
        }
        setDragX(0);
        setIsDragging(false);
    };

    return (
        <motion.div
            className="relative overflow-hidden rounded-xl"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            custom={index}
        >
            {/* Swipe backgrounds */}
            {isDragging && (
                <>
                    {dragX > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: Math.min(dragX / swipeThreshold, 1) }}
                            className="absolute inset-0 flex items-center pl-4 bg-yellow-500"
                        >
                            <motion.div
                                className="flex items-center gap-2 text-white"
                                animate={{
                                    scale: dragX > swipeThreshold ? 1.1 : 1,
                                    x: Math.min(dragX * 0.1, 10)
                                }}
                            >
                                <BookmarkPlus size={20} />
                                <span className="hidden sm:inline text-sm font-medium">
                                    {isInWatchlist ? "Remove" : "Watchlist"}
                                </span>
                            </motion.div>
                        </motion.div>
                    )}
                    {dragX < 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: Math.min(Math.abs(dragX) / swipeThreshold, 1) }}
                            className="absolute inset-0 flex items-center justify-end pr-4 bg-green-500"
                        >
                            <motion.div
                                className="flex items-center gap-2 text-white"
                                animate={{
                                    scale: Math.abs(dragX) > swipeThreshold ? 1.1 : 1,
                                    x: Math.max(dragX * 0.1, -10)
                                }}
                            >
                                <span className="hidden sm:inline text-sm font-medium">
                                    {isWatched ? "Unwatch" : "Watched"}
                                </span>
                                <Eye size={20} />
                            </motion.div>
                        </motion.div>
                    )}
                </>
            )}

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragStart={handleDragStart}
                onDrag={(_, info) => setDragX(info.offset.x)}
                onDragEnd={handleDragEnd}
                onClick={() => !isDragging && onOpenDetail()}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring" as const, stiffness: 400, damping: 30 }}
                className="relative flex gap-3 p-3 bg-[var(--card-bg)] rounded-xl cursor-pointer"
                style={{ touchAction: "pan-y" }}
            >
                {/* Poster */}
                <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--card-border)]">
                    {movie.poster_path ? (
                        <FadeImage
                            src={getImageUrl(movie.poster_path, "w200") || ""}
                            alt={movie.title}
                            fill
                            loading="lazy"
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Film size={20} className="text-[var(--muted)]" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] line-clamp-1">{movie.title}</h3>

                    <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-1">
                        <span>{movie.release_date?.split("-")[0] || "TBA"}</span>
                        <span>•</span>
                        <div className="flex items-center gap-0.5">
                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            <span>{(movie.vote_average ?? 0).toFixed(1)}</span>
                        </div>
                    </div>

                    <p className="text-xs text-[var(--muted)] mt-1.5 line-clamp-2 leading-relaxed">
                        {movie.overview || "No description available."}
                    </p>

                    {(isInWatchlist || isWatched || isFavorite) && (
                        <motion.div
                            className="flex items-center gap-1 mt-2"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isInWatchlist && (
                                <motion.span
                                    className="px-1.5 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-500 rounded font-medium"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring" as const, stiffness: 500, damping: 25 }}
                                >
                                    Watchlist
                                </motion.span>
                            )}
                            {isWatched && (
                                <motion.span
                                    className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-500 rounded font-medium"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring" as const, stiffness: 500, damping: 25 }}
                                >
                                    Watched
                                </motion.span>
                            )}
                            {isFavorite && (
                                <motion.span
                                    className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-500 rounded font-medium"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring" as const, stiffness: 500, damping: 25 }}
                                >
                                    Favorite
                                </motion.span>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Desktop actions */}
                <div className="hidden sm:flex flex-col items-center justify-center gap-1 flex-shrink-0">
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); onAddWatchlist(); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-lg transition-colors ${isInWatchlist
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-yellow-500"
                            }`}
                    >
                        <BookmarkPlus size={16} />
                    </motion.button>
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); onMarkWatched(); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-lg transition-colors ${isWatched
                            ? "bg-green-500/20 text-green-500"
                            : "text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-green-500"
                            }`}
                    >
                        <Eye size={16} />
                    </motion.button>
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-lg transition-colors ${isFavorite
                            ? "bg-red-500/20 text-red-500"
                            : "text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-red-500"
                            }`}
                    >
                        <Heart size={16} className={isFavorite ? "fill-current" : ""} />
                    </motion.button>
                </div>

                {/* Mobile favorite button */}
                <motion.button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                    whileTap={{ scale: 0.85 }}
                    className={`sm:hidden p-2 rounded-lg self-center flex-shrink-0 ${isFavorite ? "text-red-500" : "text-[var(--muted)]"}`}
                >
                    <Heart size={18} className={isFavorite ? "fill-current" : ""} />
                </motion.button>
            </motion.div>
        </motion.div>
    );
}