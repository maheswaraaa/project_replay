import { ListPlus, Eye, EyeOff, Heart } from "lucide-react";

interface MediaActionsProps {
    id: number;
    isInWatchlist: boolean;
    isWatched: boolean;
    isFavorite: boolean;
    onToggleWatchlist: (id: number, e?: React.MouseEvent) => void;
    onMarkWatched: (id: number, e?: React.MouseEvent) => void;
    onToggleFavorite: (id: number, e?: React.MouseEvent) => void;
    layout?: "row" | "overlay";
}

export default function MediaActions({
    id,
    isInWatchlist,
    isWatched,
    isFavorite,
    onToggleWatchlist,
    onMarkWatched,
    onToggleFavorite,
    layout = "row",
}: MediaActionsProps) {
    if (layout === "overlay") {
        return (
            <div className="flex gap-1.5">
                <button
                    onClick={(e) => onToggleWatchlist(id, e)}
                    className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 ${isInWatchlist ? "bg-white text-black" : "bg-black/50 text-white hover:bg-black/70"
                        }`}
                    title="Add to Watchlist"
                >
                    <ListPlus size={12} className={isInWatchlist ? "fill-current" : ""} />
                </button>
                <button
                    onClick={(e) => onMarkWatched(id, e)}
                    className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 group/eye ${isWatched ? "bg-green-500 text-white" : "bg-black/50 text-white hover:bg-black/70"
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
                <button
                    onClick={(e) => onToggleFavorite(id, e)}
                    className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 ${isFavorite ? "bg-red-500 text-white" : "bg-black/50 text-white hover:bg-black/70"
                        }`}
                    title="Add to Favorites"
                >
                    <Heart size={12} className={isFavorite ? "fill-current" : ""} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={() => onToggleWatchlist(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all ${isInWatchlist
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "bg-[var(--background)] text-[var(--foreground)] border border-[var(--card-border)]"
                    }`}
            >
                <ListPlus size={18} className={isInWatchlist ? "fill-current" : ""} />
                {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
            </button>
            <button
                onClick={() => onMarkWatched(id)}
                className={`p-3 rounded-xl transition-all group/eye ${isWatched
                        ? "bg-green-500 text-white"
                        : "bg-[var(--background)] border border-[var(--card-border)] hover:bg-[var(--card-border)]"
                    }`}
                title="Mark as Watched"
            >
                {isWatched ? (
                    <Eye size={18} />
                ) : (
                    <>
                        <EyeOff size={18} className="group-hover/eye:hidden text-[var(--foreground)]" />
                        <Eye size={18} className="hidden group-hover/eye:block text-[var(--foreground)]" />
                    </>
                )}
            </button>
            <button
                onClick={() => onToggleFavorite(id)}
                className={`p-3 rounded-xl transition-all ${isFavorite
                        ? "bg-red-500 text-white"
                        : "bg-[var(--background)] border border-[var(--card-border)] hover:bg-[var(--card-border)]"
                    }`}
                title="Add to Favorites"
            >
                <Heart size={18} className={isFavorite ? "fill-current" : "text-[var(--foreground)]"} />
            </button>
        </div>
    );
}