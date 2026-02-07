import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    size?: "sm" | "lg";
    autoFocus?: boolean;
}

export default function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    size = "sm",
    autoFocus = false,
}: SearchBarProps) {
    const iconSize = size === "sm" ? 14 : 18;

    return (
        <div className="relative group">
            <Search
                size={iconSize}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--foreground)] transition-colors duration-200"
            />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoFocus={autoFocus}
                className={`w-full pr-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none transition-all duration-300 ease-out ${size === "sm"
                        ? "pl-9 py-2 bg-[var(--card-bg)]/50 border border-transparent rounded-lg text-sm focus:bg-[var(--card-bg)] focus:border-[var(--card-border)]/30"
                        : "pl-10 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl focus:ring-2 focus:ring-[var(--foreground)]/20"
                    }`}
            />
        </div>
    );
}