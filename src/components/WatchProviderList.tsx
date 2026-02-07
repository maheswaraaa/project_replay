import Image from "next/image";
import type { WatchProvider } from "@/lib/tmdb";

interface WatchProviderListProps {
    providers: WatchProvider[];
}

export default function WatchProviderList({ providers }: WatchProviderListProps) {
    if (providers.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-3">Stream on</h3>
            <div className="flex flex-wrap gap-3">
                {providers.map((provider) => (
                    <div
                        key={provider.provider_id}
                        className="flex items-center gap-2 px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg"
                    >
                        {provider.logo_path && (
                            <Image
                                src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                alt={provider.provider_name}
                                width={24}
                                height={24}
                                className="rounded"
                            />
                        )}
                        <span className="text-xs font-medium text-[var(--foreground)]">
                            {provider.provider_name}
                        </span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-[var(--muted)] mt-2">Data from JustWatch</p>
        </div>
    );
}