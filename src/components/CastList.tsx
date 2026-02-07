import Image from "next/image";
import { User } from "lucide-react";
import { getImageUrl, type CastMember } from "@/lib/tmdb";

interface CastListProps {
    cast: CastMember[];
}

export default function CastList({ cast }: CastListProps) {
    if (cast.length === 0) return null;

    return (
        <div>
            <h3 className="font-semibold text-[var(--foreground)] mb-3">Cast</h3>
            <div
                className="flex gap-4 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
            >
                {cast.map((person) => (
                    <div key={person.id} className="flex-shrink-0 w-16 text-center">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[var(--card-border)] mb-2">
                            {person.profile_path ? (
                                <Image
                                    src={getImageUrl(person.profile_path, "w200") || ""}
                                    alt={person.name}
                                    fill
                                    loading="lazy"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={24} className="text-[var(--muted)]" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs font-medium text-[var(--foreground)] truncate" title={person.name}>
                            {person.name}
                        </p>
                        <p className="text-xs text-[var(--muted)] truncate" title={person.character}>
                            {person.character}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}