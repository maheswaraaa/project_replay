import { ChevronDown, X, List, LayoutGrid } from "lucide-react";
import { GENRES, LANGUAGES, WATCH_PROVIDERS } from "@/lib/tmdb";

interface FilterBarProps {
    activeYear: number | null;
    setActiveYear: (year: number | null) => void;
    activeGenre: number | null;
    setActiveGenre: (genre: number | null) => void;
    activeLanguage: string | null;
    setActiveLanguage: (lang: string | null) => void;
    activeProvider: string | null;
    setActiveProvider: (provider: string | null) => void;
    viewMode: "grid" | "list";
    setViewMode: React.Dispatch<React.SetStateAction<"grid" | "list">>;
}

export default function FilterBar({
    activeYear,
    setActiveYear,
    activeGenre,
    setActiveGenre,
    activeLanguage,
    setActiveLanguage,
    activeProvider,
    setActiveProvider,
    viewMode,
    setViewMode,
}: FilterBarProps) {
    return (
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
    );
}
