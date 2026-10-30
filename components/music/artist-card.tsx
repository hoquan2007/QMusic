import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { formatCount } from "@/lib/format";
import type { MusicArtist } from "@/types/music";

export function ArtistCard({ artist }: { artist: MusicArtist }) {
  return (
    <Link
      href={`/artist/${artist.provider}/${encodeURIComponent(artist.remoteId)}`}
      className="group block rounded-2xl p-2.5 text-center transition-colors hover:bg-surface"
    >
      <Artwork
        src={artist.avatar}
        alt={artist.name}
        rounded="rounded-full"
        className="mx-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="pt-3">
        <p className="flex items-center justify-center gap-1 truncate text-sm font-semibold transition-colors group-hover:text-primary">
          <span className="truncate">{artist.name}</span>
          {artist.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
        </p>
        <p className="mt-1 truncate text-xs text-muted">
          {artist.followers ? `${formatCount(artist.followers)} người theo dõi` : "Nghệ sĩ"}
        </p>
      </div>
    </Link>
  );
}
