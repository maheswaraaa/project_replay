import { motion } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, Star, Calendar, Clock, ListPlus, Eye, EyeOff, Heart, User, Loader2 } from "lucide-react";
import { getBackdropUrl, getImageUrl, MovieDetail, CastMember, WatchProvider } from "@/lib/tmdb";

interface MovieDetailModalProps {
    movie: MovieDetail | null;
    showModal: boolean;
    loadingModal: boolean;
    closeModal: () => void;
    movieCast: CastMember[];
    movieWatchProviders: WatchProvider[];
    watchlist: number[];
    watched: number[];
    favorites: number[];
    toggleWatchlist: (id: number) => void;
    markAsWatched: (id: number) => void;
    toggleFavorite: (id: number) => void;
}

export default function MovieDetailModal({
    movie,
    showModal,
    loadingModal,
    closeModal,
    movieCast,
    movieWatchProviders,
    watchlist,
    watched,
    favorites,
    toggleWatchlist,
    markAsWatched,
    toggleFavorite,
}: MovieDetailModalProps) {
    if (!showModal) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
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
                {loadingModal ? (
                    <div className="flex items-center justify-center h-96">
                        <Loader2 size={32} className="text-[var(--muted)] animate-spin" />
                    </div>
                ) : movie ? (
                    <>
                        {/* Backdrop Image */}
                        <div className="relative h-48 md:h-64">
                            {movie.backdrop_path ? (
                                <Image
                                    src={getBackdropUrl(movie.backdrop_path) || ""}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-[var(--card-border)]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent" />

                            {/* Close Button */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                            >
                                <X size={20} className="text-white" />
                            </button>

                            {/* Back Button (mobile) */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors md:hidden"
                            >
                                <ChevronLeft size={20} className="text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-5 pb-8 -mt-16 relative overflow-y-auto max-h-[calc(90vh-12rem)]">
                            <div className="flex gap-4 mb-4">
                                {/* Poster */}
                                <div className="relative w-24 h-36 rounded-xl overflow-hidden shadow-xl flex-shrink-0 bg-[var(--card-border)]">
                                    <Image
                                        src={getImageUrl(movie.poster_path, "w300") || ""}
                                        alt={movie.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Title & Meta */}
                                <div className="flex-1 pt-16">
                                    <h2 className="text-xl font-bold text-[var(--foreground)]">{movie.title}</h2>
                                    {movie.tagline && (
                                        <p className="text-sm text-[var(--muted)] italic mt-1">&ldquo;{movie.tagline}&rdquo;</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-[var(--muted)]">
                                        <span className="flex items-center gap-1">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                            {movie.vote_average.toFixed(1)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {movie.release_date?.split("-")[0]}
                                        </span>
                                        {movie.runtime > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {movie.genres?.map((genre) => (
                                    <span
                                        key={genre.id}
                                        className="px-3 py-1 bg-[var(--background)] text-[var(--foreground)] text-xs font-medium rounded-full border border-[var(--card-border)]"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mb-6">
                                {/* Add to Watchlist */}
                                <button
                                    onClick={() => toggleWatchlist(movie.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all ${watchlist.includes(movie.id)
                                        ? "bg-[var(--foreground)] text-[var(--background)]"
                                        : "bg-[var(--background)] text-[var(--foreground)] border border-[var(--card-border)]"
                                        }`}
                                >
                                    <ListPlus size={18} className={watchlist.includes(movie.id) ? "fill-current" : ""} />
                                    {watchlist.includes(movie.id) ? "In Watchlist" : "Add to Watchlist"}
                                </button>
                                {/* Mark as Watched */}
                                <button
                                    onClick={() => markAsWatched(movie.id)}
                                    className={`p-3 rounded-xl transition-all group/eye ${watched.includes(movie.id)
                                        ? "bg-green-500 text-white"
                                        : "bg-[var(--background)] border border-[var(--card-border)] hover:bg-[var(--card-border)]"
                                        }`}
                                    title="Mark as Watched"
                                >
                                    {watched.includes(movie.id) ? (
                                        <Eye size={18} />
                                    ) : (
                                        <>
                                            <EyeOff size={18} className="group-hover/eye:hidden text-[var(--foreground)]" />
                                            <Eye size={18} className="hidden group-hover/eye:block text-[var(--foreground)]" />
                                        </>
                                    )}
                                </button>
                                {/* Add to Favorites */}
                                <button
                                    onClick={() => toggleFavorite(movie.id)}
                                    className={`p-3 rounded-xl transition-all ${favorites.includes(movie.id)
                                        ? "bg-red-500 text-white"
                                        : "bg-[var(--background)] border border-[var(--card-border)] hover:bg-[var(--card-border)]"
                                        }`}
                                    title="Add to Favorites"
                                >
                                    <Heart size={18} className={favorites.includes(movie.id) ? "fill-current" : "text-[var(--foreground)]"} />
                                </button>
                            </div>

                            {/* Overview */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[var(--foreground)] mb-2">Overview</h3>
                                <p className="text-sm text-[var(--muted)] leading-relaxed">
                                    {movie.overview || "No overview available."}
                                </p>
                            </div>

                            {/* Watch Providers / Streaming */}
                            {movieWatchProviders.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-[var(--foreground)] mb-3">Stream on</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {movieWatchProviders.map((provider) => (
                                            <div
                                                key={provider.provider_id}
                                                className="flex items-center gap-2 px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg"
                                            >
                                                {provider.logo_path && (
                                                    <Image
                                                        src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                                        alt={provider.provider_name}
                                                        width={24}
                                                        height={24}
                                                        className="rounded"
                                                    />
                                                )}
                                                <span className="text-xs font-medium text-[var(--foreground)]">
                                                    {provider.provider_name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-[var(--muted)] mt-2">Data from JustWatch</p>
                                </div>
                            )}

                            {/* Cast */}
                            {movieCast.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-3">Cast</h3>
                                    <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                                        {movieCast.map((person) => (
                                            <div key={person.id} className="flex-shrink-0 w-16 text-center">
                                                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[var(--card-border)] mb-2">
                                                    {person.profile_path ? (
                                                        <Image
                                                            src={getImageUrl(person.profile_path, "w200") || ""}
                                                            alt={person.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <User size={24} className="text-[var(--muted)]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs font-medium text-[var(--foreground)] truncate">{person.name}</p>
                                                <p className="text-xs text-[var(--muted)] truncate">{person.character}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </motion.div>
        </motion.div>
    );
}
