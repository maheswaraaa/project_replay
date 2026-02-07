"use client";

import { motion, Variants } from "framer-motion";
import { Film } from "lucide-react";
import type { Movie } from "@/lib/tmdb";
import MediaCard from "./MediaCard";
import MovieListItem from "./MovieListItem";
import EmptyState from "./EmptyState";
import type { ViewMode } from "@/types";

interface MediaGridProps {
    movies: Movie[];
    loading: boolean;
    loadingMore?: boolean;
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

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.05,
        },
    },
};

const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.02,
        },
    },
};

const skeletonVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (index: number) => ({
        opacity: 1,
        transition: {
            duration: 0.3,
            delay: index * 0.02,
        },
    }),
};

const emptyStateVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

// Calculate how many skeletons needed to complete current row + add extra row
function getSkeletonCount(moviesCount: number, viewMode: ViewMode): number {
    if (viewMode === "list") return 3;

    // Assume 6 columns on large screens (adjust based on your grid)
    const columns = 6;
    const remainder = moviesCount % columns;
    const toCompleteRow = remainder === 0 ? 0 : columns - remainder;

    // Complete current row + add one full row
    return toCompleteRow + columns;
}

export default function MediaGrid({
    movies,
    loading,
    loadingMore = false,
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
    // Initial loading state
    if (loading) {
        return viewMode === "grid" ? (
            <motion.div
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {[...Array(18)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="aspect-[2/3] rounded-xl skeleton-shimmer"
                        variants={skeletonVariants}
                        custom={i}
                    />
                ))}
            </motion.div>
        ) : (
            <motion.div
                className="space-y-2"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
            >
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        variants={skeletonVariants}
                        custom={i}
                        className="flex gap-3 p-3 bg-[var(--card-bg)] rounded-xl"
                    >
                        <div className="w-16 h-24 rounded-lg skeleton-shimmer flex-shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                            <div className="h-3 w-full rounded skeleton-shimmer" />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    if (movies.length === 0 && showEmpty) {
        return (
            <motion.div
                variants={emptyStateVariants}
                initial="hidden"
                animate="visible"
            >
                <EmptyState
                    icon={Film}
                    title="No movies found"
                    description="Try adjusting your search or filters"
                />
            </motion.div>
        );
    }

    const skeletonCount = loadingMore ? getSkeletonCount(movies.length, viewMode) : 0;

    // List view
    if (viewMode === "list") {
        return (
            <motion.div
                className="space-y-2"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
            >
                {movies.map((movie, index) => (
                    <MovieListItem
                        key={movie.id}
                        movie={movie}
                        index={index}
                        onOpenDetail={() => onOpenDetail(movie)}
                        onAddWatchlist={() => onToggleWatchlist(movie.id)}
                        onMarkWatched={() => onMarkWatched(movie.id)}
                        onToggleFavorite={() => onToggleFavorite(movie.id)}
                        isInWatchlist={watchlist.includes(movie.id)}
                        isWatched={watched.includes(movie.id)}
                        isFavorite={favorites.includes(movie.id)}
                    />
                ))}

                {/* Loading more skeletons for list */}
                {loadingMore && [...Array(skeletonCount)].map((_, i) => (
                    <motion.div
                        key={`skeleton-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-3 p-3 bg-[var(--card-bg)] rounded-xl"
                    >
                        <div className="w-16 h-24 rounded-lg skeleton-shimmer flex-shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                            <div className="h-3 w-full rounded skeleton-shimmer" />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    // Grid view
    return (
        <motion.div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {movies.map((movie, index) => (
                <MediaCard
                    key={`${movie.id}-${index}`}
                    movie={movie}
                    index={index}
                    onOpenDetail={() => onOpenDetail(movie)}
                    isInWatchlist={watchlist.includes(movie.id)}
                    isWatched={watched.includes(movie.id)}
                    isFavorite={favorites.includes(movie.id)}
                    onToggleWatchlist={onToggleWatchlist}
                    onMarkWatched={onMarkWatched}
                    onToggleFavorite={onToggleFavorite}
                />
            ))}

            {/* Loading more skeletons - fills the row + adds extra */}
            {loadingMore && [...Array(skeletonCount)].map((_, i) => (
                <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="aspect-[2/3] rounded-xl skeleton-shimmer"
                />
            ))}
        </motion.div>
    );
}