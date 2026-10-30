import { Artwork } from "@/components/music/artwork";
import { cn } from "@/lib/utils";
import type { RemoteImage } from "@/types/music";

interface DetailHeroProps {
  artwork?: RemoteImage | null;
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  artworkClassName?: string;
  metaClassName?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DetailHero({
  artwork,
  eyebrow,
  title,
  description,
  meta,
  actions,
  artworkClassName,
  metaClassName,
  children,
  className,
}: DetailHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-3xl border border-border bg-surface p-4 sm:p-6 lg:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/16 via-transparent to-accent/10" />
        <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
        <Artwork
          src={artwork}
          alt={title}
          eager
          className={cn(
            "w-36 shrink-0 surface-shadow sm:w-44 lg:w-52",
            artworkClassName,
          )}
        />

        <div className="min-w-0 flex-1 pb-1">
          {eyebrow && (
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
          )}
          <h1 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 line-clamp-3 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
          )}
          {meta && (
            <div className={cn("mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted", metaClassName)}>
              {meta}
            </div>
          )}
          {actions && <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div>}
          {children}
        </div>
      </div>
    </section>
  );
}
