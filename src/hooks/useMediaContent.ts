"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    getTrending,
    getPopular,
    getTopRated,
    getNowPlaying,
    discoverMovies,
    searchMovies,
    getTrendingTV,
    getPopularTV,
    getTopRatedTV,
    getOnTheAirTV,
    discoverTV,
    searchTV,
    getMovieDetails,
    getTVShowDetails,
    type Movie,
    type MediaType,
} from "@/lib/tmdb";
import { Tab, NavItem } from "./useFilters";

export interface ContentFilters {
    activeTab: Tab;
    activeGenre: number | null;
    activeYear: number | null;
    activeLanguage: string | null;
    activeSortBy: string;
    activeProvider: string | null;
    activeMediaType: MediaType;
    searchQuery: string;
}

export interface UseMediaContentReturn {
    movies: Movie[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loadMoreRef: React.RefObject<HTMLDivElement | null>;
    fetchContent: (pageNum: number, reset?: boolean) => Promise<void>;
}

export function useMediaContent(
    filters: ContentFilters,
    activeNav: NavItem
): UseMediaContentReturn {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const {
        activeTab,
        activeGenre,
        activeYear,
        activeLanguage,
        activeSortBy,
        activeProvider,
        activeMediaType,
        searchQuery,
    } = filters;

    const fetchContent = useCallback(
        async (pageNum: number, reset: boolean = false) => {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            try {
                let response: {
                    page: number;
                    results: Movie[];
                    total_pages: number;
                    total_results: number;
                };
                const hasFilters =
                    activeGenre ||
                    activeYear ||
                    activeLanguage ||
                    activeProvider ||
                    activeSortBy !== "popularity.desc";
                const isTV = activeMediaType === "tv";

                if (searchQuery && activeNav === "search") {
                    // If streaming provider is selected, use discover endpoint
                    if (activeProvider) {
                        if (isTV) {
                            const tvResponse = await discoverTV({
                                genreId: activeGenre,
                                year: activeYear,
                                language: activeLanguage,
                                watchProviders: activeProvider,
                                sortBy: activeSortBy,
                                page: pageNum,
                            });
                            response = {
                                ...tvResponse,
                                results: tvResponse.results.map((tv) => ({
                                    ...tv,
                                    title: tv.name,
                                    original_title: tv.original_name,
                                    release_date: tv.first_air_date,
                                    media_type: "tv" as const,
                                })) as unknown as Movie[],
                            };
                        } else {
                            response = await discoverMovies({
                                genreId: activeGenre,
                                year: activeYear,
                                language: activeLanguage,
                                watchProviders: activeProvider,
                                sortBy: activeSortBy,
                                page: pageNum,
                            });
                        }

                        // Client-side filter by search query
                        const query = searchQuery.toLowerCase();
                        response = {
                            ...response,
                            results: response.results.filter(
                                (m) =>
                                    m.title.toLowerCase().includes(query) ||
                                    m.original_title?.toLowerCase().includes(query)
                            ),
                        };
                    } else {
                        // No provider filter — use normal search API
                        if (isTV) {
                            const tvResponse = await searchTV(searchQuery, pageNum);
                            response = {
                                ...tvResponse,
                                results: tvResponse.results.map((tv) => ({
                                    ...tv,
                                    title: tv.name,
                                    original_title: tv.original_name,
                                    release_date: tv.first_air_date,
                                    media_type: "tv" as const,
                                })) as unknown as Movie[],
                            };
                        } else {
                            response = await searchMovies(searchQuery, pageNum);
                        }

                        // Client-side filtering for year/language/genre
                        response = {
                            ...response,
                            results: response.results.filter((m) => {
                                if (activeYear) {
                                    const releaseYear = m.release_date
                                        ? parseInt(m.release_date.split("-")[0])
                                        : null;
                                    if (releaseYear !== activeYear) return false;
                                }
                                if (activeLanguage && m.original_language !== activeLanguage)
                                    return false;
                                if (activeGenre && !m.genre_ids?.includes(activeGenre))
                                    return false;
                                return true;
                            }),
                        };
                    }
                } else if (hasFilters) {
                    if (isTV) {
                        const tvResponse = await discoverTV({
                            genreId: activeGenre,
                            year: activeYear,
                            language: activeLanguage,
                            watchProviders: activeProvider,
                            sortBy: activeSortBy,
                            page: pageNum,
                        });
                        response = {
                            ...tvResponse,
                            results: tvResponse.results.map((tv) => ({
                                ...tv,
                                title: tv.name,
                                original_title: tv.original_name,
                                release_date: tv.first_air_date,
                                media_type: "tv" as const,
                            })) as unknown as Movie[],
                        };
                    } else {
                        response = await discoverMovies({
                            genreId: activeGenre,
                            year: activeYear,
                            language: activeLanguage,
                            watchProviders: activeProvider,
                            sortBy: activeSortBy,
                            page: pageNum,
                        });
                    }
                } else {
                    if (isTV) {
                        let tvResponse;
                        switch (activeTab) {
                            case "popular":
                                tvResponse = await getPopularTV(pageNum);
                                break;
                            case "top_rated":
                                tvResponse = await getTopRatedTV(pageNum);
                                break;
                            case "now_playing":
                                tvResponse = await getOnTheAirTV(pageNum);
                                break;
                            default:
                                tvResponse = await getTrendingTV("week", pageNum);
                        }
                        response = {
                            ...tvResponse,
                            results: tvResponse.results.map((tv) => ({
                                ...tv,
                                title: tv.name,
                                original_title: tv.original_name,
                                release_date: tv.first_air_date,
                                media_type: "tv" as const,
                            })) as unknown as Movie[],
                        };
                    } else {
                        switch (activeTab) {
                            case "popular":
                                response = await getPopular(pageNum);
                                break;
                            case "top_rated":
                                response = await getTopRated(pageNum);
                                break;
                            case "now_playing":
                                response = await getNowPlaying(pageNum);
                                break;
                            default:
                                response = await getTrending("week", pageNum);
                        }
                    }
                }

                let newMovies = response.results.filter((m) => m.poster_path);

                if (activeYear) {
                    newMovies = newMovies.filter((m) => {
                        const releaseYear = m.release_date
                            ? parseInt(m.release_date.split("-")[0])
                            : null;
                        return releaseYear === activeYear;
                    });
                }

                if (activeLanguage) {
                    newMovies = newMovies.filter(
                        (m) => m.original_language === activeLanguage
                    );
                }

                if (activeGenre) {
                    newMovies = newMovies.filter((m) =>
                        m.genre_ids?.includes(activeGenre)
                    );
                }

                if (reset || pageNum === 1) {
                    setMovies(newMovies);
                } else {
                    setMovies((prev) => {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const uniqueNewMovies = newMovies.filter(
                            (m) => !existingIds.has(m.id)
                        );
                        return [...prev, ...uniqueNewMovies];
                    });
                }

                setHasMore(response.page < response.total_pages);
                setPage(response.page);
            } catch (error) {
                console.error("Failed to fetch content:", error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [
            activeTab,
            activeGenre,
            activeYear,
            activeLanguage,
            activeSortBy,
            activeProvider,
            searchQuery,
            activeNav,
            activeMediaType,
        ]
    );

    // Fetch content when filters change
    useEffect(() => {
        if (activeNav === "library" || activeNav === "profile") return;
        setPage(1);
        setMovies([]);
        fetchContent(1, true);
    }, [
        activeTab,
        activeGenre,
        activeYear,
        activeLanguage,
        activeSortBy,
        activeProvider,
        activeNav,
        activeMediaType,
        fetchContent,
    ]);

    // Debounced search
    useEffect(() => {
        if (activeNav !== "search") return;

        const timer = setTimeout(() => {
            if (searchQuery) {
                setPage(1);
                setMovies([]);
                fetchContent(1, true);
            } else {
                setMovies([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, activeNav, fetchContent]);

    // Infinite scroll observer
    useEffect(() => {
        if (loading || activeNav === "library" || activeNav === "profile") return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    fetchContent(page + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [loading, hasMore, loadingMore, page, fetchContent, activeNav]);

    return {
        movies,
        loading,
        loadingMore,
        hasMore,
        loadMoreRef,
        fetchContent,
    };
}

// Library content fetching hook
export interface UseLibraryContentReturn {
    libraryMovies: Movie[];
    libraryLoading: boolean;
}

export function useLibraryContent(
    activeNav: NavItem,
    watchlist: number[],
    watched: number[],
    favorites: number[]
): UseLibraryContentReturn {
    const [libraryMovies, setLibraryMovies] = useState<Movie[]>([]);
    const [libraryLoading, setLibraryLoading] = useState(false);

    useEffect(() => {
        const fetchLibraryContent = async () => {
            if (activeNav !== "library") return;

            const allIds = [...new Set([...watchlist, ...watched, ...favorites])];

            if (allIds.length === 0) {
                setLibraryMovies([]);
                return;
            }

            setLibraryLoading(true);

            const newItems = await Promise.all(
                allIds.map(async (id) => {
                    try {
                        const details = await getMovieDetails(id);
                        return { ...details, media_type: "movie" } as Movie;
                    } catch {
                        try {
                            const details = await getTVShowDetails(id);
                            return {
                                id: details.id,
                                title: details.name,
                                original_title: details.original_name,
                                poster_path: details.poster_path,
                                backdrop_path: details.backdrop_path,
                                overview: details.overview,
                                vote_average: details.vote_average,
                                vote_count: details.vote_count || 0,
                                popularity: details.popularity || 0,
                                adult: false,
                                release_date: details.first_air_date,
                                genre_ids: details.genres?.map((g) => g.id) || [],
                                original_language: details.original_language,
                                media_type: "tv" as unknown,
                            } as unknown as Movie;
                        } catch {
                            return null;
                        }
                    }
                })
            );

            const validItems = newItems.filter(Boolean) as Movie[];
            setLibraryMovies(validItems);
            setLibraryLoading(false);
        };

        fetchLibraryContent();
    }, [activeNav, watchlist, watched, favorites]);

    return {
        libraryMovies,
        libraryLoading,
    };
}
