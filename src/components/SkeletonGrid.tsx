"use client";

import { motion } from "framer-motion";

interface SkeletonGridProps {
    count?: number;
    viewMode?: "grid" | "list";
}

export default function SkeletonGrid({ count = 6, viewMode = "grid" }: SkeletonGridProps) {
    if (viewMode === "list") {
        return (
            <div className="space-y-2">
                {[...Array(count)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-3 p-3 bg-[var(--card-bg)] rounded-xl"
                    >
                        <div className="w-16 h-24 rounded-lg skeleton-shimmer" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                            <div className="h-3 w-full rounded skeleton-shimmer" />
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="aspect-[2/3] rounded-xl skeleton-shimmer"
                />
            ))}
        </div>
    );
}