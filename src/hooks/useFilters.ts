"use client";

import { useState, useCallback } from "react";
import { MediaType } from "@/lib/tmdb";

export type Tab = "trending" | "popular" | "top_rated" | "now_playing";
export type NavItem = "home" | "search" | "library" | "profile";
export type ViewMode = "grid" | "list";

export interface FilterState {
    activeTab: Tab;
    activeGenre: number | null;
    activeYear: number | null;
    activeLanguage: string | null;
    activeSortBy: string;
    activeProvider: string | null;
    activeMediaType: MediaType;
    searchQuery: string;
    viewMode: ViewMode;
}

export interface UseFiltersReturn extends FilterState {
    setActiveTab: (tab: Tab) => void;
    setActiveGenre: (genre: number | null) => void;
    setActiveYear: (year: number | null) => void;
    setActiveLanguage: (language: string | null) => void;
    setActiveSortBy: (sortBy: string) => void;
    setActiveProvider: (provider: string | null) => void;
    setActiveMediaType: (mediaType: MediaType) => void;
    setSearchQuery: (query: string) => void;
    setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
    clearFilters: () => void;
    resetToDefaults: () => void;
    hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: FilterState = {
    activeTab: "trending",
    activeGenre: null,
    activeYear: null,
    activeLanguage: null,
    activeSortBy: "popularity.desc",
    activeProvider: null,
    activeMediaType: "movie",
    searchQuery: "",
    viewMode: "grid",
};

export function useFilters(): UseFiltersReturn {
    const [activeTab, setActiveTab] = useState<Tab>(DEFAULT_FILTERS.activeTab);
    const [activeGenre, setActiveGenre] = useState<number | null>(DEFAULT_FILTERS.activeGenre);
    const [activeYear, setActiveYear] = useState<number | null>(DEFAULT_FILTERS.activeYear);
    const [activeLanguage, setActiveLanguage] = useState<string | null>(DEFAULT_FILTERS.activeLanguage);
    const [activeSortBy, setActiveSortBy] = useState<string>(DEFAULT_FILTERS.activeSortBy);
    const [activeProvider, setActiveProvider] = useState<string | null>(DEFAULT_FILTERS.activeProvider);
    const [activeMediaType, setActiveMediaType] = useState<MediaType>(DEFAULT_FILTERS.activeMediaType);
    const [searchQuery, setSearchQuery] = useState<string>(DEFAULT_FILTERS.searchQuery);
    const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_FILTERS.viewMode);

    const hasActiveFilters = !!(activeGenre || activeYear || activeLanguage || activeProvider);

    const clearFilters = useCallback(() => {
        setActiveGenre(null);
        setActiveYear(null);
        setActiveLanguage(null);
        setActiveProvider(null);
    }, []);

    const resetToDefaults = useCallback(() => {
        setActiveTab(DEFAULT_FILTERS.activeTab);
        setActiveGenre(DEFAULT_FILTERS.activeGenre);
        setActiveYear(DEFAULT_FILTERS.activeYear);
        setActiveLanguage(DEFAULT_FILTERS.activeLanguage);
        setActiveSortBy(DEFAULT_FILTERS.activeSortBy);
        setActiveProvider(DEFAULT_FILTERS.activeProvider);
        setSearchQuery(DEFAULT_FILTERS.searchQuery);
    }, []);

    return {
        // State
        activeTab,
        activeGenre,
        activeYear,
        activeLanguage,
        activeSortBy,
        activeProvider,
        activeMediaType,
        searchQuery,
        viewMode,
        // Setters
        setActiveTab,
        setActiveGenre,
        setActiveYear,
        setActiveLanguage,
        setActiveSortBy,
        setActiveProvider,
        setActiveMediaType,
        setSearchQuery,
        setViewMode,
        // Actions
        clearFilters,
        resetToDefaults,
        hasActiveFilters,
    };
}
