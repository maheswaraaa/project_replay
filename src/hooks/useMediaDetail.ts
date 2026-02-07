"use client";

import { useState, useCallback } from "react";
import {
    getMovieDetails,
    getMovieCredits,
    getWatchProviders,
    getTVShowDetails,
    getTVShowCredits,
    getTVWatchProviders,
    type MovieDetail,
    type TVShowDetail,
    type CastMember,
    type WatchProvider,
    type MediaType,
} from "@/lib/tmdb";

export interface UseMediaDetailReturn {
    // State
    selectedMovie: MovieDetail | null;
    selectedTVShow: TVShowDetail | null;
    movieCast: CastMember[];
    movieWatchProviders: WatchProvider[];
    showModal: boolean;
    loadingModal: boolean;
    // Actions
    openMovieDetail: (movieId: number) => Promise<void>;
    openTVDetail: (tvId: number) => Promise<void>;
    openDetail: (item: { id: number; media_type?: string }, activeMediaType: MediaType) => void;
    closeModal: () => void;
}

export function useMediaDetail(): UseMediaDetailReturn {
    const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
    const [selectedTVShow, setSelectedTVShow] = useState<TVShowDetail | null>(null);
    const [movieCast, setMovieCast] = useState<CastMember[]>([]);
    const [movieWatchProviders, setMovieWatchProviders] = useState<WatchProvider[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);

    const openMovieDetail = useCallback(async (movieId: number) => {
        setLoadingModal(true);
        setShowModal(true);
        setMovieWatchProviders([]);
        setSelectedTVShow(null);
        document.body.style.overflow = "hidden";

        try {
            const [details, credits, watchProviders] = await Promise.all([
                getMovieDetails(movieId),
                getMovieCredits(movieId),
                getWatchProviders(movieId),
            ]);
            setSelectedMovie(details);
            setMovieCast(credits.cast.slice(0, 10));

            const usProviders = watchProviders.results?.US;
            if (usProviders?.flatrate) {
                setMovieWatchProviders(usProviders.flatrate);
            }
        } catch (error) {
            console.error("Failed to fetch movie details:", error);
            closeModal();
        } finally {
            setLoadingModal(false);
        }
    }, []);

    const openTVDetail = useCallback(async (tvId: number) => {
        setLoadingModal(true);
        setShowModal(true);
        setMovieWatchProviders([]);
        setSelectedMovie(null);
        document.body.style.overflow = "hidden";

        try {
            const [details, credits, watchProviders] = await Promise.all([
                getTVShowDetails(tvId),
                getTVShowCredits(tvId),
                getTVWatchProviders(tvId),
            ]);
            setSelectedTVShow(details);
            setMovieCast(credits.cast.slice(0, 10));

            const usProviders = watchProviders.results?.US;
            if (usProviders?.flatrate) {
                setMovieWatchProviders(usProviders.flatrate);
            }
        } catch (error) {
            console.error("Failed to fetch TV show details:", error);
            closeModal();
        } finally {
            setLoadingModal(false);
        }
    }, []);

    const openDetail = useCallback((item: { id: number; media_type?: string }, activeMediaType: MediaType) => {
        if (!item || typeof item.id !== "number") {
            console.error("Invalid item passed to openDetail:", item);
            return;
        }

        const itemId = item.id;
        const itemMediaType = item.media_type;
        const isTV = itemMediaType === "tv" || (itemMediaType === undefined && activeMediaType === "tv");

        if (isTV) {
            openTVDetail(itemId);
        } else {
            openMovieDetail(itemId);
        }
    }, [openMovieDetail, openTVDetail]);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setSelectedMovie(null);
        setSelectedTVShow(null);
        setMovieCast([]);
        setMovieWatchProviders([]);
        document.body.style.overflow = "auto";
    }, []);

    return {
        selectedMovie,
        selectedTVShow,
        movieCast,
        movieWatchProviders,
        showModal,
        loadingModal,
        openMovieDetail,
        openTVDetail,
        openDetail,
        closeModal,
    };
}
