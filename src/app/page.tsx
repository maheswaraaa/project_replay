"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Home,
  Search,
  Bookmark,
  User,
  Star,
  X,
  Heart,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Film,
  Clapperboard,
  MonitorPlay,
  BookmarkPlus,
  Filter,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle,
  ListPlus,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getByGenre,
  discoverMovies,
  getMovieDetails,
  getMovieCredits,
  getWatchProviders,
  searchMovies,
  getImageUrl,
  getBackdropUrl,
  GENRES,
  LANGUAGES,
  WATCH_PROVIDERS,
  getTrendingTV,
  getPopularTV,
  getTopRatedTV,
  getOnTheAirTV,
  discoverTV,
  getTVShowDetails,
  getTVShowCredits,
  getTVWatchProviders,
  searchTV,
  searchMulti,
  TV_GENRES,
  type Movie,
  type MovieDetail,
  type TVShow,
  type TVShowDetail,
  type CastMember,
  type WatchProvider,
  type MediaType,
  isTVShow,
  getMediaTitle,
  getMediaDate,
} from "@/lib/tmdb";
import MovieListItem from "@/components/MovieListItem";
import {
  useFilters,
  useLibrary,
  useMediaDetail,
  useMediaContent,
  useLibraryContent,
} from "@/hooks";

type Tab = "trending" | "popular" | "top_rated" | "now_playing";
type NavItem = "home" | "search" | "library" | "profile";
type LibraryTab = "watchlist" | "watched" | "favorites";

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

export default function HomePage() {
  // Filter state from hook
  const {
    activeTab,
    setActiveTab,
    activeGenre,
    setActiveGenre,
    activeYear,
    setActiveYear,
    activeLanguage,
    setActiveLanguage,
    activeSortBy,
    setActiveSortBy,
    activeProvider,
    setActiveProvider,
    activeMediaType,
    setActiveMediaType,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    clearFilters,
    resetToDefaults,
    hasActiveFilters,
  } = useFilters();

  const [activeNav, setActiveNav] = useState<NavItem>("home");
  const [activeLibraryTab, setActiveLibraryTab] = useState<LibraryTab>("watchlist");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Media detail state from hook
  const {
    selectedMovie,
    selectedTVShow,
    movieCast,
    movieWatchProviders,
    showModal,
    loadingModal,
    openMovieDetail,
    openTVDetail,
    closeModal,
  } = useMediaDetail();

  // Library state from hook
  const {
    watchlist,
    watched,
    favorites,
    toggleWatchlist,
    markAsWatched,
    toggleFavorite,
    showFavoritePrompt,
    promptMovieId,
    handleFavoritePrompt,
  } = useLibrary();

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [libraryMovies, setLibraryMovies] = useState<Movie[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);



  const fetchContent = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let response: { page: number; results: Movie[]; total_pages: number; total_results: number };
      const hasFilters = activeGenre || activeYear || activeLanguage || activeProvider || activeSortBy !== "popularity.desc";
      const isTV = activeMediaType === "tv";

      if (searchQuery && activeNav === "search") {
        // If streaming provider is selected, use discover endpoint
        // because TMDB search API doesn't support provider filtering
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
              results: tvResponse.results.map(tv => ({
                ...tv,
                title: tv.name,
                original_title: tv.original_name,
                release_date: tv.first_air_date,
                media_type: "tv" as const,
              })) as unknown as Movie[]
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

          // Client-side filter by search query on discover results
          const query = searchQuery.toLowerCase();
          response = {
            ...response,
            results: response.results.filter(m =>
              m.title.toLowerCase().includes(query) ||
              m.original_title?.toLowerCase().includes(query)
            )
          };
        } else {
          // No provider filter — use normal search API
          if (isTV) {
            const tvResponse = await searchTV(searchQuery, pageNum);
            response = {
              ...tvResponse,
              results: tvResponse.results.map(tv => ({
                ...tv,
                title: tv.name,
                original_title: tv.original_name,
                release_date: tv.first_air_date,
                media_type: "tv" as const,
              })) as unknown as Movie[]
            };
          } else {
            response = await searchMovies(searchQuery, pageNum);
          }

          // Client-side filtering for year/language/genre
          response = {
            ...response,
            results: response.results.filter(m => {
              if (activeYear) {
                const releaseYear = m.release_date ? parseInt(m.release_date.split("-")[0]) : null;
                if (releaseYear !== activeYear) return false;
              }
              if (activeLanguage && m.original_language !== activeLanguage) return false;
              if (activeGenre && !m.genre_ids?.includes(activeGenre)) return false;
              return true;
            })
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
            results: tvResponse.results.map(tv => ({
              ...tv,
              title: tv.name,
              original_title: tv.original_name,
              release_date: tv.first_air_date,
              media_type: "tv" as const,
            })) as unknown as Movie[]
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
            results: tvResponse.results.map(tv => ({
              ...tv,
              title: tv.name,
              original_title: tv.original_name,
              release_date: tv.first_air_date,
              media_type: "tv" as const,
            })) as unknown as Movie[]
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

      let newMovies = response.results.filter(m => m.poster_path);

      if (activeYear) {
        newMovies = newMovies.filter(m => {
          const releaseYear = m.release_date ? parseInt(m.release_date.split("-")[0]) : null;
          return releaseYear === activeYear;
        });
      }

      if (activeLanguage) {
        newMovies = newMovies.filter(m => m.original_language === activeLanguage);
      }

      if (activeGenre) {
        newMovies = newMovies.filter(m => m.genre_ids?.includes(activeGenre));
      }

      if (reset || pageNum === 1) {
        setMovies(newMovies);
      } else {
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNewMovies = newMovies.filter(m => !existingIds.has(m.id));
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
  }, [activeTab, activeGenre, activeYear, activeLanguage, activeSortBy, activeProvider, searchQuery, activeNav, activeMediaType]);

  useEffect(() => {
    if (activeNav === "library" || activeNav === "profile") return;
    setPage(1);
    setMovies([]);
    fetchContent(1, true);
  }, [activeTab, activeGenre, activeYear, activeLanguage, activeSortBy, activeProvider, activeNav, activeMediaType, fetchContent]);

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
                genre_ids: details.genres?.map(g => g.id) || [],
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

  // Wrapper for openDetail that includes activeMediaType context
  const openDetail = (item: Movie) => {
    if (!item || typeof item.id !== 'number') {
      console.error("Invalid item passed to openDetail:", item);
      return;
    }

    const itemId = item.id;
    const itemMediaType = (item as unknown as { media_type?: string }).media_type;
    const isTV = itemMediaType === "tv" || (itemMediaType === undefined && activeMediaType === "tv");

    if (isTV) {
      openTVDetail(itemId);
    } else {
      openMovieDetail(itemId);
    }
  };

  const applyFilters = (movieList: Movie[]) => {
    let filtered = movieList;

    // Search query filter (Library only - Search uses API)
    if (searchQuery && activeNav === "library") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.original_title?.toLowerCase().includes(query)
      );
    }

    // Media type filter (Library only)
    if (activeNav === "library" && activeMediaType !== "all") {
      filtered = filtered.filter(m => {
        const itemMediaType = (m as unknown as { media_type?: string }).media_type;
        if (activeMediaType === "movie") {
          return itemMediaType === "movie" || itemMediaType === undefined;
        } else if (activeMediaType === "tv") {
          return itemMediaType === "tv";
        }
        return true;
      });
    }

    if (activeGenre) {
      filtered = filtered.filter(m => m.genre_ids?.includes(activeGenre));
    }

    if (activeYear) {
      filtered = filtered.filter(m => {
        const releaseYear = m.release_date ? parseInt(m.release_date.split("-")[0]) : null;
        return releaseYear === activeYear;
      });
    }

    if (activeLanguage) {
      filtered = filtered.filter(m => m.original_language === activeLanguage);
    }

    // Note: Streaming provider can't be filtered client-side in Library
    // because we don't have provider data stored per movie.
    // This is a TMDB API limitation - provider info requires individual
    // movie detail calls. We skip it here for performance.

    return filtered;
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "trending", label: "Trending" },
    { key: "popular", label: "Popular" },
    { key: "top_rated", label: "Top Rated" },
    { key: "now_playing", label: "Now Playing" },
  ];

  const libraryTabs: { key: LibraryTab; label: string; icon: typeof Bookmark }[] = [
    { key: "watchlist", label: "Watchlist", icon: ListPlus },
    { key: "watched", label: "Watched", icon: Eye },
    { key: "favorites", label: "Favorites", icon: Heart },
  ];

  const navItems: { key: NavItem; icon: typeof Home; label: string }[] = [
    { key: "home", icon: Home, label: "Home" },
    { key: "search", icon: Search, label: "Search" },
    { key: "library", icon: Bookmark, label: "Library" },
    { key: "profile", icon: User, label: "Profile" },
  ];

  const renderMovieGrid = (movieList: Movie[], showEmpty = true) => {
    if (loading) {
      return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl skeleton" />
          ))}
        </div>
      );
    }

    if (movieList.length === 0 && showEmpty) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Film size={48} className="text-[var(--muted)] mb-4" />
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No movies found</h3>
          <p className="text-[var(--muted)] text-sm">Try adjusting your search or filters</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
        {movieList.map((movie, index) => (
          <div
            key={`${movie.id}-${index}`}
            onClick={() => openDetail(movie)}
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

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-xs">
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white font-medium">{(movie.vote_average ?? 0).toFixed(1)}</span>
            </div>

            <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => toggleWatchlist(movie.id, e)}
                className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 ${watchlist.includes(movie.id)
                  ? "bg-white text-black"
                  : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                title="Add to Watchlist"
              >
                <ListPlus size={12} className={watchlist.includes(movie.id) ? "fill-current" : ""} />
              </button>
              <button
                onClick={(e) => markAsWatched(movie.id, e)}
                className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 group/eye ${watched.includes(movie.id)
                  ? "bg-green-500 text-white"
                  : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                title="Mark as Watched"
              >
                {watched.includes(movie.id) ? (
                  <Eye size={12} />
                ) : (
                  <span className="block">
                    <EyeOff size={12} className="group-hover/eye:hidden" />
                    <Eye size={12} className="hidden group-hover/eye:block" />
                  </span>
                )}
              </button>
              <button
                onClick={(e) => toggleFavorite(movie.id, e)}
                className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 ${favorites.includes(movie.id)
                  ? "bg-red-500 text-white"
                  : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                title="Add to Favorites"
              >
                <Heart size={12} className={favorites.includes(movie.id) ? "fill-current" : ""} />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <h3 className="text-white text-sm font-medium line-clamp-2">{movie.title}</h3>
              <p className="text-white/60 text-xs mt-1">
                {movie.release_date?.split("-")[0] || "TBA"}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMovieList = (movieList: Movie[], showEmpty = true) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl skeleton" />
          ))}
        </div>
      );
    }

    if (movieList.length === 0 && showEmpty) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Film size={48} className="text-[var(--muted)] mb-4" />
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No movies found</h3>
          <p className="text-[var(--muted)] text-sm">Try adjusting your search or filters</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {movieList.map((movie) => (
          <MovieListItem
            key={movie.id}
            movie={movie}
            onOpenDetail={() => openDetail(movie)}
            onAddWatchlist={() => toggleWatchlist(movie.id)}
            onMarkWatched={() => markAsWatched(movie.id)}
            onToggleFavorite={() => toggleFavorite(movie.id)}
            isInWatchlist={watchlist.includes(movie.id)}
            isWatched={watched.includes(movie.id)}
            isFavorite={favorites.includes(movie.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-safe">
      {/* Header */}
      {activeNav !== "profile" && (
        <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--card-border)]/10 header-safe">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center h-14 gap-4">
              <button
                onClick={() => {
                  setActiveNav("home");
                  setActiveTab("trending");
                  setActiveGenre(null);
                  setActiveYear(null);
                  setActiveLanguage(null);
                  setActiveSortBy("popularity.desc");
                  setActiveProvider(null);
                  setSearchQuery("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity flex-shrink-0"
              >
                <Image
                  src="/logo.png"
                  alt="Replay"
                  width={24}
                  height={24}
                  className="invert"
                  priority
                />
                <span className="text-sm font-bold text-[var(--foreground)]">Replay</span>
                <span className="text-[10px] text-[var(--muted)]">— Discover. Watch. Remember.</span>
              </button>

              <div className="hidden md:block w-px h-5 bg-[var(--card-border)]/30" />

              {activeNav === "home" && (
                <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setActiveGenre(null);
                        setActiveYear(null);
                        setActiveLanguage(null);
                        setActiveSortBy("popularity.desc");
                        setActiveProvider(null);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${activeTab === tab.key && !activeGenre && !activeYear && !activeLanguage
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              )}

              {activeNav === "library" && (
                <motion.div
                  className="hidden lg:block flex-1 max-w-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--foreground)] transition-colors duration-200" />
                    <input
                      type="text"
                      placeholder="Filter library..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[var(--card-bg)]/50 border border-transparent rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:bg-[var(--card-bg)] focus:border-[var(--card-border)]/30 transition-all duration-300 ease-out"
                    />
                  </div>
                </motion.div>
              )}

              {activeNav === "search" && (
                <motion.div
                  className="hidden lg:block flex-1 max-w-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--foreground)] transition-colors duration-200" />
                    <input
                      type="text"
                      placeholder="Search movies & TV shows..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[var(--card-bg)]/50 border border-transparent rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:bg-[var(--card-bg)] focus:border-[var(--card-border)]/30 transition-all duration-300 ease-out"
                    />
                  </div>
                </motion.div>
              )}

              {activeNav !== "library" && activeNav !== "search" && <div className="flex-1" />}

              <div className="hidden lg:flex items-center gap-1.5">
                <div className="flex flex-nowrap rounded-full bg-[var(--card-bg)]/60 p-0.5 shrink-0">
                  <button
                    onClick={() => {
                      setActiveMediaType("movie");
                      setActiveGenre(null);
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap transition-all duration-200 ${activeMediaType === "movie"
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                  >
                    <Clapperboard size={10} />
                    Movies
                  </button>
                  <button
                    onClick={() => {
                      setActiveMediaType("tv");
                      setActiveGenre(null);
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap transition-all duration-200 ${activeMediaType === "tv"
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                  >
                    <MonitorPlay size={10} />
                    TV Shows
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={activeYear || ""}
                    onChange={(e) => setActiveYear(e.target.value ? parseInt(e.target.value) : null)}
                    className={`appearance-none pl-2.5 pr-6 py-1.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none transition-all duration-200 ${activeYear
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--card-bg)]/60 text-[var(--muted)] hover:bg-[var(--card-bg)]"
                      }`}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 35 }, (_, i) => 2025 - i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={activeGenre || ""}
                    onChange={(e) => setActiveGenre(e.target.value ? parseInt(e.target.value) : null)}
                    className={`appearance-none pl-2.5 pr-6 py-1.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none transition-all duration-200 ${activeGenre
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--card-bg)]/60 text-[var(--muted)] hover:bg-[var(--card-bg)]"
                      }`}
                  >
                    <option value="">Genre</option>
                    {(activeMediaType === "tv" ? TV_GENRES : GENRES).map((genre) => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={activeLanguage || ""}
                    onChange={(e) => setActiveLanguage(e.target.value || null)}
                    className={`appearance-none pl-2.5 pr-6 py-1.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none transition-all duration-200 ${activeLanguage
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--card-bg)]/60 text-[var(--muted)] hover:bg-[var(--card-bg)]"
                      }`}
                  >
                    <option value="">Language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={activeProvider || ""}
                    onChange={(e) => setActiveProvider(e.target.value || null)}
                    className={`appearance-none pl-2.5 pr-6 py-1.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none transition-all duration-200 ${activeProvider
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--card-bg)]/60 text-[var(--muted)] hover:bg-[var(--card-bg)]"
                      }`}
                  >
                    <option value="">All Services</option>
                    {WATCH_PROVIDERS.map((provider) => (
                      <option key={provider.id} value={provider.id}>{provider.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {(activeGenre || activeYear || activeLanguage || activeProvider) && (
                  <button
                    onClick={() => {
                      setActiveGenre(null);
                      setActiveYear(null);
                      setActiveLanguage(null);
                      setActiveProvider(null);
                    }}
                    className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] rounded-full transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}

                <button
                  onClick={() => setViewMode(prev => prev === "grid" ? "list" : "grid")}
                  className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] rounded-full transition-colors"
                  title={viewMode === "grid" ? "Switch to List View" : "Switch to Grid View"}
                >
                  {viewMode === "grid" ? <List size={14} /> : <LayoutGrid size={14} />}
                </button>
              </div>

              <button
                onClick={() => setActiveNav("library")}
                className={`hidden lg:flex p-2 rounded-full transition-all duration-200 flex-shrink-0 ${activeNav === "library"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-[var(--foreground)]"
                  }`}
              >
                <Bookmark size={16} className={activeNav === "library" ? "fill-current" : ""} />
              </button>
            </div>

            {activeNav === "home" && (
              <div className="flex md:hidden flex-col gap-2 py-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={activeTab}
                      onChange={(e) => {
                        setActiveTab(e.target.value as Tab);
                        setActiveGenre(null);
                        setActiveYear(null);
                        setActiveLanguage(null);
                        setActiveSortBy("popularity.desc");
                        setActiveProvider(null);
                      }}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-xl cursor-pointer focus:outline-none"
                    >
                      {tabs.map((tab) => (
                        <option key={tab.key} value={tab.key}>{tab.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--background)]" />
                  </div>

                  <div className="flex rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] p-0.5 shrink-0">
                    <button
                      onClick={() => {
                        setActiveMediaType("movie");
                        setActiveGenre(null);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${activeMediaType === "movie"
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "text-[var(--muted)]"
                        }`}
                    >
                      <Clapperboard size={12} />
                      <span className="hidden xs:inline">Movies</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMediaType("tv");
                        setActiveGenre(null);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${activeMediaType === "tv"
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "text-[var(--muted)]"
                        }`}
                    >
                      <MonitorPlay size={12} />
                      <span className="hidden xs:inline">TV</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl shrink-0 transition-all duration-200 ${(activeGenre || activeYear || activeLanguage || activeProvider)
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--muted)]"
                      }`}
                  >
                    <Filter size={14} />
                    {(activeGenre || activeYear || activeLanguage || activeProvider) && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--background)]/20 font-bold">
                        {[activeGenre, activeYear, activeLanguage, activeProvider].filter(Boolean).length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setViewMode(prev => prev === "grid" ? "list" : "grid")}
                    className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl transition-colors shrink-0"
                    title={viewMode === "grid" ? "Switch to List View" : "Switch to Grid View"}
                  >
                    {viewMode === "grid" ? <List size={14} /> : <LayoutGrid size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Mobile Search Bar */}
      {activeNav === "search" && (
        <div className="lg:hidden sticky top-14 z-30 bg-[var(--background)] px-4 py-3 border-b border-[var(--card-border)]">
          <div className="relative mb-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search movies & TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all"
            />
          </div>
          {/* Search filters row */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] p-0.5 shrink-0">
              <button
                onClick={() => {
                  setActiveMediaType("movie");
                  setActiveGenre(null);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${activeMediaType === "movie"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)]"
                  }`}
              >
                <Clapperboard size={12} />
                Movies
              </button>
              <button
                onClick={() => {
                  setActiveMediaType("tv");
                  setActiveGenre(null);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${activeMediaType === "tv"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)]"
                  }`}
              >
                <MonitorPlay size={12} />
                TV
              </button>
            </div>

            <button
              onClick={() => setShowMobileFilters(true)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl shrink-0 transition-all duration-200 ${(activeGenre || activeYear || activeLanguage || activeProvider)
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--muted)]"
                }`}
            >
              <Filter size={14} />
              {(activeGenre || activeYear || activeLanguage || activeProvider) && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--background)]/20 font-bold">
                  {[activeGenre, activeYear, activeLanguage, activeProvider].filter(Boolean).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setViewMode(prev => prev === "grid" ? "list" : "grid")}
              className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl transition-colors shrink-0"
            >
              {viewMode === "grid" ? <List size={14} /> : <LayoutGrid size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Home / Search Tab */}
        {(activeNav === "home" || activeNav === "search") && (
          <>
            {activeNav === "search" && !searchQuery ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search size={48} className="text-[var(--muted)] mb-4" />
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Search for movies</h3>
                <p className="text-[var(--muted)] text-sm">Type to start searching</p>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? renderMovieGrid(movies) : renderMovieList(movies)}
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {loadingMore && (
                    <Loader2 size={24} className="text-[var(--muted)] animate-spin" />
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Library Tab */}
        {activeNav === "library" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Your Library</h2>

              <div className="flex rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] p-0.5">
                <button
                  onClick={() => setActiveMediaType("movie")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${activeMediaType === "movie"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                >
                  <Clapperboard size={12} />
                  Movies
                </button>
                <button
                  onClick={() => setActiveMediaType("tv")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${activeMediaType === "tv"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                >
                  <MonitorPlay size={12} />
                  TV Shows
                </button>
              </div>
            </div>

            {libraryLoading && (
              <div className="flex items-center gap-2 mb-4 text-[var(--muted)]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading library items...</span>
              </div>
            )}

            {/* Library Tabs - Mobile: underline tabs, Desktop: pill tabs */}
            <div className="mb-6">
              {/* Mobile: underline tabs - no scroll needed */}
              <div className="sm:hidden border-b border-[var(--card-border)]">
                <div className="flex">
                  {libraryTabs.map((tab) => {
                    const Icon = tab.icon;
                    const tabMovies = tab.key === "watchlist"
                      ? libraryMovies.filter(m => watchlist.includes(m.id))
                      : tab.key === "watched"
                        ? libraryMovies.filter(m => watched.includes(m.id))
                        : libraryMovies.filter(m => favorites.includes(m.id));
                    const filteredCount = applyFilters(tabMovies).length;
                    const isActive = activeLibraryTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveLibraryTab(tab.key)}
                        className="flex-1 relative"
                      >
                        <div className={`flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors duration-200 ${isActive
                          ? "text-[var(--foreground)]"
                          : "text-[var(--muted)]"
                          }`}>
                          <Icon size={14} />
                          <span>{tab.label}</span>
                          {filteredCount > 0 && (
                            <span className={`min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold rounded-full leading-none ${isActive
                              ? "bg-[var(--foreground)] text-[var(--background)]"
                              : "bg-[var(--card-border)] text-[var(--muted)]"
                              }`}>
                              {filteredCount}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="activeLibraryTab"
                            className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--foreground)] rounded-full"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desktop: original pill tabs */}
              <div className="hidden sm:flex gap-2">
                {libraryTabs.map((tab) => {
                  const Icon = tab.icon;
                  const tabMovies = tab.key === "watchlist"
                    ? libraryMovies.filter(m => watchlist.includes(m.id))
                    : tab.key === "watched"
                      ? libraryMovies.filter(m => watched.includes(m.id))
                      : libraryMovies.filter(m => favorites.includes(m.id));
                  const filteredCount = applyFilters(tabMovies).length;
                  const loadedCount = tabMovies.length;
                  const savedCount = tab.key === "watchlist" ? watchlist.length
                    : tab.key === "watched" ? watched.length
                      : favorites.length;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveLibraryTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeLibraryTab === tab.key
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "bg-[var(--card-bg)] text-[var(--muted)] border border-[var(--card-border)] hover:border-[var(--foreground)]/30"
                        }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                      {filteredCount > 0 && (
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${activeLibraryTab === tab.key
                          ? "bg-[var(--background)] text-[var(--foreground)]"
                          : "bg-[var(--card-border)] text-[var(--foreground)]"
                          }`}>
                          {filteredCount}{loadedCount > filteredCount ? `/${loadedCount}` : savedCount > loadedCount ? `/${savedCount}` : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nudge */}
            {activeLibraryTab === "watchlist" && watchlist.length > 0 && watched.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-xl flex items-center gap-3"
              >
                <Eye size={20} className="text-green-500 flex-shrink-0" />
                <p className="text-sm text-[var(--foreground)]">
                  Have you watched any of these? <span className="text-[var(--muted)]">Mark them as watched!</span>
                </p>
              </motion.div>
            )}

            {/* Watchlist */}
            {activeLibraryTab === "watchlist" && (
              <>
                {watchlist.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <ListPlus size={48} className="text-[var(--muted)] mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Your watchlist is empty!</h3>
                    <p className="text-[var(--muted)] text-sm mb-4">Browse and add movies you want to watch.</p>
                    <button
                      onClick={() => setActiveNav("home")}
                      className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Sparkles size={16} />
                      Discover Movies
                    </button>
                  </motion.div>
                ) : (
                  viewMode === "list" ? (
                    renderMovieList(applyFilters(libraryMovies.filter(m => watchlist.includes(m.id))), false)
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                      {applyFilters(libraryMovies.filter(m => watchlist.includes(m.id))).map((movie, index) => (
                        <motion.div
                          key={`${movie.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(index, 12) * 0.02, ease: easeOut }}
                          onClick={() => openDetail(movie)}
                          className="poster-card relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-[var(--card-border)]"
                        >
                          <Image
                            src={getImageUrl(movie.poster_path, "w500") || ""}
                            alt={movie.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 rounded-md text-xs">
                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-white font-medium">{movie.vote_average.toFixed(1)}</span>
                          </div>
                        </motion.div>
                      ))}
                      {libraryMovies.filter(m => watchlist.includes(m.id)).length === 0 && watchlist.length > 0 && (
                        <div className="col-span-full text-center py-10 text-[var(--muted)]">
                          <p>Loading your watchlist...</p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </>
            )}

            {/* Watched */}
            {activeLibraryTab === "watched" && (
              <>
                {watched.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <Eye size={48} className="text-[var(--muted)] mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No watched movies yet</h3>
                    <p className="text-[var(--muted)] text-sm">Mark movies as watched to track what you&apos;ve seen!</p>
                  </motion.div>
                ) : (
                  viewMode === "list" ? (
                    renderMovieList(applyFilters(libraryMovies.filter(m => watched.includes(m.id))), false)
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                      {applyFilters(libraryMovies.filter(m => watched.includes(m.id))).map((movie, index) => (
                        <motion.div
                          key={`${movie.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(index, 12) * 0.02, ease: easeOut }}
                          onClick={() => openDetail(movie)}
                          className="poster-card relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-[var(--card-border)]"
                        >
                          <Image
                            src={getImageUrl(movie.poster_path, "w500") || ""}
                            alt={movie.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-green-500/90 rounded-md text-xs">
                            <Eye size={10} className="text-white" />
                            <span className="text-white font-medium">Watched</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}

            {/* Favorites */}
            {activeLibraryTab === "favorites" && (
              <>
                {favorites.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <Heart size={48} className="text-[var(--muted)] mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No favorites yet</h3>
                    <p className="text-[var(--muted)] text-sm">Movies worth rewatching will appear here!</p>
                  </motion.div>
                ) : (
                  viewMode === "list" ? (
                    renderMovieList(applyFilters(libraryMovies.filter(m => favorites.includes(m.id))), false)
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                      {applyFilters(libraryMovies.filter(m => favorites.includes(m.id))).map((movie, index) => (
                        <motion.div
                          key={`${movie.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(index, 12) * 0.02, ease: easeOut }}
                          onClick={() => openDetail(movie)}
                          className="poster-card relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-[var(--card-border)]"
                        >
                          <Image
                            src={getImageUrl(movie.poster_path, "w500") || ""}
                            alt={movie.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-red-500/90 rounded-md text-xs">
                            <Heart size={10} className="text-white fill-white" />
                            <span className="text-white font-medium">Favorite</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeNav === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="flex flex-col items-center py-4 min-h-[calc(100vh-8rem)]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-orange-500/30 rounded-full scale-150" />
                <div className="relative w-14 h-14 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Replay"
                    width={32}
                    height={32}
                    className="invert"
                    priority
                  />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">Replay</h2>
                <p className="text-xs text-[var(--muted)]">Discover. Watch. Remember.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-2 w-full max-w-xs mb-4"
            >
              <button
                onClick={() => { setActiveNav("library"); setActiveLibraryTab("watchlist"); }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-3 text-center hover:border-amber-500/40 transition-all duration-200 hover:scale-102"
              >
                <BookmarkPlus size={16} className="mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-bold text-[var(--foreground)]">{watchlist.length}</p>
                <p className="text-[10px] text-[var(--muted)]">Watchlist</p>
              </button>

              <button
                onClick={() => { setActiveNav("library"); setActiveLibraryTab("watched"); }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-3 text-center hover:border-green-500/40 transition-all duration-200 hover:scale-102"
              >
                <Eye size={16} className="mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold text-[var(--foreground)]">{watched.length}</p>
                <p className="text-[10px] text-[var(--muted)]">Watched</p>
              </button>

              <button
                onClick={() => { setActiveNav("library"); setActiveLibraryTab("favorites"); }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-3 text-center hover:border-red-500/40 transition-all duration-200 hover:scale-102"
              >
                <Heart size={16} className="mx-auto mb-1 text-red-500" />
                <p className="text-lg font-bold text-[var(--foreground)]">{favorites.length}</p>
                <p className="text-[10px] text-[var(--muted)]">Favorites</p>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-xs mb-4"
            >
              <button
                onClick={() => setActiveNav("home")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--foreground)] text-[var(--background)] font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                <Sparkles size={16} />
                Explore Movies & TV Shows
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-xs p-4 rounded-xl bg-[var(--card-bg)]/50 border border-[var(--card-border)]/30"
            >
              <h3 className="text-xs font-semibold text-[var(--foreground)] mb-2">About Replay</h3>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed mb-2">
                Your personal movie & TV companion. All data stored <span className="text-[var(--foreground)]">locally on your device</span> — no accounts, no tracking.
              </p>
              <p className="text-[9px] text-[var(--muted)]/70">
                Built with ♥ • Data from TMDB
              </p>
            </motion.div>

            <div className="flex-1" />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] text-[var(--muted)]/50 mt-4"
            >
              Powered by TMDB API
            </motion.p>
          </motion.div>
        )}
      </main>

      {/* Movie Detail Modal */}
      <AnimatePresence>
        {showModal && (
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
              ) : selectedTVShow ? (
                <>
                  <div className="relative h-48 md:h-64">
                    {selectedTVShow.backdrop_path ? (
                      <Image
                        src={getBackdropUrl(selectedTVShow.backdrop_path) || ""}
                        alt={selectedTVShow.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--card-border)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent" />

                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X size={20} className="text-white" />
                    </button>

                    <button
                      onClick={closeModal}
                      className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors md:hidden"
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                  </div>

                  <div className="px-5 pb-8 -mt-16 relative overflow-y-auto max-h-[calc(90vh-12rem)]">
                    <div className="flex gap-4 mb-4">
                      <div className="relative w-24 h-36 rounded-xl overflow-hidden shadow-xl flex-shrink-0 bg-[var(--card-border)]">
                        <Image
                          src={getImageUrl(selectedTVShow.poster_path, "w300") || ""}
                          alt={selectedTVShow.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 pt-16">
                        <h2 className="text-xl font-bold text-[var(--foreground)]">{selectedTVShow.name}</h2>
                        {selectedTVShow.tagline && (
                          <p className="text-sm text-[var(--muted)] italic mt-1">&ldquo;{selectedTVShow.tagline}&rdquo;</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-[var(--muted)]">
                          <span className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            {selectedTVShow.vote_average.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {selectedTVShow.first_air_date?.split("-")[0]}
                          </span>
                          <span className="px-2 py-0.5 bg-[var(--background)] rounded text-xs font-medium">
                            {selectedTVShow.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedTVShow.genres?.map((genre) => (
                        <span
                          key={genre.id}
                          className="px-3 py-1 bg-[var(--background)] text-[var(--foreground)] text-xs font-medium rounded-full border border-[var(--card-border)]"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-4 mb-4 p-3 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
                      <div className="text-center flex-1">
                        <p className="text-2xl font-bold text-[var(--foreground)]">{selectedTVShow.number_of_seasons}</p>
                        <p className="text-xs text-[var(--muted)]">Seasons</p>
                      </div>
                      <div className="w-px bg-[var(--card-border)]" />
                      <div className="text-center flex-1">
                        <p className="text-2xl font-bold text-[var(--foreground)]">{selectedTVShow.number_of_episodes}</p>
                        <p className="text-xs text-[var(--muted)]">Episodes</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-6">
                      <button
                        onClick={() => toggleWatchlist(selectedTVShow.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all ${watchlist.includes(selectedTVShow.id)
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--background)] text-[var(--foreground)] border border-[var(--card-border)]"
                          }`}
                      >
                        <ListPlus size={18} className={watchlist.includes(selectedTVShow.id) ? "fill-current" : ""} />
                        {watchlist.includes(selectedTVShow.id) ? "In Watchlist" : "Add to Watchlist"}
                      </button>
                      <button
                        onClick={() => markAsWatched(selectedTVShow.id)}
                        className={`p-3 rounded-xl transition-all group/eye ${watched.includes(selectedTVShow.id)
                          ? "bg-green-500 text-white"
                          : "bg-[var(--background)] border border-[var(--card-border)] hover:bg-[var(--card-border)]"
                          }`}
                        title="Mark as Watched"
                      >
                        {watched.includes(selectedTVShow.id) ? (
                          <Eye size={18} />
                        ) : (
                          <>
                            <EyeOff size={18} className="group-hover/eye:hidden text-[var(--foreground)]" />
                            <Eye size={18} className="hidden group-hover/eye:block text-[var(--foreground)]" />
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => toggleFavorite(selectedTVShow.id)}
                        className={`p-3 rounded-xl transition-all ${favorites.includes(selectedTVShow.id)
                          ? "bg-red-500 text-white"
                          : "bg-[var(--background)] border border-[var(--card-border)] hover:bg-[var(--card-border)]"
                          }`}
                        title="Add to Favorites"
                      >
                        <Heart size={18} className={favorites.includes(selectedTVShow.id) ? "fill-current" : "text-[var(--foreground)]"} />
                      </button>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-[var(--foreground)] mb-2">Overview</h3>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">
                        {selectedTVShow.overview || "No overview available."}
                      </p>
                    </div>

                    {selectedTVShow.seasons && selectedTVShow.seasons.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-[var(--foreground)] mb-3">Seasons</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {selectedTVShow.seasons.filter(s => s.season_number > 0).map((season) => (
                            <div
                              key={season.id}
                              className="flex items-center gap-3 p-2 bg-[var(--background)] rounded-lg border border-[var(--card-border)]"
                            >
                              {season.poster_path ? (
                                <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0">
                                  <Image
                                    src={getImageUrl(season.poster_path, "w200") || ""}
                                    alt={season.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-14 rounded bg-[var(--card-border)] flex items-center justify-center flex-shrink-0">
                                  <Film size={16} className="text-[var(--muted)]" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--foreground)] truncate">{season.name}</p>
                                <p className="text-xs text-[var(--muted)]">{season.episode_count} episodes</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                              <p className="text-xs font-medium text-[var(--foreground)] truncate" title={person.name}>{person.name}</p>
                              <p className="text-xs text-[var(--muted)] truncate" title={person.character}>{person.character}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : selectedMovie ? (
                <>
                  <div className="relative h-48 md:h-64">
                    {selectedMovie.backdrop_path ? (
                      <Image
                        src={getBackdropUrl(selectedMovie.backdrop_path) || ""}
                        alt={selectedMovie.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--card-border)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent" />

                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X size={20} className="text-white" />
                    </button>

                    <button
                      onClick={closeModal}
                      className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors md:hidden"
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                  </div>

                  <div className="px-5 pb-8 -mt-16 relative overflow-y-auto max-h-[calc(90vh-12rem)]">
                    <div className="flex gap-4 mb-4">
                      <div className="relative w-24 h-36 rounded-xl overflow-hidden shadow-xl flex-shrink-0 bg-[var(--card-border)]">
                        <Image
                          src={getImageUrl(selectedMovie.poster_path, "w300") || ""}
                          alt={selectedMovie.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 pt-16">
                        <h2 className="text-xl font-bold text-[var(--foreground)]">{selectedMovie.title}</h2>
                        {selectedMovie.tagline && (
                          <p className="text-sm text-[var(--muted)] italic mt-1">&ldquo;{selectedMovie.tagline}&rdquo;</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-[var(--muted)]">
                          <span className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            {selectedMovie.vote_average.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {selectedMovie.release_date?.split("-")[0]}
                          </span>
                          {selectedMovie.runtime > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {Math.floor(selectedMovie.runtime / 60)}h {selectedMovie.runtime % 60}m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedMovie.genres?.map((genre) => (
                        <span
                          key={genre.id}
                          className="px-3 py-1 bg-[var(--background)] text-[var(--foreground)] text-xs font-medium rounded-full border border-[var(--card-border)]"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 mb-6">
                      <button
                        onClick={() => toggleWatchlist(selectedMovie.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all ${watchlist.includes(selectedMovie.id)
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--background)] text-[var(--foreground)] border border-[var(--card-border)]"
                          }`}
                      >
                        <ListPlus size={18} className={watchlist.includes(selectedMovie.id) ? "fill-current" : ""} />
                        {watchlist.includes(selectedMovie.id) ? "In Watchlist" : "Add to Watchlist"}
                      </button>
                      <button
                        onClick={() => markAsWatched(selectedMovie.id)}
                        className={`p-3 rounded-xl transition-all group/eye ${watched.includes(selectedMovie.id)
                          ? "bg-green-500 text-white"
                          : "bg-[var(--background)] border border-[var(--card-border)] hover:bg-[var(--card-border)]"
                          }`}
                        title="Mark as Watched"
                      >
                        {watched.includes(selectedMovie.id) ? (
                          <Eye size={18} />
                        ) : (
                          <>
                            <EyeOff size={18} className="group-hover/eye:hidden text-[var(--foreground)]" />
                            <Eye size={18} className="hidden group-hover/eye:block text-[var(--foreground)]" />
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => toggleFavorite(selectedMovie.id)}
                        className={`p-3 rounded-xl transition-all ${favorites.includes(selectedMovie.id)
                          ? "bg-red-500 text-white"
                          : "bg-[var(--background)] border border-[var(--card-border)] hover:bg-[var(--card-border)]"
                          }`}
                        title="Add to Favorites"
                      >
                        <Heart size={18} className={favorites.includes(selectedMovie.id) ? "fill-current" : "text-[var(--foreground)]"} />
                      </button>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-[var(--foreground)] mb-2">Overview</h3>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">
                        {selectedMovie.overview || "No overview available."}
                      </p>
                    </div>

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
                              <p className="text-xs font-medium text-[var(--foreground)] truncate" title={person.name}>{person.name}</p>
                              <p className="text-xs text-[var(--muted)] truncate" title={person.character}>{person.character}</p>
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
        )}
      </AnimatePresence>

      {/* Favorite Prompt */}
      <AnimatePresence>
        {showFavoritePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => handleFavoritePrompt(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ ease: easeOut }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Heart size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Did you enjoy it?
                </h3>
                <p className="text-sm text-[var(--muted)] mb-6">
                  Is this movie worth rewatching? Add it to your favorites!
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => handleFavoritePrompt(false)}
                    className="flex-1 py-2.5 px-4 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-border)] transition-colors"
                  >
                    Not really
                  </button>
                  <button
                    onClick={() => handleFavoritePrompt(true)}
                    className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Heart size={16} className="fill-current" />
                    Yes, favorite!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Filter Sheet */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-[var(--card-bg)] border-t border-[var(--card-border)] rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[var(--card-bg)] pt-3 pb-2 px-4 border-b border-[var(--card-border)]/30">
                <div className="w-12 h-1.5 bg-[var(--muted)]/30 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--card-border)]/50 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Year</label>
                  <select
                    value={activeYear || ""}
                    onChange={(e) => setActiveYear(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
                  >
                    <option value="">All Years</option>
                    {Array.from({ length: 35 }, (_, i) => 2025 - i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Genre</label>
                  <select
                    value={activeGenre || ""}
                    onChange={(e) => setActiveGenre(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
                  >
                    <option value="">All Genres</option>
                    {(activeMediaType === "tv" ? TV_GENRES : GENRES).map((genre) => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Language</label>
                  <select
                    value={activeLanguage || ""}
                    onChange={(e) => setActiveLanguage(e.target.value || null)}
                    className="w-full p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
                  >
                    <option value="">All Languages</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Streaming Service</label>
                  <select
                    value={activeProvider || ""}
                    onChange={(e) => setActiveProvider(e.target.value || null)}
                    className="w-full p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
                  >
                    <option value="">All Services</option>
                    {WATCH_PROVIDERS.map((provider) => (
                      <option key={provider.id} value={provider.id}>{provider.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">View Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${viewMode === "grid"
                        ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                        : "bg-[var(--background)] text-[var(--muted)] border-[var(--card-border)] hover:border-[var(--foreground)]/30"
                        }`}
                    >
                      <LayoutGrid size={18} />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${viewMode === "list"
                        ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                        : "bg-[var(--background)] text-[var(--muted)] border-[var(--card-border)] hover:border-[var(--foreground)]/30"
                        }`}
                    >
                      <List size={18} />
                      List
                    </button>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 p-4 bg-[var(--card-bg)] border-t border-[var(--card-border)]/30 flex gap-3">
                <button
                  onClick={() => {
                    setActiveGenre(null);
                    setActiveYear(null);
                    setActiveLanguage(null);
                    setActiveProvider(null);
                  }}
                  className="flex-1 py-3 px-4 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-border)] transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-3 px-4 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-xl hover:opacity-90 transition-opacity"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="flex items-center gap-1 px-2 py-2 bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl shadow-lg"
        >
          {navItems.map((item) => (
            <motion.button
              key={item.key}
              onClick={() => {
                const prevNav = activeNav;
                setActiveNav(item.key);

                // Clear filters and search when switching sections
                if (item.key !== prevNav) {
                  setSearchQuery("");
                  setActiveGenre(null);
                  setActiveYear(null);
                  setActiveLanguage(null);
                  setActiveProvider(null);
                  setActiveSortBy("popularity.desc");
                }
              }}
              className="relative flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-colors duration-200"
              whileTap={{ scale: 0.95 }}
            >
              {activeNav === item.key && (
                <motion.div
                  layoutId="activeNavBg"
                  className="absolute inset-0 bg-[var(--foreground)] rounded-xl"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}

              <motion.div
                className="relative z-10 flex flex-col items-center gap-1"
                animate={{
                  color: activeNav === item.key ? "var(--background)" : "var(--muted)"
                }}
                transition={{ duration: 0.2 }}
              >
                <item.icon size={20} strokeWidth={activeNav === item.key ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.div>
            </motion.button>
          ))}
        </motion.div>
      </nav>
    </div>
  );
}