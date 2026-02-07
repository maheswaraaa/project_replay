import type { LucideIcon } from "lucide-react";

// Existing types
export type Tab = "trending" | "popular" | "top_rated" | "now_playing";
export type NavItem = "home" | "search" | "library" | "profile";
export type LibraryTab = "watchlist" | "watched" | "favorites";

// New types
export type ViewMode = "grid" | "list";
export type MediaTypeFilter = "movie" | "tv" | "all";

export interface TabConfig {
    key: Tab;
    label: string;
}

export interface NavItemConfig {
    key: NavItem;
    icon: LucideIcon;
    label: string;
}

// Constants
export const TABS: TabConfig[] = [
    { key: "trending", label: "Trending" },
    { key: "popular", label: "Popular" },
    { key: "top_rated", label: "Top Rated" },
    { key: "now_playing", label: "Now Playing" },
];

export const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;