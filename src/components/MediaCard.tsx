"use client";

import { motion, Variants } from "framer-motion";
import { Star, Film } from "lucide-react";
import { getImageUrl, type Movie } from "@/lib/tmdb";
import MediaActions from "./MediaActions";
import FadeImage from "./FadeImage";

interface MediaCardProps {
    movie: Movie;
    index?: number;
    onOpenDetail: () => void;
    isInWatchlist: boolean;
    isWatched: boolean;
    isFavorite: boolean;
    onToggleWatchlist: (id: number, e?: React.MouseEvent) => void;
    onMarkWatched: (id: number, e?: React.MouseEvent) => void;
    onToggleFavorite: (id: number, e?: React.MouseEvent) => void;
}

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            delay: Math.min(index * 0.03, 0.3),
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    }),
};

export default function MediaCard({
    movie,
    index = 0,
    onOpenDetail,
    isInWatchlist,
    isWatched,
    isFavorite,
    onToggleWatchlist,
    onMarkWatched,
    onToggleFavorite,
}: MediaCardProps) {
    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenDetail}
            className="poster-card relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-[var(--card-bg)]"
        >
            {movie.poster_path ? (
                <FadeImage
                    src={getImageUrl(movie.poster_path, "w500") || ""}
                    alt={movie.title}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--card-bg)] text-[var(--muted)]">
                    <Film size={24} className="mb-2 opacity-50" />
                    <p className="text-[10px] text-center px-2 line-clamp-2">{movie.title}</p>
                </div>
            )}

            {/* Gradient overlay on hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            />

            {/* Rating badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-xs">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{(movie.vote_average ?? 0).toFixed(1)}</span>
            </div>

            {/* Actions overlay */}
            <motion.div
                className="absolute top-2 left-2"
                initial={{ opacity: 0, y: -8 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <MediaActions
                    id={movie.id}
                    isInWatchlist={isInWatchlist}
                    isWatched={isWatched}
                    isFavorite={isFavorite}
                    onToggleWatchlist={onToggleWatchlist}
                    onMarkWatched={onMarkWatched}
                    onToggleFavorite={onToggleFavorite}
                    layout="overlay"
                />
            </motion.div>

            {/* Title overlay */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 p-3"
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <h3 className="text-white text-sm font-medium line-clamp-2">{movie.title}</h3>
                <p className="text-white/60 text-xs mt-1">{movie.release_date?.split("-")[0] || "TBA"}</p>
            </motion.div>
        </motion.div>
    );
}