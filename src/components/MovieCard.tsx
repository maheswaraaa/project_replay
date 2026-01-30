import Image from "next/image";
import { Film, Star, ListPlus, Eye, EyeOff, Heart } from "lucide-react";
import { getImageUrl, Movie } from "@/lib/tmdb";

interface MovieCardProps {
    movie: Movie;
    openMovieDetail: (id: number) => void;
    toggleWatchlist: (id: number, e?: React.MouseEvent) => void;
    markAsWatched: (id: number, e?: React.MouseEvent) => void;
    toggleFavorite: (id: number, e?: React.MouseEvent) => void;
    isInWatchlist: boolean;
    isWatched: boolean;
    isFavorite: boolean;
}

export default function MovieCard({
    movie,
    openMovieDetail,
    toggleWatchlist,
    markAsWatched,
    toggleFavorite,
    isInWatchlist,
    isWatched,
    isFavorite,
}: MovieCardProps) {
    return (
        <div
            onClick={() => openMovieDetail(movie.id)}
            className="poster-card relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-[var(--card-bg)]"
        >
            {movie.poster_path ? (
                <Image
                    src={getImageUrl(movie.poster_path, "w500") || ""}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--card-bg)] text-[var(--muted)]">
                    <Film size={24} className="mb-2 opacity-50" />
                    <p className="text-[10px] text-center px-2 line-clamp-2">{movie.title}</p>
                </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            {/* Rating Badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-xs">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{(movie.vote_average ?? 0).toFixed(1)}</span>
            </div>

            {/* Quick Actions on Hover */}
            <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Add to Watchlist */}
                <button
                    onClick={(e) => toggleWatchlist(movie.id, e)}
                    className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 ${isInWatchlist
                        ? "bg-white text-black"
                        : "bg-black/50 text-white hover:bg-black/70"
                        }`}
                    title="Add to Watchlist"
                >
                    <ListPlus size={12} className={isInWatchlist ? "fill-current" : ""} />
                </button>
                {/* Mark as Watched */}
                <button
                    onClick={(e) => markAsWatched(movie.id, e)}
                    className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 group/eye ${isWatched
                        ? "bg-green-500 text-white"
                        : "bg-black/50 text-white hover:bg-black/70"
                        }`}
                    title="Mark as Watched"
                >
                    {isWatched ? (
                        <Eye size={12} />
                    ) : (
                        <span className="block">
                            <EyeOff size={12} className="group-hover/eye:hidden" />
                            <Eye size={12} className="hidden group-hover/eye:block" />
                        </span>
                    )}
                </button>
                {/* Add to Favorites */}
                <button
                    onClick={(e) => toggleFavorite(movie.id, e)}
                    className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 ${isFavorite
                        ? "bg-red-500 text-white"
                        : "bg-black/50 text-white hover:bg-black/70"
                        }`}
                    title="Add to Favorites"
                >
                    <Heart size={12} className={isFavorite ? "fill-current" : ""} />
                </button>
            </div>

            {/* Hover Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <h3 className="text-white text-sm font-medium line-clamp-2">{movie.title}</h3>
                <p className="text-white/60 text-xs mt-1">
                    {movie.release_date?.split("-")[0] || "TBA"}
                </p>
            </div>
        </div>
    );
}
