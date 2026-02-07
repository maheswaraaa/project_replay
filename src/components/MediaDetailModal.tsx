"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
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

const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k=";

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
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 bg-black/80 modal-backdrop flex items-end md:items-center justify-center"
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl max-h-[90vh] bg-[var(--card-bg)] rounded-t-3xl md:rounded-2xl overflow-hidden"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-96">
                                <Loader2 size={32} className="text-[var(--muted)] animate-spin" />
                            </div>
                        ) : media ? (
                            <>
                                {/* Backdrop */}
                                <div className="relative h-48 md:h-64">
                                    {backdropPath ? (
                                        <Image
                                            src={getBackdropUrl(backdropPath) || ""}
                                            alt={title}
                                            fill
                                            loading="lazy"
                                            placeholder="blur"
                                            blurDataURL={blurDataURL}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[var(--card-border)]" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent" />

                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        <X size={20} className="text-white" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors md:hidden"
                                    >
                                        <ChevronLeft size={20} className="text-white" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="px-5 pb-8 -mt-16 relative overflow-y-auto max-h-[calc(90vh-12rem)]">
                                    {/* Header */}
                                    <div className="flex gap-4 mb-4">
                                        <div className="relative w-24 h-36 rounded-xl overflow-hidden shadow-xl flex-shrink-0 bg-[var(--card-border)]">
                                            <Image
                                                src={getImageUrl(posterPath, "w300") || ""}
                                                alt={title}
                                                fill
                                                loading="eager"
                                                placeholder="blur"
                                                blurDataURL={blurDataURL}
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 pt-16">
                                            <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
                                            {tagline && (
                                                <p className="text-sm text-[var(--muted)] italic mt-1">&ldquo;{tagline}&rdquo;</p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-[var(--muted)]">
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
                                            </div>
                                        </div>
                                    </div>

                                    {/* Genres */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {genres.map((genre) => (
                                            <span
                                                key={genre.id}
                                                className="px-3 py-1 bg-[var(--background)] text-[var(--foreground)] text-xs font-medium rounded-full border border-[var(--card-border)]"
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* TV Stats */}
                                    {tvShow && (
                                        <div className="flex gap-4 mb-4 p-3 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
                                            <div className="text-center flex-1">
                                                <p className="text-2xl font-bold text-[var(--foreground)]">{tvShow.number_of_seasons}</p>
                                                <p className="text-xs text-[var(--muted)]">Seasons</p>
                                            </div>
                                            <div className="w-px bg-[var(--card-border)]" />
                                            <div className="text-center flex-1">
                                                <p className="text-2xl font-bold text-[var(--foreground)]">{tvShow.number_of_episodes}</p>
                                                <p className="text-xs text-[var(--muted)]">Episodes</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mb-6">
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
                                    </div>

                                    {/* Overview */}
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[var(--foreground)] mb-2">Overview</h3>
                                        <p className="text-sm text-[var(--muted)] leading-relaxed">{overview}</p>
                                    </div>

                                    {/* Seasons */}
                                    {tvShow?.seasons && tvShow.seasons.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="font-semibold text-[var(--foreground)] mb-3">Seasons</h3>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {tvShow.seasons
                                                    .filter((s) => s.season_number > 0)
                                                    .map((season) => (
                                                        <div
                                                            key={season.id}
                                                            className="flex items-center gap-3 p-2 bg-[var(--background)] rounded-lg border border-[var(--card-border)]"
                                                        >
                                                            {season.poster_path ? (
                                                                <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0">
                                                                    <Image
                                                                        src={getImageUrl(season.poster_path, "w200") || ""}
                                                                        alt={season.name}
                                                                        fill
                                                                        loading="lazy"
                                                                        className="object-cover"
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
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    <WatchProviderList providers={watchProviders} />
                                    <CastList cast={cast} />
                                </div>
                            </>
                        ) : null}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}