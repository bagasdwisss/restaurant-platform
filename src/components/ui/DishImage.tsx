"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { UtensilsCrossed } from "lucide-react";

export const DEFAULT_DISH_IMAGE =
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";

interface DishImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

export function DishImage({
  src,
  alt,
  fallbackSrc = DEFAULT_DISH_IMAGE,
  className = "",
  ...props
}: DishImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(!src);

  // Sync if src prop changes
  React.useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setHasError(false);
    } else {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }
  }, [src, fallbackSrc]);

  return (
    <Image
      src={currentSrc}
      alt={alt || "Menu Dish"}
      className={className}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          setHasError(true);
        }
      }}
      {...props}
    />
  );
}
