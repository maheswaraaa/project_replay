import { useState, useCallback, useRef, useEffect } from "react";
import {
    getTrending, getPopular, getTopRated, getNowPlaying,
    discoverMovies, searchMovies,
    getTrendingTV, getPopularTV, getTopRatedTV, getOnTheAirTV,
    discoverTV, searchTV,
    type Movie,
} from "@/lib/tmdb";
import type { Tab, NavItem, MediaTypeFilter } from "@/types";

interface UseMediaContentParams {
    activeTab: Tab;
    activeGenre: number | null;
    activeYear: number | null;
    activeLanguage: string | null;
    activeSortBy: string;
    activeProvider: string | null;
    activeMediaType: MediaTypeFilter;
    searchQuery: string;
    activeNav: NavItem;
}

interface TMDBResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

function mapTVToMovie(tvResults: any[]): Movie[] {
    return tvResults.map((tv) => ({
        ...tv,
        title: tv.name,
        original_title: tv.original_name,
        release_date: tv.first_air_date,
        media_type: "tv" as const,
    })) as unknown as Movie[];
}

function applyClientFilters(
    results: Movie[],
    {
        activeYear,
        activeLanguage,
        activeGenre,
    }: {
        activeYear: number | null;
        activeLanguage: string | null;
        activeGenre: number | null;
    }
): Movie[] {
    return results.filter((m) => {
        if (activeYear) {
            const year = m.release_date ? parseInt(m.release_date.split("-")[0]) : null;
            if (year !== activeYear) return false;
        }
        if (activeLanguage && m.original_language !== activeLanguage) return false;
        if (activeGenre && !m.genre_ids?.includes(activeGenre)) return false;
        return true;
    });
}

export function useMediaContent(params: UseMediaContentParams) {
    const {
        activeTab, activeGenre, activeYear, activeLanguage,
        activeSortBy, activeProvider, activeMediaType,
        searchQuery, activeNav,
    } = params;

    const [movies, setMovies] = useState<Movie[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const discoverParams = useCallback(() => ({
        genreId: activeGenre,
        year: activeYear,
        language: activeLanguage,
        watchProviders: activeProvider,
        sortBy: activeSortBy,
        page: 1,
    }), [activeGenre, activeYear, activeLanguage, activeProvider, activeSortBy]);

    const fetchSearchResults = useCallback(async (isTV: boolean, pageNum: number): Promise<TMDBResponse> => {
        if (activeProvider) {
            const params = { ...discoverParams(), page: pageNum };
            let response: TMDBResponse;

            if (isTV) {
                const tvRes = await discoverTV(params);
                response = { ...tvRes, results: mapTVToMovie(tvRes.results) };
            } else {
                response = await discoverMovies(params);
            }

            const query = searchQuery.toLowerCase();
            response.results = response.results.filter((m) =>
                m.title.toLowerCase().includes(query) ||
                m.original_title?.toLowerCase().includes(query)
            );
            return response;
        }

        let response: TMDBResponse;
        if (isTV) {
            const tvRes = await searchTV(searchQuery, pageNum);
            response = { ...tvRes, results: mapTVToMovie(tvRes.results) };
        } else {
            response = await searchMovies(searchQuery, pageNum);
        }

        response.results = applyClientFilters(response.results, { activeYear, activeLanguage, activeGenre });
        return response;
    }, [activeProvider, activeGenre, activeYear, activeLanguage, searchQuery, discoverParams]);

    const fetchDiscoverResults = useCallback(async (isTV: boolean, pageNum: number): Promise<TMDBResponse> => {
        const params = { ...discoverParams(), page: pageNum };

        if (isTV) {
            const tvRes = await discoverTV(params);
            return { ...tvRes, results: mapTVToMovie(tvRes.results) };
        }
        return discoverMovies(params);
    }, [discoverParams]);

    const fetchCategoryResults = useCallback(async (isTV: boolean, pageNum: number): Promise<TMDBResponse> => {
        if (isTV) {
            const fetchers: Record<Tab, () => Promise<any>> = {
                popular: () => getPopularTV(pageNum),
                top_rated: () => getTopRatedTV(pageNum),
                now_playing: () => getOnTheAirTV(pageNum),
                trending: () => getTrendingTV("week", pageNum),
            };
            const tvRes = await (fetchers[activeTab] || fetchers.trending)();
            return { ...tvRes, results: mapTVToMovie(tvRes.results) };
        }

        const fetchers: Record<Tab, () => Promise<TMDBResponse>> = {
            popular: () => getPopular(pageNum),
            top_rated: () => getTopRated(pageNum),
            now_playing: () => getNowPlaying(pageNum),
            trending: () => getTrending("week", pageNum),
        };
        return (fetchers[activeTab] || fetchers.trending)();
    }, [activeTab]);

    const fetchContent = useCallback(async (pageNum: number, reset = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const hasFilters = activeGenre || activeYear || activeLanguage || activeProvider || activeSortBy !== "popularity.desc";
            const isTV = activeMediaType === "tv";
            let response: TMDBResponse;

            if (searchQuery && activeNav === "search") {
                response = await fetchSearchResults(isTV, pageNum);
            } else if (hasFilters) {
                response = await fetchDiscoverResults(isTV, pageNum);
            } else {
                response = await fetchCategoryResults(isTV, pageNum);
            }

            let newMovies = response.results.filter((m) => m.poster_path);
            newMovies = applyClientFilters(newMovies, { activeYear, activeLanguage, activeGenre });

            if (reset || pageNum === 1) {
                setMovies(newMovies);
            } else {
                setMovies((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id));
                    return [...prev, ...newMovies.filter((m) => !existingIds.has(m.id))];
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
    }, [
        activeGenre, activeYear, activeLanguage, activeSortBy,
        activeProvider, activeMediaType, searchQuery, activeNav,
        fetchSearchResults, fetchDiscoverResults, fetchCategoryResults,
    ]);

    // Reset on filter changes
    useEffect(() => {
        if (activeNav === "library" || activeNav === "profile") return;
        setPage(1);
        setMovies([]);
        fetchContent(1, true);
    }, [activeTab, activeGenre, activeYear, activeLanguage, activeSortBy, activeProvider, activeNav, activeMediaType, fetchContent]);

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

    // Infinite scroll
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

    return { movies, loading, loadingMore, hasMore, loadMoreRef };
}