const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface Movie {
    id: number;
    title: string;
    original_title: string;
    original_language: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    popularity: number;
    adult: boolean;
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
    return fetchFromTMDB(`/movie/${movieId}`);
}

// Get movie credits
export async function getMovieCredits(movieId: number): Promise<{ cast: CastMember[] }> {
    return fetchFromTMDB(`/movie/${movieId}/credits`);
}

// Get movie videos
export async function getMovieVideos(movieId: number): Promise<{ results: Video[] }> {
    return fetchFromTMDB(`/movie/${movieId}/videos`);
}

// Get similar movies
export async function getSimilarMovies(movieId: number, page: number = 1): Promise<MovieResponse> {
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
