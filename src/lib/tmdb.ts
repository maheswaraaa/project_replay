const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Media type for distinguishing movies and TV shows
export type MediaType = "movie" | "tv" | "all";

// Base interface for common properties
interface MediaBase {
    id: number;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    popularity: number;
    adult: boolean;
    original_language: string;
}

export interface Movie extends MediaBase {
    media_type?: "movie";
    title: string;
    original_title: string;
    release_date: string;
}

export interface TVShow extends MediaBase {
    media_type?: "tv";
    name: string;
    original_name: string;
    first_air_date: string;
    origin_country: string[];
}

// Union type for any media item
export type Media = Movie | TVShow;

// Helper to check if media is a TV show
export function isTVShow(media: Movie | TVShow): media is TVShow {
    return 'name' in media && !('title' in media);
}

// Helper to get title regardless of media type
export function getMediaTitle(media: Movie | TVShow): string {
    if ('title' in media) return media.title;
    return media.name;
}

// Helper to get release/air date regardless of media type
export function getMediaDate(media: Movie | TVShow): string | undefined {
    if ('release_date' in media) return media.release_date;
    return media.first_air_date;
}

export interface MovieDetail extends Movie {
    runtime: number;
    genres: { id: number; name: string }[];
    status: string;
    tagline: string;
    budget: number;
    revenue: number;
    production_companies: { id: number; name: string; logo_path: string | null }[];
}

export interface TVShowDetail extends TVShow {
    episode_run_time: number[];
    genres: { id: number; name: string }[];
    status: string;
    tagline: string;
    number_of_seasons: number;
    number_of_episodes: number;
    seasons: { id: number; name: string; season_number: number; episode_count: number; poster_path: string | null }[];
    networks: { id: number; name: string; logo_path: string | null }[];
    created_by: { id: number; name: string; profile_path: string | null }[];
    last_air_date: string;
    in_production: boolean;
}

export interface Genre {
    id: number;
    name: string;
}

export interface MovieResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

export interface TVShowResponse {
    page: number;
    results: TVShow[];
    total_pages: number;
    total_results: number;
}

export interface MediaResponse {
    page: number;
    results: Media[];
    total_pages: number;
    total_results: number;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

export interface Video {
    key: string;
    name: string;
    type: string;
    site: string;
}

// Image URL helpers
export const getImageUrl = (path: string | null, size: "w200" | "w300" | "w500" | "w780" | "original" = "w500") => {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: "w780" | "w1280" | "original" = "w1280") => {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
};

// API functions
async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const searchParams = new URLSearchParams({
        api_key: API_KEY!,
        ...params,
    });

    const response = await fetch(`${BASE_URL}${endpoint}?${searchParams}`);
    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }
    return response.json();
}

// Get trending movies
export async function getTrending(timeWindow: "day" | "week" = "week", page: number = 1): Promise<MovieResponse> {
    return fetchFromTMDB(`/trending/movie/${timeWindow}`, { page: page.toString() });
}

// Get popular movies
export async function getPopular(page: number = 1): Promise<MovieResponse> {
    return fetchFromTMDB("/movie/popular", { page: page.toString() });
}

// Get top rated movies
export async function getTopRated(page: number = 1): Promise<MovieResponse> {
    return fetchFromTMDB("/movie/top_rated", { page: page.toString() });
}

// Get now playing movies
export async function getNowPlaying(page: number = 1): Promise<MovieResponse> {
    return fetchFromTMDB("/movie/now_playing", { page: page.toString() });
}

// Get upcoming movies
export async function getUpcoming(page: number = 1): Promise<MovieResponse> {
    return fetchFromTMDB("/movie/upcoming", { page: page.toString() });
}

// Get movies by genre
export async function getByGenre(genreId: number, page: number = 1): Promise<MovieResponse> {
    return fetchFromTMDB("/discover/movie", {
        with_genres: genreId.toString(),
        page: page.toString(),
        sort_by: "popularity.desc",
    });
}

// =====================
// TV SHOW API FUNCTIONS
// =====================

// Get trending TV shows
export async function getTrendingTV(timeWindow: "day" | "week" = "week", page: number = 1): Promise<TVShowResponse> {
    return fetchFromTMDB(`/trending/tv/${timeWindow}`, { page: page.toString() });
}

// Get popular TV shows
export async function getPopularTV(page: number = 1): Promise<TVShowResponse> {
    return fetchFromTMDB("/tv/popular", { page: page.toString() });
}

// Get top rated TV shows
export async function getTopRatedTV(page: number = 1): Promise<TVShowResponse> {
    return fetchFromTMDB("/tv/top_rated", { page: page.toString() });
}

// Get TV shows airing today
export async function getAiringTodayTV(page: number = 1): Promise<TVShowResponse> {
    return fetchFromTMDB("/tv/airing_today", { page: page.toString() });
}

// Get on the air TV shows
export async function getOnTheAirTV(page: number = 1): Promise<TVShowResponse> {
    return fetchFromTMDB("/tv/on_the_air", { page: page.toString() });
}

// Get TV show details
export async function getTVShowDetails(tvId: number): Promise<TVShowDetail> {
    if (!tvId || typeof tvId !== 'number' || !Number.isFinite(tvId)) {
        throw new Error(`Invalid TV show ID: ${tvId}`);
    }
    return fetchFromTMDB(`/tv/${tvId}`);
}

// Get TV show credits
export async function getTVShowCredits(tvId: number): Promise<{ cast: CastMember[] }> {
    if (!tvId || typeof tvId !== 'number' || !Number.isFinite(tvId)) {
        throw new Error(`Invalid TV show ID: ${tvId}`);
    }
    return fetchFromTMDB(`/tv/${tvId}/credits`);
}

// Get TV show watch providers
export async function getTVWatchProviders(tvId: number): Promise<WatchProviderResult> {
    if (!tvId || typeof tvId !== 'number' || !Number.isFinite(tvId)) {
        throw new Error(`Invalid TV show ID: ${tvId}`);
    }
    return fetchFromTMDB(`/tv/${tvId}/watch/providers`);
}

// Search TV shows
export async function searchTV(query: string, page: number = 1): Promise<TVShowResponse> {
    return fetchFromTMDB("/search/tv", {
        query,
        page: page.toString(),
        include_adult: "false",
    });
}

// Multi-search (movies and TV shows combined)
export async function searchMulti(query: string, page: number = 1): Promise<MediaResponse> {
    return fetchFromTMDB("/search/multi", {
        query,
        page: page.toString(),
        include_adult: "false",
    });
}

// Discover movies with flexible filters (genre + year + language + rating + providers)
export async function discoverMovies(
    options: {
        genreId?: number | null;
        year?: number | null;
        language?: string | null;
        minRating?: number | null;
        watchProviders?: string | null;
        watchRegion?: string;
        page?: number;
        sortBy?: string;
    } = {}
): Promise<MovieResponse> {
    const {
        genreId,
        year,
        language,
        minRating,
        watchProviders,
        watchRegion = "US",
        page = 1,
        sortBy = "popularity.desc"
    } = options;

    const params: Record<string, string> = {
        page: page.toString(),
        sort_by: sortBy,
    };

    if (genreId) {
        params.with_genres = genreId.toString();
    }
    if (year) {
        params.primary_release_year = year.toString();
    }
    if (language) {
        params.with_original_language = language;
    }
    if (minRating) {
        params["vote_average.gte"] = minRating.toString();
        params["vote_count.gte"] = "100"; // Ensure enough votes for reliability
    }
    if (watchProviders) {
        params.with_watch_providers = watchProviders;
        params.watch_region = watchRegion;
    }

    return fetchFromTMDB("/discover/movie", params);
}

// Discover TV shows with flexible filters
export async function discoverTV(
    options: {
        genreId?: number | null;
        year?: number | null;
        language?: string | null;
        minRating?: number | null;
        watchProviders?: string | null;
        watchRegion?: string;
        page?: number;
        sortBy?: string;
    } = {}
): Promise<TVShowResponse> {
    const {
        genreId,
        year,
        language,
        minRating,
        watchProviders,
        watchRegion = "US",
        page = 1,
        sortBy = "popularity.desc"
    } = options;

    const params: Record<string, string> = {
        page: page.toString(),
        sort_by: sortBy,
    };

    if (genreId) {
        params.with_genres = genreId.toString();
    }
    if (year) {
        params.first_air_date_year = year.toString();
    }
    if (language) {
        params.with_original_language = language;
    }
    if (minRating) {
        params["vote_average.gte"] = minRating.toString();
        params["vote_count.gte"] = "50";
    }
    if (watchProviders) {
        params.with_watch_providers = watchProviders;
        params.watch_region = watchRegion;
    }

    return fetchFromTMDB("/discover/tv", params);
}

// Common languages for movies
export const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "ko", name: "Korean" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "hi", name: "Hindi" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "th", name: "Thai" },
    { code: "id", name: "Indonesian" },
];

// Sort options
export const SORT_OPTIONS = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "vote_average.desc", label: "Highest Rated" },
    { value: "primary_release_date.desc", label: "Newest First" },
    { value: "primary_release_date.asc", label: "Oldest First" },
    { value: "revenue.desc", label: "Highest Revenue" },
];

// Watch providers (streaming platforms)
export const WATCH_PROVIDERS = [
    { id: "8", name: "Netflix" },
    { id: "9", name: "Amazon Prime" },
    { id: "337", name: "Disney+" },
    { id: "384", name: "HBO Max" },
    { id: "1899", name: "Max" },
    { id: "15", name: "Hulu" },
    { id: "386", name: "Peacock" },
    { id: "2", name: "Apple TV+" },
    { id: "531", name: "Paramount+" },
    { id: "283", name: "Crunchyroll" },
    { id: "99", name: "Shudder" },
    { id: "11", name: "MUBI" },
    { id: "73", name: "Tubi" },
    { id: "300", name: "Pluto TV" },
    { id: "7", name: "Vudu" },
    { id: "43", name: "Starz" },
    { id: "37", name: "Showtime" },
    { id: "526", name: "AMC+" },
    { id: "151", name: "BritBox" },
];

// Get movie details
export async function getMovieDetails(movieId: number): Promise<MovieDetail> {
    if (!movieId || typeof movieId !== 'number' || !Number.isFinite(movieId)) {
        throw new Error(`Invalid movie ID: ${movieId}`);
    }
    return fetchFromTMDB(`/movie/${movieId}`);
}

// Get movie credits
export async function getMovieCredits(movieId: number): Promise<{ cast: CastMember[] }> {
    if (!movieId || typeof movieId !== 'number' || !Number.isFinite(movieId)) {
        throw new Error(`Invalid movie ID: ${movieId}`);
    }
    return fetchFromTMDB(`/movie/${movieId}/credits`);
}

// Get movie videos
export async function getMovieVideos(movieId: number): Promise<{ results: Video[] }> {
    if (!movieId || typeof movieId !== 'number' || !Number.isFinite(movieId)) {
        throw new Error(`Invalid movie ID: ${movieId}`);
    }
    return fetchFromTMDB(`/movie/${movieId}/videos`);
}

// Get similar movies
export async function getSimilarMovies(movieId: number, page: number = 1): Promise<MovieResponse> {
    if (!movieId || typeof movieId !== 'number' || !Number.isFinite(movieId)) {
        throw new Error(`Invalid movie ID: ${movieId}`);
    }
    return fetchFromTMDB(`/movie/${movieId}/similar`, { page: page.toString() });
}

// Watch Provider interface
export interface WatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string | null;
}

export interface WatchProviderResult {
    results: {
        [countryCode: string]: {
            link?: string;
            flatrate?: WatchProvider[];
            rent?: WatchProvider[];
            buy?: WatchProvider[];
        };
    };
}

// Get watch providers for a movie
export async function getWatchProviders(movieId: number): Promise<WatchProviderResult> {
    if (!movieId || typeof movieId !== 'number' || !Number.isFinite(movieId)) {
        throw new Error(`Invalid movie ID: ${movieId}`);
    }
    return fetchFromTMDB(`/movie/${movieId}/watch/providers`);
}

// Search movies
export async function searchMovies(query: string, page: number = 1): Promise<MovieResponse> {
    return fetchFromTMDB("/search/movie", {
        query,
        page: page.toString(),
        include_adult: "false",
    });
}

// Get all genres
export async function getGenres(): Promise<{ genres: Genre[] }> {
    return fetchFromTMDB("/genre/movie/list");
}

// Predefined genre list for quick access
export const GENRES: Genre[] = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
];

// TV Show genres (some differ from movies)
export const TV_GENRES: Genre[] = [
    { id: 10759, name: "Action & Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 10762, name: "Kids" },
    { id: 9648, name: "Mystery" },
    { id: 10763, name: "News" },
    { id: 10764, name: "Reality" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 10766, name: "Soap" },
    { id: 10767, name: "Talk" },
    { id: 10768, name: "War & Politics" },
    { id: 37, name: "Western" },
];
