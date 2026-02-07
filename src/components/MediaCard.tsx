import Image from "next/image";
import { Star, Film } from "lucide-react";
import { getImageUrl, type Movie } from "@/lib/tmdb";
import MediaActions from "./MediaActions";

interface MediaCardProps {
    movie: Movie;
    onOpenDetail: () => void;
    isInWatchlist: boolean;
    isWatched: boolean;
    isFavorite: boolean;
    onToggleWatchlist: (id: number, e?: React.MouseEvent) => void;
    onMarkWatched: (id: number, e?: React.MouseEvent) => void;
    onToggleFavorite: (id: number, e?: React.MouseEvent) => void;
}

export default function MediaCard({
    movie,
    onOpenDetail,
    isInWatchlist,
    isWatched,
    isFavorite,
    onToggleWatchlist,
    onMarkWatched,
    onToggleFavorite,
}: MediaCardProps) {
    return (
        <div
            onClick={onOpenDetail}
            className="poster-card relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-[var(--card-bg)]"
        >
            {movie.poster_path ? (
                <Image
                    src={getImageUrl(movie.poster_path, "w500") || ""}
                    alt={movie.title}
                    fill
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k="
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--card-bg)] text-[var(--muted)]">
                    <Film size={24} className="mb-2 opacity-50" />
                    <p className="text-[10px] text-center px-2 line-clamp-2">{movie.title}</p>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-xs">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{(movie.vote_average ?? 0).toFixed(1)}</span>
            </div>

            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <h3 className="text-white text-sm font-medium line-clamp-2">{movie.title}</h3>
                <p className="text-white/60 text-xs mt-1">{movie.release_date?.split("-")[0] || "TBA"}</p>
            </div>
        </div>
    );
}