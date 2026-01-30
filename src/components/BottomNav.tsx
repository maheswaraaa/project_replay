import { Home, Search, Bookmark, User } from "lucide-react";
import { NavItem } from "@/types";

interface BottomNavProps {
    activeNav: NavItem;
    setActiveNav: (nav: NavItem) => void;
}

export default function BottomNav({ activeNav, setActiveNav }: BottomNavProps) {
    const navItems: { key: NavItem; icon: typeof Home; label: string }[] = [
        { key: "home", icon: Home, label: "Home" },
        { key: "search", icon: Search, label: "Search" },
        { key: "library", icon: Bookmark, label: "Library" },
        { key: "profile", icon: User, label: "Profile" },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--background)] border-t border-[var(--card-border)]/50 pb-safe z-50">
            <div className="grid grid-cols-4 h-full">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.key;
                    return (
                        <button
                            key={item.key}
                            onClick={() => setActiveNav(item.key)}
                            className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                        >
                            <div
                                className={`p-1.5 rounded-xl transition-colors ${isActive
                                    ? "bg-[var(--foreground)] text-[var(--background)]"
                                    : "text-[var(--muted)]"
                                    }`}
                            >
                                <Icon size={20} className={isActive ? "fill-current" : ""} />
                            </div>
                            <span
                                className={`text-[10px] font-medium transition-colors ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                                    }`}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
