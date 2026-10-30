"use client";

import { useState } from "react";
import { Music2 } from "lucide-react";
import { imageCandidates } from "@/lib/artwork";
import { cn } from "@/lib/utils";
import type { RemoteImage } from "@/types/music";

interface ArtworkProps {
  src?: RemoteImage | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  eager?: boolean;
  iconClassName?: string;
  rounded?: string;
}

/** Remounts the image state when the source URL changes, avoiding reset effects. */
export function Artwork(props: ArtworkProps) {
  return <ArtworkImage key={props.src?.url ?? "fallback"} {...props} />;
}

function ArtworkImage({
  src,
  alt,
  className,
  imageClassName,
  eager = false,
  iconClassName,
  rounded = "rounded-xl",
}: ArtworkProps) {
  const candidates = imageCandidates(src);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const exhausted = index >= candidates.length;
  const current = candidates[index];

  return (
    <div
      className={cn(
        "relative isolate aspect-square overflow-hidden bg-surface-2",
        rounded,
        exhausted && "artwork-fallback",
        className,
      )}
      aria-label={exhausted ? alt : undefined}
      role={exhausted ? "img" : undefined}
    >
      {!exhausted && current ? (
        <img
          src={current}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setIndex((value) => value + 1)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Music2
            className={cn("h-1/4 w-1/4 text-white/80 drop-shadow-lg", iconClassName)}
            strokeWidth={1.5}
          />
        </div>
      )}
      {!loaded && !exhausted && <div className="absolute inset-0 shimmer bg-surface-2" />}
    </div>
  );
}
