"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { Heart } from "lucide-react";

interface FavoritePromptProps {
    show: boolean;
    onRespond: (addToFavorites: boolean) => void;
}

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const modalVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            damping: 25,
            stiffness: 300,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 20,
        transition: {
            duration: 0.2,
        },
    },
};

const iconVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring" as const,
            damping: 15,
            stiffness: 200,
            delay: 0.1,
        },
    },
};

const contentVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.2,
        },
    },
};

const buttonContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.3,
            staggerChildren: 0.1,
        },
    },
};

const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export default function FavoritePrompt({ show, onRespond }: FavoritePromptProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => onRespond(false)}
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <div className="flex flex-col items-center text-center">
                            <motion.div
                                variants={iconVariants}
                                className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center mb-4"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Heart size={28} className="text-red-500" />
                                </motion.div>
                            </motion.div>

                            <motion.div variants={contentVariants}>
                                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                                    Did you enjoy it?
                                </h3>
                                <p className="text-sm text-[var(--muted)] mb-6">
                                    Is this movie worth rewatching? Add it to your favorites!
                                </p>
                            </motion.div>

                            <motion.div
                                className="flex gap-3 w-full"
                                variants={buttonContainerVariants}
                            >
                                <motion.button
                                    variants={buttonVariants}
                                    onClick={() => onRespond(false)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 py-2.5 px-4 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-border)] transition-colors"
                                >
                                    Not really
                                </motion.button>
                                <motion.button
                                    variants={buttonVariants}
                                    onClick={() => onRespond(true)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    <Heart size={16} className="fill-current" />
                                    Yes, favorite!
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}