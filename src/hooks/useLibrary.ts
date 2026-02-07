"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEYS = {
    watchlist: "replay_watchlist",
    watched: "replay_watched",
    favorites: "replay_favorites",
} as const;

export interface UseLibraryReturn {
    watchlist: number[];
    watched: number[];
    favorites: number[];
    toggleWatchlist: (movieId: number, e?: React.MouseEvent) => void;
    markAsWatched: (movieId: number, e?: React.MouseEvent) => void;
    toggleFavorite: (movieId: number, e?: React.MouseEvent) => void;
    isInWatchlist: (movieId: number) => boolean;
    isWatched: (movieId: number) => boolean;
    isFavorite: (movieId: number) => boolean;
    // Favorite prompt state
    showFavoritePrompt: boolean;
    promptMovieId: number | null;
    handleFavoritePrompt: (addToFavorites: boolean) => void;
    // Storage info
    getStorageSize: () => { bytes: number; formatted: string };
    clearAllData: () => void;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function useLibrary(): UseLibraryReturn {
    const [watchlist, setWatchlist] = useState<number[]>([]);
    const [watched, setWatched] = useState<number[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [showFavoritePrompt, setShowFavoritePrompt] = useState(false);
    const [promptMovieId, setPromptMovieId] = useState<number | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedWatchlist = localStorage.getItem(STORAGE_KEYS.watchlist);
        const savedWatched = localStorage.getItem(STORAGE_KEYS.watched);
        const savedFavorites = localStorage.getItem(STORAGE_KEYS.favorites);
        if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
        if (savedWatched) setWatched(JSON.parse(savedWatched));
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    }, []);

    const toggleWatchlist = useCallback((movieId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setWatchlist((prev: number[]) => {
            const newList = prev.includes(movieId)
                ? prev.filter((id: number) => id !== movieId)
                : [...prev, movieId];
            localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(newList));
            return newList;
        });
    }, []);

    const markAsWatched = useCallback((movieId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (watched.includes(movieId)) {
            setWatched((prev: number[]) => {
                const newList = prev.filter((id: number) => id !== movieId);
                localStorage.setItem(STORAGE_KEYS.watched, JSON.stringify(newList));
                return newList;
            });
            return;
        }

        // Remove from watchlist when marking as watched
        setWatchlist((prev: number[]) => {
            const newList = prev.filter((id: number) => id !== movieId);
            localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(newList));
            return newList;
        });

        setWatched((prev: number[]) => {
            const newList = [...prev, movieId];
            localStorage.setItem(STORAGE_KEYS.watched, JSON.stringify(newList));
            return newList;
        });

        // Prompt for favorites
        setPromptMovieId(movieId);
        setShowFavoritePrompt(true);
    }, [watched]);

    const toggleFavorite = useCallback((movieId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setFavorites((prev: number[]) => {
            const newList = prev.includes(movieId)
                ? prev.filter((id: number) => id !== movieId)
                : [...prev, movieId];
            localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(newList));
            return newList;
        });
    }, []);

    const handleFavoritePrompt = useCallback((addToFavorites: boolean) => {
        if (addToFavorites && promptMovieId) {
            toggleFavorite(promptMovieId);
        }
        setShowFavoritePrompt(false);
        setPromptMovieId(null);
    }, [promptMovieId, toggleFavorite]);

    const isInWatchlist = useCallback((movieId: number) => watchlist.includes(movieId), [watchlist]);
    const isWatched = useCallback((movieId: number) => watched.includes(movieId), [watched]);
    const isFavorite = useCallback((movieId: number) => favorites.includes(movieId), [favorites]);

    const getStorageSize = useCallback(() => {
        const data = JSON.stringify({ watchlist, watched, favorites });
        const bytes = new Blob([data]).size;
        return { bytes, formatted: formatBytes(bytes) };
    }, [watchlist, watched, favorites]);

    const clearAllData = useCallback(() => {
        setWatchlist([]);
        setWatched([]);
        setFavorites([]);
        localStorage.removeItem(STORAGE_KEYS.watchlist);
        localStorage.removeItem(STORAGE_KEYS.watched);
        localStorage.removeItem(STORAGE_KEYS.favorites);
    }, []);

    return {
        watchlist,
        watched,
        favorites,
        toggleWatchlist,
        markAsWatched,
        toggleFavorite,
        isInWatchlist,
        isWatched,
        isFavorite,
        showFavoritePrompt,
        promptMovieId,
        handleFavoritePrompt,
        getStorageSize,
        clearAllData,
    };
}
