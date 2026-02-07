"use client";

import { AnimatePresence, motion, useDragControls, PanInfo, Variants } from "framer-motion";
import { X, LayoutGrid, List } from "lucide-react";
import { GENRES, TV_GENRES, LANGUAGES, WATCH_PROVIDERS } from "@/lib/tmdb";
import type { ViewMode, MediaTypeFilter } from "@/types";
import { useCallback } from "react";

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

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: {
        y: 0,
        transition: {
            type: "spring",
            damping: 30,
            stiffness: 300,
            mass: 0.8,
        },
    },
    exit: {
        y: "100%",
        transition: {
            type: "spring",
            damping: 30,
            stiffness: 300,
        },
    },
};

const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.1,
            staggerChildren: 0.05,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

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
    const dragControls = useDragControls();

    const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.velocity.y > 500 || info.offset.y > 150) {
            onClose();
        }
    }, [onClose]);

    const selectClasses =
        "w-full p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all duration-200";

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
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 lg:hidden"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        drag="y"
                        dragControls={dragControls}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-0 left-0 right-0 bg-[var(--card-bg)] border-t border-[var(--card-border)] rounded-t-3xl max-h-[80vh] overflow-y-auto touch-none"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[var(--card-bg)] pt-3 pb-2 px-4 border-b border-[var(--card-border)]/30">
                            <div
                                className="flex justify-center cursor-grab active:cursor-grabbing"
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <motion.div
                                    className="w-12 h-1.5 bg-[var(--muted)]/30 rounded-full mb-3"
                                    whileHover={{ scaleX: 1.2, backgroundColor: "var(--muted)" }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[var(--foreground)]">Filters</h3>
                                <motion.button
                                    onClick={onClose}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--card-border)]/50 transition-colors"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Filters */}
                        <motion.div
                            className="p-4 space-y-5"
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Year</label>
                                <select
                                    value={activeYear || ""}
                                    onChange={(e) => setActiveYear(e.target.value ? parseInt(e.target.value) : null)}
                                    className={selectClasses}
                                >
                                    <option value="">All Years</option>
                                    {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </motion.div>

                            <motion.div variants={itemVariants}>
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
                            </motion.div>

                            <motion.div variants={itemVariants}>
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
                            </motion.div>

                            <motion.div variants={itemVariants}>
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
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">View Mode</label>
                                <div className="flex gap-2">
                                    {(["grid", "list"] as const).map((mode) => (
                                        <motion.button
                                            key={mode}
                                            onClick={() => setViewMode(mode)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${viewMode === mode
                                                ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                                                : "bg-[var(--background)] text-[var(--muted)] border-[var(--card-border)] hover:border-[var(--foreground)]/30"
                                                }`}
                                        >
                                            {mode === "grid" ? <LayoutGrid size={18} /> : <List size={18} />}
                                            {mode === "grid" ? "Grid" : "List"}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Footer */}
                        <motion.div
                            className="sticky bottom-0 p-4 bg-[var(--card-bg)] border-t border-[var(--card-border)]/30 flex gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <motion.button
                                onClick={clearAll}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 py-3 px-4 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-border)] transition-colors"
                            >
                                Clear All
                            </motion.button>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 py-3 px-4 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Apply Filters
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}