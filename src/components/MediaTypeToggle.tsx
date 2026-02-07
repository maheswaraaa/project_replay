import { Clapperboard, MonitorPlay } from "lucide-react";
import type { MediaTypeFilter } from "@/types";

interface MediaTypeToggleProps {
    value: MediaTypeFilter;
    onChange: (type: MediaTypeFilter) => void;
    onGenreReset?: () => void;
    size?: "sm" | "md";
}

export default function MediaTypeToggle({
    value,
    onChange,
    onGenreReset,
    size = "sm",
}: MediaTypeToggleProps) {
    const handleChange = (type: MediaTypeFilter) => {
        onChange(type);
        onGenreReset?.();
    };

    const iconSize = size === "sm" ? 10 : 12;

    const containerClasses = size === "sm"
        ? "flex flex-nowrap rounded-full bg-[var(--card-bg)]/60 p-0.5 shrink-0"
        : "flex rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] p-0.5 shrink-0";

    const pillClasses = size === "sm" ? "rounded-full" : "rounded-lg";

    const baseClasses = size === "sm"
        ? "flex items-center gap-1 px-2 py-0.5 text-[11px]"
        : "flex items-center gap-1 px-2.5 py-1.5 text-xs";

    const options = [
        { key: "movie" as const, icon: Clapperboard, label: "Movies" },
        { key: "tv" as const, icon: MonitorPlay, label: size === "sm" ? "TV Shows" : "TV" },
    ];

    return (
        <div className={containerClasses}>
            {options.map(({ key, icon: Icon, label }) => (
                <button
                    key={key}
                    onClick={() => handleChange(key)}
                    className={`${baseClasses} ${pillClasses} font-medium whitespace-nowrap transition-all duration-200 ${value === key
                            ? "bg-[var(--foreground)] text-[var(--background)]"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                >
                    <Icon size={iconSize} />
                    {label}
                </button>
            ))}
        </div>
    );
}