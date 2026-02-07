"use client";

import { AnimatePresence, motion, useDragControls, PanInfo, Variants } from "framer-motion";
import {
    X, ChevronLeft, Star, Calendar, Clock, Film, Loader2,
} from "lucide-react";
import {
    getImageUrl, getBackdropUrl,
    type MovieDetail, type TVShowDetail, type CastMember, type WatchProvider,
} from "@/lib/tmdb";
import MediaActions from "./MediaActions";
import CastList from "./CastList";
import WatchProviderList from "./WatchProviderList";
import FadeImage from "./FadeImage";
import { useCallback, useRef } from "react";

interface MediaDetailModalProps {
    show: boolean;
    loading: boolean;
    movie: MovieDetail | null;
    tvShow: TVShowDetail | null;
    cast: CastMember[];
    watchProviders: WatchProvider[];
    isInWatchlist: boolean;
    isWatched: boolean;
    isFavorite: boolean;
    onClose: () => void;
    onToggleWatchlist: (id: number, e?: React.MouseEvent) => void;
    onMarkWatched: (id: number, e?: React.MouseEvent) => void;
    onToggleFavorite: (id: number, e?: React.MouseEvent) => void;
}

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const modalVariants: Variants = {
    hidden: {
        y: "100%",
        opacity: 0.5,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            damping: 30,
            stiffness: 300,
            mass: 0.8,
        },
    },
    exit: {
        y: "100%",
        opacity: 0.5,
        transition: {
            type: "spring",
            damping: 30,
            stiffness: 300,
        },
    },
};

const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.1,
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

export default function MediaDetailModal({
    show,
    loading,
    movie,
    tvShow,
    cast,
    watchProviders,
    isInWatchlist,
    isWatched,
    isFavorite,
    onClose,
    onToggleWatchlist,
    onMarkWatched,
    onToggleFavorite,
}: MediaDetailModalProps) {
    const dragControls = useDragControls();
    const constraintsRef = useRef(null);

    const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.velocity.y > 500 || info.offset.y > 200) {
            onClose();
        }
    }, [onClose]);

    if (!show) return null;

    const media = tvShow || movie;
    const id = media?.id ?? 0;
    const title = tvShow ? tvShow.name : movie?.title ?? "";
    const tagline = media?.tagline;
    const overview = media?.overview || "No overview available.";
    const backdropPath = media?.backdrop_path ?? null;
    const posterPath = media?.poster_path ?? null;
    const voteAverage = media?.vote_average ?? 0;
    const genres = media?.genres ?? [];
    const date = tvShow ? tvShow.first_air_date : movie?.release_date;

    return (
        <AnimatePresence mode="wait">
            {show && (
                <motion.div
                    ref={constraintsRef}
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm modal-backdrop flex items-end md:items-center justify-center"
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        drag="y"
                        dragControls={dragControls}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl max-h-[90vh] bg-[var(--card-bg)] rounded-t-3xl md:rounded-2xl overflow-hidden touch-none"
                    >
                        {/* Drag handle */}
                        <div
                            className="md:hidden flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <motion.div
                                className="w-10 h-1 bg-[var(--muted)]/30 rounded-full"
                                whileHover={{ scaleX: 1.2, backgroundColor: "var(--muted)" }}
                            />
                        </div>

                        {loading ? (
                            <motion.div
                                className="flex items-center justify-center h-96"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                >
                                    <Loader2 size={32} className="text-[var(--muted)]" />
                                </motion.div>
                            </motion.div>
                        ) : media ? (
                            <motion.div
                                variants={contentVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {/* Backdrop */}
                                <div className="relative h-48 md:h-64 overflow-hidden">
                                    {backdropPath ? (
                                        <FadeImage
                                            src={getBackdropUrl(backdropPath) || ""}
                                            alt={title}
                                            fill
                                            loading="eager"
                                            className="object-cover"
                                            wrapperClassName="absolute inset-0"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[var(--card-border)]" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent" />

                                    <motion.button
                                        onClick={onClose}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        <X size={20} className="text-white" />
                                    </motion.button>
                                    <motion.button
                                        onClick={onClose}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors md:hidden"
                                    >
                                        <ChevronLeft size={20} className="text-white" />
                                    </motion.button>
                                </div>

                                {/* Content */}
                                <div className="px-5 pb-8 -mt-16 relative overflow-y-auto max-h-[calc(90vh-12rem)]">
                                    {/* Header */}
                                    <div className="flex gap-4 mb-4">
                                        <motion.div
                                            className="relative w-24 h-36 rounded-xl overflow-hidden shadow-xl flex-shrink-0 bg-[var(--card-border)]"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2, duration: 0.4 }}
                                        >
                                            <FadeImage
                                                src={getImageUrl(posterPath, "w300") || ""}
                                                alt={title}
                                                fill
                                                loading="eager"
                                                className="object-cover"
                                                wrapperClassName="absolute inset-0"
                                            />
                                        </motion.div>
                                        <div className="flex-1 pt-16">
                                            <motion.h2
                                                className="text-xl font-bold text-[var(--foreground)]"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.25 }}
                                            >
                                                {title}
                                            </motion.h2>
                                            {tagline && (
                                                <motion.p
                                                    className="text-sm text-[var(--muted)] italic mt-1"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    &ldquo;{tagline}&rdquo;
                                                </motion.p>
                                            )}
                                            <motion.div
                                                className="flex flex-wrap items-center gap-3 mt-3 text-sm text-[var(--muted)]"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.35 }}
                                            >
                                                <span className="flex items-center gap-1">
                                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                                    {voteAverage.toFixed(1)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {date?.split("-")[0]}
                                                </span>
                                                {movie && movie.runtime > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                                                    </span>
                                                )}
                                                {tvShow && (
                                                    <span className="px-2 py-0.5 bg-[var(--background)] rounded text-xs font-medium">
                                                        {tvShow.status}
                                                    </span>
                                                )}
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Genres */}
                                    <motion.div
                                        className="flex flex-wrap gap-2 mb-4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {genres.map((genre, index) => (
                                            <motion.span
                                                key={genre.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4 + index * 0.05 }}
                                                className="px-3 py-1 bg-[var(--background)] text-[var(--foreground)] text-xs font-medium rounded-full border border-[var(--card-border)]"
                                            >
                                                {genre.name}
                                            </motion.span>
                                        ))}
                                    </motion.div>

                                    {/* TV Stats */}
                                    {tvShow && (
                                        <motion.div
                                            className="flex gap-4 mb-4 p-3 bg-[var(--background)] rounded-xl border border-[var(--card-border)]"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.45 }}
                                        >
                                            <div className="text-center flex-1">
                                                <p className="text-2xl font-bold text-[var(--foreground)]">{tvShow.number_of_seasons}</p>
                                                <p className="text-xs text-[var(--muted)]">Seasons</p>
                                            </div>
                                            <div className="w-px bg-[var(--card-border)]" />
                                            <div className="text-center flex-1">
                                                <p className="text-2xl font-bold text-[var(--foreground)]">{tvShow.number_of_episodes}</p>
                                                <p className="text-xs text-[var(--muted)]">Episodes</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Actions */}
                                    <motion.div
                                        className="mb-6"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <MediaActions
                                            id={id}
                                            isInWatchlist={isInWatchlist}
                                            isWatched={isWatched}
                                            isFavorite={isFavorite}
                                            onToggleWatchlist={onToggleWatchlist}
                                            onMarkWatched={onMarkWatched}
                                            onToggleFavorite={onToggleFavorite}
                                            layout="row"
                                        />
                                    </motion.div>

                                    {/* Overview */}
                                    <motion.div
                                        className="mb-6"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.55 }}
                                    >
                                        <h3 className="font-semibold text-[var(--foreground)] mb-2">Overview</h3>
                                        <p className="text-sm text-[var(--muted)] leading-relaxed">{overview}</p>
                                    </motion.div>

                                    {/* Seasons */}
                                    {tvShow?.seasons && tvShow.seasons.length > 0 && (
                                        <motion.div
                                            className="mb-6"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <h3 className="font-semibold text-[var(--foreground)] mb-3">Seasons</h3>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {tvShow.seasons
                                                    .filter((s) => s.season_number > 0)
                                                    .map((season, index) => (
                                                        <motion.div
                                                            key={season.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.6 + index * 0.05 }}
                                                            className="flex items-center gap-3 p-2 bg-[var(--background)] rounded-lg border border-[var(--card-border)]"
                                                        >
                                                            {season.poster_path ? (
                                                                <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0">
                                                                    <FadeImage
                                                                        src={getImageUrl(season.poster_path, "w200") || ""}
                                                                        alt={season.name}
                                                                        fill
                                                                        loading="lazy"
                                                                        className="object-cover"
                                                                        wrapperClassName="absolute inset-0"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-10 h-14 rounded bg-[var(--card-border)] flex items-center justify-center flex-shrink-0">
                                                                    <Film size={16} className="text-[var(--muted)]" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-[var(--foreground)] truncate">{season.name}</p>
                                                                <p className="text-xs text-[var(--muted)]">{season.episode_count} episodes</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    <WatchProviderList providers={watchProviders} />
                                    <CastList cast={cast} />
                                </div>
                            </motion.div>
                        ) : null}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}