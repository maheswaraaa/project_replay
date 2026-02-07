"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

interface FadeImageProps extends Omit<ImageProps, "onLoad"> {
    wrapperClassName?: string;
}

export default function FadeImage({
    wrapperClassName = "",
    className = "",
    alt,
    fill,
    ...props
}: FadeImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    // For fill images, we need the wrapper to be positioned
    if (fill) {
        return (
            <>
                {/* Skeleton shimmer - shows while loading */}
                <div
                    className={`absolute inset-0 skeleton-shimmer transition-opacity duration-300 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                />

                {/* Image with fade */}
                <Image
                    {...props}
                    alt={alt}
                    fill
                    className={`${className} transition-opacity duration-200 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setIsLoaded(true)}
                />
            </>
        );
    }

    // For non-fill images
    return (
        <div className={`relative overflow-hidden ${wrapperClassName}`}>
            {/* Skeleton shimmer - shows while loading */}
            <div
                className={`absolute inset-0 skeleton-shimmer transition-opacity duration-300 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
            />

            {/* Image with fade */}
            <Image
                {...props}
                alt={alt}
                className={`${className} transition-opacity duration-200 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                onLoad={() => setIsLoaded(true)}
            />
        </div>
    );
}