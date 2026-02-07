"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  getMovieDetails, getTVShowDetails,
  type Movie,
} from "@/lib/tmdb";
import { useFilters, useLibrary, useMediaDetail } from "@/hooks";
import { useMediaContent } from "@/hooks/useMediaContent";
import type { NavItem, LibraryTab } from "@/types";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MobileSearchBar from "@/components/MobileSearchBar";
import MediaGrid from "@/components/MediaGrid";
import MediaDetailModal from "@/components/MediaDetailModal";
import FavoritePrompt from "@/components/FavoritePrompt";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import LibraryView from "@/components/LibraryView";
import ProfileView from "@/components/ProfileView";
import EmptyState from "@/components/EmptyState";

export default function HomePage() {
  const {
    activeTab, setActiveTab,
    activeGenre, setActiveGenre,
    activeYear, setActiveYear,
    activeLanguage, setActiveLanguage,
    activeSortBy, setActiveSortBy,
    activeProvider, setActiveProvider,
    activeMediaType, setActiveMediaType,
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
    resetToDefaults,
  } = useFilters();

  const [activeNav, setActiveNav] = useState<NavItem>("home");
  const [activeLibraryTab, setActiveLibraryTab] = useState<LibraryTab>("watchlist");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [libraryMovies, setLibraryMovies] = useState<Movie[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const { movies, loading, loadingMore, loadMoreRef } = useMediaContent({
    activeTab,
    activeGenre,
    activeYear,
    activeLanguage,
    activeSortBy,
    activeProvider,
    activeMediaType,
    searchQuery,
    activeNav,
  });

  const {
    selectedMovie, selectedTVShow,
    movieCast, movieWatchProviders,
    showModal, loadingModal,
    openMovieDetail, openTVDetail, closeModal,
  } = useMediaDetail();

  const {
    watchlist, watched, favorites,
    toggleWatchlist, markAsWatched, toggleFavorite,
    showFavoritePrompt, handleFavoritePrompt,
  } = useLibrary();

  // Load library content
  useEffect(() => {
    if (activeNav !== "library") return;
    const allIds = [...new Set([...watchlist, ...watched, ...favorites])];
    if (allIds.length === 0) {
      setLibraryMovies([]);
      return;
    }

    setLibraryLoading(true);

    Promise.all(
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
              media_type: "tv",
            } as unknown as Movie;
          } catch {
            return null;
          }
        }
      })
    ).then((items) => {
      setLibraryMovies(items.filter(Boolean) as Movie[]);
      setLibraryLoading(false);
    });
  }, [activeNav, watchlist, watched, favorites]);

  const openDetail = useCallback(
    (item: Movie) => {
      if (!item || typeof item.id !== "number") return;
      const mt = (item as unknown as { media_type?: string }).media_type;
      const isTV = mt === "tv" || (mt === undefined && activeMediaType === "tv");
      isTV ? openTVDetail(item.id) : openMovieDetail(item.id);
    },
    [activeMediaType, openTVDetail, openMovieDetail]
  );

  const handleNavChange = (nav: NavItem) => {
    const prevNav = activeNav;
    setActiveNav(nav);
    if (nav !== prevNav) {
      setSearchQuery("");
      setActiveGenre(null);
      setActiveYear(null);
      setActiveLanguage(null);
      setActiveProvider(null);
      setActiveSortBy("popularity.desc");
    }
  };

  const handleProfileNavigate = (nav: NavItem, tab?: LibraryTab) => {
    setActiveNav(nav);
    if (tab) setActiveLibraryTab(tab);
  };

  const hasFilters = !!(activeGenre || activeYear || activeLanguage || activeProvider);
  const filterCount = [activeGenre, activeYear, activeLanguage, activeProvider].filter(Boolean).length;
  const currentMediaId = selectedTVShow?.id ?? selectedMovie?.id ?? 0;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-safe">
      {activeNav !== "profile" && (
        <Header
          activeNav={activeNav}
          activeTab={activeTab}
          activeMediaType={activeMediaType}
          activeGenre={activeGenre}
          activeYear={activeYear}
          activeLanguage={activeLanguage}
          activeProvider={activeProvider}
          searchQuery={searchQuery}
          viewMode={viewMode}
          setActiveNav={setActiveNav}
          setActiveTab={setActiveTab}
          setActiveMediaType={setActiveMediaType}
          setActiveGenre={setActiveGenre}
          setActiveYear={setActiveYear}
          setActiveLanguage={setActiveLanguage}
          setActiveProvider={setActiveProvider}
          setActiveSortBy={setActiveSortBy}
          setSearchQuery={setSearchQuery}
          setViewMode={setViewMode}
          setShowMobileFilters={setShowMobileFilters}
          resetToDefaults={resetToDefaults}
        />
      )}

      {activeNav === "search" && (
        <MobileSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeMediaType={activeMediaType}
          setActiveMediaType={setActiveMediaType}
          setActiveGenre={setActiveGenre}
          viewMode={viewMode}
          setViewMode={setViewMode}
          hasFilters={hasFilters}
          filterCount={filterCount}
          onOpenFilters={() => setShowMobileFilters(true)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {(activeNav === "home" || activeNav === "search") && (
          <>
            {activeNav === "search" && !searchQuery ? (
              <EmptyState
                icon={Search}
                title="Search for movies"
                description="Type to start searching"
              />
            ) : (
              <>
                <MediaGrid
                  movies={movies}
                  loading={loading}
                  viewMode={viewMode}
                  watchlist={watchlist}
                  watched={watched}
                  favorites={favorites}
                  onOpenDetail={openDetail}
                  onToggleWatchlist={toggleWatchlist}
                  onMarkWatched={markAsWatched}
                  onToggleFavorite={toggleFavorite}
                />
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {loadingMore && <Loader2 size={24} className="text-[var(--muted)] animate-spin" />}
                </div>
              </>
            )}
          </>
        )}

        {activeNav === "library" && (
          <LibraryView
            activeTab={activeLibraryTab}
            setActiveTab={setActiveLibraryTab}
            activeMediaType={activeMediaType}
            setActiveMediaType={setActiveMediaType}
            viewMode={viewMode}
            libraryMovies={libraryMovies}
            libraryLoading={libraryLoading}
            watchlist={watchlist}
            watched={watched}
            favorites={favorites}
            searchQuery={searchQuery}
            activeGenre={activeGenre}
            activeYear={activeYear}
            activeLanguage={activeLanguage}
            onOpenDetail={openDetail}
            onToggleWatchlist={toggleWatchlist}
            onMarkWatched={markAsWatched}
            onToggleFavorite={toggleFavorite}
            onNavigateHome={() => setActiveNav("home")}
          />
        )}

        {activeNav === "profile" && (
          <ProfileView
            watchlistCount={watchlist.length}
            watchedCount={watched.length}
            favoritesCount={favorites.length}
            onNavigate={handleProfileNavigate}
          />
        )}
      </main>

      <MediaDetailModal
        show={showModal}
        loading={loadingModal}
        movie={selectedMovie}
        tvShow={selectedTVShow}
        cast={movieCast}
        watchProviders={movieWatchProviders}
        isInWatchlist={watchlist.includes(currentMediaId)}
        isWatched={watched.includes(currentMediaId)}
        isFavorite={favorites.includes(currentMediaId)}
        onClose={closeModal}
        onToggleWatchlist={toggleWatchlist}
        onMarkWatched={markAsWatched}
        onToggleFavorite={toggleFavorite}
      />

      <FavoritePrompt show={showFavoritePrompt} onRespond={handleFavoritePrompt} />

      <MobileFilterSheet
        show={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        activeYear={activeYear}
        setActiveYear={setActiveYear}
        activeGenre={activeGenre}
        setActiveGenre={setActiveGenre}
        activeLanguage={activeLanguage}
        setActiveLanguage={setActiveLanguage}
        activeProvider={activeProvider}
        setActiveProvider={setActiveProvider}
        activeMediaType={activeMediaType}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <BottomNav activeNav={activeNav} onChange={handleNavChange} />
    </div>
  );
}