"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { EASE_OUT } from "@/types";

interface FavoritePromptProps {
    show: boolean;
    onRespond: (addToFavorites: boolean) => void;
}

export default function FavoritePrompt({ show, onRespond }: FavoritePromptProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => onRespond(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ ease: EASE_OUT }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                                <Heart size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                                Did you enjoy it?
                            </h3>
                            <p className="text-sm text-[var(--muted)] mb-6">
                                Is this movie worth rewatching? Add it to your favorites!
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => onRespond(false)}
                                    className="flex-1 py-2.5 px-4 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-border)] transition-colors"
                                >
                                    Not really
                                </button>
                                <button
                                    onClick={() => onRespond(true)}
                                    className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    <Heart size={16} className="fill-current" />
                                    Yes, favorite!
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}