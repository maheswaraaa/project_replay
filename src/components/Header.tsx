"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    Bookmark, Filter, List, LayoutGrid, X, ChevronDown,
} from "lucide-react";
import { GENRES, TV_GENRES, LANGUAGES, WATCH_PROVIDERS } from "@/lib/tmdb";
import SearchBar from "./SearchBar";
import MediaTypeToggle from "./MediaTypeToggle";
import FilterDropdown from "./FilterDropdown";
import type { Tab, NavItem, MediaTypeFilter, ViewMode } from "@/types";
import { TABS } from "@/types";

interface HeaderProps {
    activeNav: NavItem;
    activeTab: Tab;
    activeMediaType: MediaTypeFilter;
    activeGenre: number | null;
    activeYear: number | null;
    activeLanguage: string | null;
    activeProvider: string | null;
    searchQuery: string;
    viewMode: ViewMode;
    setActiveNav: (nav: NavItem) => void;
    setActiveTab: (tab: Tab) => void;
    setActiveMediaType: (type: MediaTypeFilter) => void;
    setActiveGenre: (genre: number | null) => void;
    setActiveYear: (year: number | null) => void;
    setActiveLanguage: (lang: string | null) => void;
    setActiveProvider: (provider: string | null) => void;
    setActiveSortBy: (sort: string) => void;
    setSearchQuery: (query: string) => void;
    setViewMode: (mode: ViewMode | ((prev: ViewMode) => ViewMode)) => void;
    setShowMobileFilters: (show: boolean) => void;
    resetToDefaults: () => void;
}

export default function Header({
    activeNav,
    activeTab,
    activeMediaType,
    activeGenre,
    activeYear,
    activeLanguage,
    activeProvider,
    searchQuery,
    viewMode,
    setActiveNav,
    setActiveTab,
    setActiveMediaType,
    setActiveGenre,
    setActiveYear,
    setActiveLanguage,
    setActiveProvider,
    setActiveSortBy,
    setSearchQuery,
    setViewMode,
    setShowMobileFilters,
    resetToDefaults,
}: HeaderProps) {
    const hasFilters = !!(activeGenre || activeYear || activeLanguage || activeProvider);
    const filterCount = [activeGenre, activeYear, activeLanguage, activeProvider].filter(Boolean).length;

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setActiveGenre(null);
        setActiveYear(null);
        setActiveLanguage(null);
        setActiveSortBy("popularity.desc");
        setActiveProvider(null);
    };

    const handleLogoClick = () => {
        setActiveNav("home");
        resetToDefaults();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const clearFilters = () => {
        setActiveGenre(null);
        setActiveYear(null);
        setActiveLanguage(null);
        setActiveProvider(null);
    };

    const yearOptions = Array.from({ length: 35 }, (_, i) => ({
        value: String(2025 - i),
        label: String(2025 - i),
    }));

    const genreOptions = (activeMediaType === "tv" ? TV_GENRES : GENRES).map((g) => ({
        value: String(g.id),
        label: g.name,
    }));

    const languageOptions = LANGUAGES.map((l) => ({ value: l.code, label: l.name }));
    const providerOptions = WATCH_PROVIDERS.map((p) => ({ value: String(p.id), label: p.name }));

    return (
        <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--card-border)]/10 header-safe">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center h-14 gap-4">
                    {/* Logo */}
                    <button
                        onClick={handleLogoClick}
                        className="flex items-center gap-1.5 hover:opacity-70 transition-opacity flex-shrink-0"
                    >
                        <Image src="/logo.png" alt="Replay" width={24} height={24} className="invert" priority />
                        <span className="text-sm font-bold text-[var(--foreground)]">Replay</span>
                        <span className="text-[10px] text-[var(--muted)]">— Discover. Watch. Remember.</span>
                    </button>

                    <div className="hidden md:block w-px h-5 bg-[var(--card-border)]/30" />

                    {/* Desktop tabs */}
                    {activeNav === "home" && (
                        <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${activeTab === tab.key && !hasFilters
                                        ? "bg-[var(--foreground)] text-[var(--background)]"
                                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    )}

                    {/* Desktop search bars */}
                    {(activeNav === "library" || activeNav === "search") && (
                        <motion.div
                            className={`hidden lg:block flex-1 ${activeNav === "search" ? "max-w-xl" : "max-w-md"}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder={activeNav === "search" ? "Search movies & TV shows..." : "Filter library..."}
                            />
                        </motion.div>
                    )}

                    {activeNav !== "library" && activeNav !== "search" && <div className="flex-1" />}

                    {/* Desktop filters */}
                    <div className="hidden lg:flex items-center gap-1.5">
                        <MediaTypeToggle
                            value={activeMediaType}
                            onChange={(type) => {
                                setActiveMediaType(type);
                                setActiveGenre(null);
                            }}
                        />

                        <FilterDropdown
                            value={String(activeYear || "")}
                            onChange={(v) => setActiveYear(v ? parseInt(v) : null)}
                            placeholder="Year"
                            options={yearOptions}
                            isActive={!!activeYear}
                        />

                        <FilterDropdown
                            value={String(activeGenre || "")}
                            onChange={(v) => setActiveGenre(v ? parseInt(v) : null)}
                            placeholder="Genre"
                            options={genreOptions}
                            isActive={!!activeGenre}
                        />

                        <FilterDropdown
                            value={activeLanguage || ""}
                            onChange={(v) => setActiveLanguage(v || null)}
                            placeholder="Language"
                            options={languageOptions}
                            isActive={!!activeLanguage}
                        />

                        <FilterDropdown
                            value={activeProvider || ""}
                            onChange={(v) => setActiveProvider(v || null)}
                            placeholder="All Services"
                            options={providerOptions}
                            isActive={!!activeProvider}
                        />

                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] rounded-full transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}

                        <button
                            onClick={() => setViewMode((prev) => (prev === "grid" ? "list" : "grid"))}
                            className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] rounded-full transition-colors"
                            title={viewMode === "grid" ? "Switch to List View" : "Switch to Grid View"}
                        >
                            {viewMode === "grid" ? <List size={14} /> : <LayoutGrid size={14} />}
                        </button>
                    </div>

                    {/* Desktop library button */}
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

                {/* Mobile controls for Home */}
                {activeNav === "home" && (
                    <div className="flex md:hidden flex-col gap-2 py-2">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <select
                                    value={activeTab}
                                    onChange={(e) => handleTabChange(e.target.value as Tab)}
                                    className="w-full appearance-none px-3 py-2 pr-8 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-xl cursor-pointer focus:outline-none"
                                >
                                    {TABS.map((tab) => (
                                        <option key={tab.key} value={tab.key}>{tab.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--background)]" />
                            </div>

                            <MediaTypeToggle
                                value={activeMediaType}
                                onChange={(type) => {
                                    setActiveMediaType(type);
                                    setActiveGenre(null);
                                }}
                                size="md"
                            />

                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl shrink-0 transition-all duration-200 ${hasFilters
                                    ? "bg-[var(--foreground)] text-[var(--background)]"
                                    : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--muted)]"
                                    }`}
                            >
                                <Filter size={14} />
                                {hasFilters && (
                                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--background)]/20 font-bold">
                                        {filterCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setViewMode((prev) => (prev === "grid" ? "list" : "grid"))}
                                className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl transition-colors shrink-0"
                            >
                                {viewMode === "grid" ? <List size={14} /> : <LayoutGrid size={14} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}