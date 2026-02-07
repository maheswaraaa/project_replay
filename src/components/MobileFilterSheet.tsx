"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, LayoutGrid, List } from "lucide-react";
import { GENRES, TV_GENRES, LANGUAGES, WATCH_PROVIDERS } from "@/lib/tmdb";
import type { ViewMode, MediaTypeFilter } from "@/types";

interface MobileFilterSheetProps {
    show: boolean;
    onClose: () => void;
    activeYear: number | null;
    setActiveYear: (year: number | null) => void;
    activeGenre: number | null;
    setActiveGenre: (genre: number | null) => void;
    activeLanguage: string | null;
    setActiveLanguage: (lang: string | null) => void;
    activeProvider: string | null;
    setActiveProvider: (provider: string | null) => void;
    activeMediaType: MediaTypeFilter;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

export default function MobileFilterSheet({
    show,
    onClose,
    activeYear,
    setActiveYear,
    activeGenre,
    setActiveGenre,
    activeLanguage,
    setActiveLanguage,
    activeProvider,
    setActiveProvider,
    activeMediaType,
    viewMode,
    setViewMode,
}: MobileFilterSheetProps) {
    const selectClasses =
        "w-full p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20";

    const clearAll = () => {
        setActiveGenre(null);
        setActiveYear(null);
        setActiveLanguage(null);
        setActiveProvider(null);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 lg:hidden"
                    onClick={onClose}
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
                        {/* Header */}
                        <div className="sticky top-0 bg-[var(--card-bg)] pt-3 pb-2 px-4 border-b border-[var(--card-border)]/30">
                            <div className="w-12 h-1.5 bg-[var(--muted)]/30 rounded-full mx-auto mb-3" />
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[var(--foreground)]">Filters</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--card-border)]/50 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="p-4 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Year</label>
                                <select
                                    value={activeYear || ""}
                                    onChange={(e) => setActiveYear(e.target.value ? parseInt(e.target.value) : null)}
                                    className={selectClasses}
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
                                    className={selectClasses}
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
                                    className={selectClasses}
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
                                    className={selectClasses}
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
                                    {(["grid", "list"] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setViewMode(mode)}
                                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${viewMode === mode
                                                    ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                                                    : "bg-[var(--background)] text-[var(--muted)] border-[var(--card-border)] hover:border-[var(--foreground)]/30"
                                                }`}
                                        >
                                            {mode === "grid" ? <LayoutGrid size={18} /> : <List size={18} />}
                                            {mode === "grid" ? "Grid" : "List"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 p-4 bg-[var(--card-bg)] border-t border-[var(--card-border)]/30 flex gap-3">
                            <button
                                onClick={clearAll}
                                className="flex-1 py-3 px-4 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-border)] transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}