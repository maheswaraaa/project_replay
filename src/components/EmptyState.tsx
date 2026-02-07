import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        icon?: LucideIcon;
        onClick: () => void;
    };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <Icon size={48} className="text-[var(--muted)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">{title}</h3>
            <p className="text-[var(--muted)] text-sm mb-4">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    {action.icon && <action.icon size={16} />}
                    {action.label}
                </button>
            )}
        </div>
    );
}