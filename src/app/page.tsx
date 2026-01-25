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
  Settings,
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
  type Movie,
  type MovieDetail,
  type CastMember,
  type WatchProvider,
} from "@/lib/tmdb";

type Tab = "trending" | "popular" | "top_rated" | "now_playing";
type NavItem = "home" | "search" | "library" | "profile";
type LibraryTab = "watchlist" | "watched" | "favorites";

// Simplified animation ease for performance
const easeOut = [0.25, 0.46, 0.45, 0.94];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("trending");
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [activeSortBy, setActiveSortBy] = useState<string>("popularity.desc");
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<NavItem>("home");
  const [activeLibraryTab, setActiveLibraryTab] = useState<LibraryTab>("watchlist");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [movieCast, setMovieCast] = useState<CastMember[]>([]);
  const [movieWatchProviders, setMovieWatchProviders] = useState<WatchProvider[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Library states - new structure
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [watched, setWatched] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Dialog state for "Add to favorites?" prompt
  const [showFavoritePrompt, setShowFavoritePrompt] = useState(false);
  const [promptMovieId, setPromptMovieId] = useState<number | null>(null);

  // Hero carousel state
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // View mode state (grid or list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("replay_watchlist");
    const savedWatched = localStorage.getItem("replay_watched");
    const savedFavorites = localStorage.getItem("replay_favorites");
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    if (savedWatched) setWatched(JSON.parse(savedWatched));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Fetch movies based on active filters
  const fetchMovies = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let response;
      const hasFilters = activeGenre || activeYear || activeLanguage || activeProvider || activeSortBy !== "popularity.desc";

      if (searchQuery && activeNav === "search") {
        response = await searchMovies(searchQuery, pageNum);
      } else if (hasFilters) {
        // Use discover endpoint when any filter is active
        response = await discoverMovies({
          genreId: activeGenre,
          year: activeYear,
          language: activeLanguage,
          watchProviders: activeProvider,
          sortBy: activeSortBy,
          page: pageNum,
        });
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

      // Filter movies that have poster images
      let newMovies = response.results.filter(m => m.poster_path);

      // Client-side filtering to ensure results match filter criteria
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
        // Deduplicate: only add movies that don't already exist
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNewMovies = newMovies.filter(m => !existingIds.has(m.id));
          return [...prev, ...uniqueNewMovies];
        });
      }

      setHasMore(response.page < response.total_pages);
      setPage(response.page);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, activeGenre, activeYear, activeLanguage, activeSortBy, activeProvider, searchQuery, activeNav]);

  // Initial load and filter changes
  useEffect(() => {
    if (activeNav === "library" || activeNav === "profile") return;
    setPage(1);
    setMovies([]);
    fetchMovies(1, true);
  }, [activeTab, activeGenre, activeYear, activeLanguage, activeSortBy, activeProvider, activeNav, fetchMovies]);

  // Search with debounce
  useEffect(() => {
    if (activeNav !== "search") return;

    const timer = setTimeout(() => {
      if (searchQuery) {
        setPage(1);
        setMovies([]);
        fetchMovies(1, true);
      } else {
        setMovies([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeNav, fetchMovies]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || activeNav === "library" || activeNav === "profile") return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchMovies(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, loadingMore, page, fetchMovies, activeNav]);

  // Open movie detail modal
  const openMovieDetail = async (movieId: number) => {
    setLoadingModal(true);
    setShowModal(true);
    setMovieWatchProviders([]);
    document.body.style.overflow = "hidden";

    try {
      const [details, credits, watchProviders] = await Promise.all([
        getMovieDetails(movieId),
        getMovieCredits(movieId),
        getWatchProviders(movieId),
      ]);
      setSelectedMovie(details);
      setMovieCast(credits.cast.slice(0, 10));

      // Get US watch providers (flatrate = subscription streaming)
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
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
    setMovieCast([]);
    setMovieWatchProviders([]);
    document.body.style.overflow = "auto";
  };

  // Toggle watchlist (add/remove from watchlist)
  const toggleWatchlist = (movieId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWatchlist((prev: number[]) => {
      const newList = prev.includes(movieId)
        ? prev.filter((id: number) => id !== movieId)
        : [...prev, movieId];
      localStorage.setItem("replay_watchlist", JSON.stringify(newList));
      return newList;
    });
  };

  // Mark as watched / Unwatch (toggle)
  const markAsWatched = (movieId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();

    // Check if already watched - if so, unwatch (no notification)
    if (watched.includes(movieId)) {
      setWatched((prev: number[]) => {
        const newList = prev.filter((id: number) => id !== movieId);
        localStorage.setItem("replay_watched", JSON.stringify(newList));
        return newList;
      });
      return; // Don't show any prompt when unwatching
    }

    // Remove from watchlist if present
    setWatchlist((prev: number[]) => {
      const newList = prev.filter((id: number) => id !== movieId);
      localStorage.setItem("replay_watchlist", JSON.stringify(newList));
      return newList;
    });

    // Add to watched
    setWatched((prev: number[]) => {
      const newList = [...prev, movieId];
      localStorage.setItem("replay_watched", JSON.stringify(newList));
      return newList;
    });

    // Show favorite prompt only when marking as watched
    setPromptMovieId(movieId);
    setShowFavoritePrompt(true);
  };

  // Toggle favorite
  const toggleFavorite = (movieId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev: number[]) => {
      const newList = prev.includes(movieId)
        ? prev.filter((id: number) => id !== movieId)
        : [...prev, movieId];
      localStorage.setItem("replay_favorites", JSON.stringify(newList));
      return newList;
    });
  };

  // Handle favorite prompt response
  const handleFavoritePrompt = (addToFavorites: boolean) => {
    if (addToFavorites && promptMovieId) {
      toggleFavorite(promptMovieId);
    }
    setShowFavoritePrompt(false);
    setPromptMovieId(null);
  };

  // Helper function to apply filters to any movie list
  const applyFilters = (movieList: Movie[]) => {
    let filtered = movieList;

    // Search query filter (for Library filtering)
    if (searchQuery && activeNav === "library") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.original_title?.toLowerCase().includes(query)
      );
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

  // Render movie grid (reusable)
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
                className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 ${watchlist.includes(movie.id)
                  ? "bg-white text-black"
                  : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                title="Add to Watchlist"
              >
                <ListPlus size={12} className={watchlist.includes(movie.id) ? "fill-current" : ""} />
              </button>
              {/* Mark as Watched */}
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
              {/* Add to Favorites */}
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

            {/* Hover Info */}
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

  // Render movie list view with swipe gestures
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
            onOpenDetail={() => openMovieDetail(movie.id)}
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

  // List Item Component with swipe gestures for mobile
  const MovieListItem = ({
    movie,
    onOpenDetail,
    onAddWatchlist,
    onMarkWatched,
    onToggleFavorite,
    isInWatchlist,
    isWatched,
    isFavorite,
  }: {
    movie: Movie;
    onOpenDetail: () => void;
    onAddWatchlist: () => void;
    onMarkWatched: () => void;
    onToggleFavorite: () => void;
    isInWatchlist: boolean;
    isWatched: boolean;
    isFavorite: boolean;
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragX, setDragX] = useState(0);
    const swipeThreshold = 80;

    const handleDragStart = () => {
      setIsDragging(true);
    };

    const handleDragEnd = () => {
      if (dragX > swipeThreshold) {
        // Swiped RIGHT - Add to Watchlist
        onAddWatchlist();
      } else if (dragX < -swipeThreshold) {
        // Swiped LEFT - Mark as Watched
        onMarkWatched();
      }
      setDragX(0);
      setIsDragging(false);
    };

    return (
      <div className="relative overflow-hidden rounded-xl">
        {/* Swipe action backgrounds - only visible when dragging */}
        {isDragging && (
          <>
            {/* Right Swipe Background - Watchlist (Yellow) */}
            {dragX > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center pl-4 bg-yellow-500"
              >
                <div className="flex items-center gap-2 text-white">
                  <BookmarkPlus size={20} />
                  <span className="text-sm font-medium">
                    {isInWatchlist ? "Remove" : "Watchlist"}
                  </span>
                </div>
              </motion.div>
            )}
            {/* Left Swipe Background - Watched (Green) */}
            {dragX < 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-end pr-4 bg-green-500"
              >
                <div className="flex items-center gap-2 text-white">
                  <span className="text-sm font-medium">
                    {isWatched ? "Unwatch" : "Watched"}
                  </span>
                  <Eye size={20} />
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Main content - draggable with spring snap */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragStart={handleDragStart}
          onDrag={(_, info) => setDragX(info.offset.x)}
          onDragEnd={handleDragEnd}
          onClick={() => !isDragging && onOpenDetail()}
          whileDrag={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative flex gap-3 p-3 bg-[var(--card-bg)] rounded-xl cursor-pointer"
          style={{ touchAction: "pan-y" }}
        >
          {/* Poster */}
          <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--card-border)]">
            {movie.poster_path ? (
              <Image
                src={getImageUrl(movie.poster_path, "w200") || ""}
                alt={movie.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Film size={20} className="text-[var(--muted)]" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="text-sm font-semibold text-[var(--foreground)] line-clamp-1">{movie.title}</h3>

            {/* Meta info row */}
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-1">
              <span>{movie.release_date?.split("-")[0] || "TBA"}</span>
              <span>•</span>
              <div className="flex items-center gap-0.5">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span>{(movie.vote_average ?? 0).toFixed(1)}</span>
              </div>
            </div>

            {/* Overview - 2 lines */}
            <p className="text-xs text-[var(--muted)] mt-1.5 line-clamp-2 leading-relaxed">
              {movie.overview || "No description available."}
            </p>

            {/* Status Badges */}
            {(isInWatchlist || isWatched || isFavorite) && (
              <div className="flex items-center gap-1 mt-2">
                {isInWatchlist && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-500 rounded font-medium">Watchlist</span>
                )}
                {isWatched && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-500 rounded font-medium">Watched</span>
                )}
                {isFavorite && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-500 rounded font-medium">Favorite</span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons - Visible on desktop, swipe on mobile */}
          <div className="hidden sm:flex flex-col items-center justify-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onAddWatchlist(); }}
              className={`p-2 rounded-lg transition-colors ${isInWatchlist
                ? "bg-yellow-500/20 text-yellow-500"
                : "text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-yellow-500"
                }`}
              title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              <BookmarkPlus size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMarkWatched(); }}
              className={`p-2 rounded-lg transition-colors ${isWatched
                ? "bg-green-500/20 text-green-500"
                : "text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-green-500"
                }`}
              title={isWatched ? "Mark as Unwatched" : "Mark as Watched"}
            >
              <Eye size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className={`p-2 rounded-lg transition-colors ${isFavorite
                ? "bg-red-500/20 text-red-500"
                : "text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-red-500"
                }`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart size={16} className={isFavorite ? "fill-current" : ""} />
            </button>
          </div>

          {/* Favorite button always visible (mobile too) */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`sm:hidden p-2 rounded-lg self-center flex-shrink-0 ${isFavorite
              ? "text-red-500"
              : "text-[var(--muted)]"
              }`}
          >
            <Heart size={18} className={isFavorite ? "fill-current" : ""} />
          </button>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-safe">
      {/* Header - Hidden on Profile */}
      {activeNav !== "profile" && (
        <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--card-border)]/10">
          <div className="max-w-7xl mx-auto px-4">
            {/* Single Row Header */}
            <div className="flex items-center h-14 gap-4">
              {/* Logo */}
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
                className="flex items-center gap-2 hover:opacity-70 transition-opacity flex-shrink-0"
              >
                <Image
                  src="/logo.png"
                  alt="Replay"
                  width={24}
                  height={24}
                  className="invert"
                  priority
                />
                <span className="text-base font-semibold text-[var(--foreground)] hidden sm:block">Replay</span>
              </button>

              {/* Divider */}
              <div className="hidden md:block w-px h-5 bg-[var(--card-border)]/30" />

              {/* Inline Tabs (Home only) */}
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

              {/* Search Bar - Expands with smooth animation */}
              <motion.div
                className="flex-1 max-w-md"
                initial={false}
                animate={{
                  maxWidth: (activeNav === "search" || activeNav === "library") ? "100%" : "20rem"
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="relative group">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--foreground)] transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder={activeNav === "library" ? "Filter library..." : "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      // Only redirect to search if on Home page, not Library
                      if (activeNav === "home") {
                        setActiveNav("search");
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-[var(--card-bg)]/50 border border-transparent rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:bg-[var(--card-bg)] focus:border-[var(--card-border)]/30 transition-all duration-300 ease-out"
                  />
                </div>
              </motion.div>

              {/* Filter Chips */}
              <div className="hidden lg:flex items-center gap-1.5">
                {/* Year */}
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

                {/* Genre */}
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
                    {GENRES.map((genre) => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Language */}
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

                {/* Streaming Services */}
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

                {/* Clear */}
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

                {/* View Toggle */}
                <button
                  onClick={() => setViewMode(prev => prev === "grid" ? "list" : "grid")}
                  className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] rounded-full transition-colors"
                  title={viewMode === "grid" ? "Switch to List View" : "Switch to Grid View"}
                >
                  {viewMode === "grid" ? <List size={14} /> : <LayoutGrid size={14} />}
                </button>
              </div>

              {/* Library Button */}
              <button
                onClick={() => setActiveNav("library")}
                className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ${activeNav === "library"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-[var(--foreground)]"
                  }`}
              >
                <Bookmark size={16} className={activeNav === "library" ? "fill-current" : ""} />
              </button>
            </div>

            {/* Mobile Tabs Row */}
            {activeNav === "home" && (
              <div className="flex md:hidden items-center gap-2 py-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
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
                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 ${activeTab === tab.key && !activeGenre && !activeYear && !activeLanguage
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--card-bg)]/60 text-[var(--muted)]"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
                {/* Mobile Filter Button */}
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--card-bg)]/60 text-[var(--muted)] whitespace-nowrap">
                  <Filter size={12} />
                  Filters
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Mobile Search (when search nav active) - Also hidden on Profile */}
      {activeNav !== "profile" && activeNav === "search" && (
        <div className="md:hidden sticky top-14 z-30 bg-[var(--background)] px-4 py-3 border-b border-[var(--card-border)]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Home / Search Tab - Movie Grid */}
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
                {/* Load More Trigger */}
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
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Your Library</h2>

            {/* Library Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {libraryTabs.map((tab) => {
                const Icon = tab.icon;
                // Get movies for this tab
                const tabMovies = tab.key === "watchlist"
                  ? movies.filter(m => watchlist.includes(m.id))
                  : tab.key === "watched"
                    ? movies.filter(m => watched.includes(m.id))
                    : movies.filter(m => favorites.includes(m.id));
                // Filtered count (what's displayed)
                const filteredCount = applyFilters(tabMovies).length;
                // Total loaded count
                const loadedCount = tabMovies.length;
                // Total saved count
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

            {/* Nudge: Has watchlist but no watched */}
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

            {/* Watchlist Tab Content */}
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
                    renderMovieList(applyFilters(movies.filter(m => watchlist.includes(m.id))), false)
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                      {applyFilters(movies.filter(m => watchlist.includes(m.id))).map((movie, index) => (
                        <motion.div
                          key={`${movie.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(index, 12) * 0.02, ease: [0.25, 0.46, 0.45, 0.94] }}
                          onClick={() => openMovieDetail(movie.id)}
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
                      {movies.filter(m => watchlist.includes(m.id)).length === 0 && watchlist.length > 0 && (
                        <div className="col-span-full text-center py-10 text-[var(--muted)]">
                          <p>Loading your watchlist...</p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </>
            )}

            {/* Watched Tab Content */}
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
                    renderMovieList(applyFilters(movies.filter(m => watched.includes(m.id))), false)
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                      {applyFilters(movies.filter(m => watched.includes(m.id))).map((movie, index) => (
                        <motion.div
                          key={`${movie.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(index, 12) * 0.02, ease: [0.25, 0.46, 0.45, 0.94] }}
                          onClick={() => openMovieDetail(movie.id)}
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

            {/* Favorites Tab Content */}
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
                    renderMovieList(applyFilters(movies.filter(m => favorites.includes(m.id))), false)
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                      {applyFilters(movies.filter(m => favorites.includes(m.id))).map((movie, index) => (
                        <motion.div
                          key={`${movie.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(index, 12) * 0.02, ease: [0.25, 0.46, 0.45, 0.94] }}
                          onClick={() => openMovieDetail(movie.id)}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center justify-center min-h-[60vh] py-8"
          >
            {/* Logo with Glow Effect - Same as Header */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative mb-8"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-orange-500/30 rounded-full scale-150" />

              {/* Logo Container */}
              <div className="relative w-28 h-28 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Replay"
                  width={64}
                  height={64}
                  className="invert"
                  priority
                />
              </div>
            </motion.div>

            {/* App Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">Replay</h2>
              <p className="text-sm text-[var(--muted)] tracking-wide">Discover. Watch. Remember.</p>
            </motion.div>

            {/* Stats Cards - Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8"
            >
              <button
                onClick={() => { setActiveNav("library"); setActiveLibraryTab("watchlist"); }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-4 text-center hover:border-amber-500/40 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <BookmarkPlus size={20} className="mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold text-[var(--foreground)]">{watchlist.length}</p>
                <p className="text-xs text-[var(--muted)]">Watchlist</p>
              </button>

              <button
                onClick={() => { setActiveNav("library"); setActiveLibraryTab("watched"); }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-4 text-center hover:border-green-500/40 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Eye size={20} className="mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-[var(--foreground)]">{watched.length}</p>
                <p className="text-xs text-[var(--muted)]">Watched</p>
              </button>

              <button
                onClick={() => { setActiveNav("library"); setActiveLibraryTab("favorites"); }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-4 text-center hover:border-red-500/40 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Heart size={20} className="mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold text-[var(--foreground)]">{favorites.length}</p>
                <p className="text-xs text-[var(--muted)]">Favorites</p>
              </button>
            </motion.div>

            {/* Explore Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-sm"
            >
              <button
                onClick={() => setActiveNav("home")}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-[var(--foreground)] to-[var(--muted)] text-[var(--background)] font-semibold rounded-2xl hover:opacity-90 transition-opacity"
              >
                <Sparkles size={18} />
                Explore Movies
              </button>
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-xs text-[var(--muted)]"
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
              ) : selectedMovie ? (
                <>
                  {/* Backdrop Image */}
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

                    {/* Close Button */}
                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X size={20} className="text-white" />
                    </button>

                    {/* Back Button (mobile) */}
                    <button
                      onClick={closeModal}
                      className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors md:hidden"
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-5 pb-8 -mt-16 relative overflow-y-auto max-h-[calc(90vh-12rem)]">
                    <div className="flex gap-4 mb-4">
                      {/* Poster */}
                      <div className="relative w-24 h-36 rounded-xl overflow-hidden shadow-xl flex-shrink-0 bg-[var(--card-border)]">
                        <Image
                          src={getImageUrl(selectedMovie.poster_path, "w300") || ""}
                          alt={selectedMovie.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Title & Meta */}
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

                    {/* Genres */}
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

                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-6">
                      {/* Add to Watchlist */}
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
                      {/* Mark as Watched */}
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
                      {/* Add to Favorites */}
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

                    {/* Overview */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-[var(--foreground)] mb-2">Overview</h3>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">
                        {selectedMovie.overview || "No overview available."}
                      </p>
                    </div>

                    {/* Watch Providers / Streaming */}
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

                    {/* Cast */}
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
                              <p className="text-xs font-medium text-[var(--foreground)] truncate">{person.name}</p>
                              <p className="text-xs text-[var(--muted)] truncate">{person.character}</p>
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

      {/* Add to Favorites Dialog */}
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
              transition={{ ease: [0.25, 0.46, 0.45, 0.94] }}
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
                setActiveNav(item.key);
                if (item.key === "home") {
                  setSearchQuery("");
                }
              }}
              className="relative flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-colors duration-200"
              whileTap={{ scale: 0.95 }}
            >
              {/* Active Background Indicator */}
              {activeNav === item.key && (
                <motion.div
                  layoutId="activeNavBg"
                  className="absolute inset-0 bg-[var(--foreground)] rounded-xl"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}

              {/* Icon and Label */}
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
