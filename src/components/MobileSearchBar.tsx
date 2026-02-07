"use client";

import { Filter, List, LayoutGrid } from "lucide-react";
import SearchBar from "./SearchBar";
import MediaTypeToggle from "./MediaTypeToggle";
import type { MediaTypeFilter, ViewMode } from "@/types";

interface MobileSearchBarProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    activeMediaType: MediaTypeFilter;
    setActiveMediaType: (type: MediaTypeFilter) => void;
    setActiveGenre: (genre: number | null) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode | ((prev: ViewMode) => ViewMode)) => void;
    hasFilters: boolean;
    filterCount: number;
    onOpenFilters: () => void;
}

export default function MobileSearchBar({
    searchQuery,
    setSearchQuery,
    activeMediaType,
    setActiveMediaType,
    setActiveGenre,
    viewMode,
    setViewMode,
    hasFilters,
    filterCount,
    onOpenFilters,
}: MobileSearchBarProps) {
    return (
        <div className="lg:hidden sticky top-14 z-30 bg-[var(--background)] px-4 py-3 border-b border-[var(--card-border)]">
            <div className="mb-2">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search movies & TV shows..."
                    size="lg"
                    autoFocus
                />
            </div>
            <div className="flex items-center gap-2">
                <MediaTypeToggle
                    value={activeMediaType}
                    onChange={(type) => {
                        setActiveMediaType(type);
                        setActiveGenre(null);
                    }}
                    size="md"
                />

                <button
                    onClick={onOpenFilters}
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
    );
}