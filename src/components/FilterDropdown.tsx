import { ChevronDown } from "lucide-react";

interface FilterDropdownProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
    isActive: boolean;
}

export default function FilterDropdown({
    value,
    onChange,
    placeholder,
    options,
    isActive,
}: FilterDropdownProps) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`appearance-none pl-2.5 pr-6 py-1.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none transition-all duration-200 ${isActive
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "bg-[var(--card-bg)]/60 text-[var(--muted)] hover:bg-[var(--card-bg)]"
                    }`}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={10}
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            />
        </div>
    );
}