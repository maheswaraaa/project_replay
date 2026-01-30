import { motion } from "framer-motion";
import Image from "next/image";
import {
    Home,
    Search,
    Bookmark,
    User,
    Filter,
} from "lucide-react";
import { NavItem, Tab } from "@/types";
import FilterBar from "./FilterBar";

interface NavbarProps {
    activeNav: NavItem;
    setActiveNav: (nav: NavItem) => void;
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    activeYear: number | null;
    setActiveYear: (year: number | null) => void;
    activeGenre: number | null;
    setActiveGenre: (genre: number | null) => void;
    activeLanguage: string | null;
    setActiveLanguage: (lang: string | null) => void;
    activeSortBy: string;
    setActiveSortBy: (sort: string) => void;
    activeProvider: string | null;
    setActiveProvider: (provider: string | null) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    viewMode: "grid" | "list";
    setViewMode: React.Dispatch<React.SetStateAction<"grid" | "list">>;
    onLogoClick: () => void;
}

export default function Navbar({
    activeNav,
    setActiveNav,
    activeTab,
    setActiveTab,
    activeYear,
    setActiveYear,
    activeGenre,
    setActiveGenre,
    activeLanguage,
    setActiveLanguage,
    activeSortBy,
    setActiveSortBy,
    activeProvider,
    setActiveProvider,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    onLogoClick,
}: NavbarProps) {
    const tabs: { key: Tab; label: string }[] = [
        { key: "trending", label: "Trending" },
        { key: "popular", label: "Popular" },
        { key: "top_rated", label: "Top Rated" },
        { key: "now_playing", label: "Now Playing" },
    ];

    return (
        <>
            {activeNav !== "profile" && (
                <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--card-border)]/10">
                    <div className="max-w-7xl mx-auto px-4">
                        {/* Single Row Header */}
                        <div className="flex items-center h-14 gap-4">
                            {/* Logo */}
                            <button
                                onClick={onLogoClick}
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
                            <FilterBar
                                activeYear={activeYear}
                                setActiveYear={setActiveYear}
                                activeGenre={activeGenre}
                                setActiveGenre={setActiveGenre}
                                activeLanguage={activeLanguage}
                                setActiveLanguage={setActiveLanguage}
                                activeProvider={activeProvider}
                                setActiveProvider={setActiveProvider}
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                            />

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
        </>
    );
}
