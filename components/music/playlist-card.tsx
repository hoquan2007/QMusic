import Link from "next/link";
import { Disc3 } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { CollectionPlayButton } from "@/components/music/collection-play-button";
import type { MusicPlaylist } from "@/types/music";

export function PlaylistCard({ playlist }: { playlist: MusicPlaylist }) {
  const href = playlist.isAlbum
    ? `/album/${playlist.provider}/${encodeURIComponent(playlist.remoteId)}`
    : `/playlist/${playlist.provider}/${encodeURIComponent(playlist.remoteId)}`;

  return (
    <article className="group relative">
      <div className="relative">
        <Link href={href} className="block" aria-label={playlist.title}>
          <Artwork
            src={playlist.artwork}
            alt={playlist.title}
            className="w-full transition-transform duration-500 group-hover:scale-[1.025]"
          />
        </Link>
        <CollectionPlayButton
          playlist={playlist}
          className="absolute bottom-3 right-3 translate-y-0 opacity-100 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:focus-visible:translate-y-0 sm:focus-visible:opacity-100"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur">
          {playlist.isAlbum ? "Album" : "Playlist"}
        </span>
      </div>
      <div className="pt-3">
        <Link
          href={href}
          className="line-clamp-2 text-sm font-semibold leading-snug transition-colors hover:text-primary"
        >
          {playlist.title}
        </Link>
        <p className="mt-1 line-clamp-1 text-xs text-muted">
          {playlist.owner?.name ?? "QMusic"}
          {playlist.trackCount ? ` · ${playlist.trackCount} bài` : ""}
        </p>
      </div>
    </article>
  );
}

export function AlbumCard({ playlist }: { playlist: MusicPlaylist }) {
  return <PlaylistCard playlist={{ ...playlist, isAlbum: true }} />;
}

export function PlaylistTile({ playlist }: { playlist: MusicPlaylist }) {
  return (
    <Link
      href={
        playlist.isAlbum
          ? `/album/${playlist.provider}/${encodeURIComponent(playlist.remoteId)}`
          : `/playlist/${playlist.provider}/${encodeURIComponent(playlist.remoteId)}`
      }
      className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-primary/30 hover:bg-surface-2"
    >
      <Artwork src={playlist.artwork} alt={playlist.title} className="h-14 w-14 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{playlist.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {playlist.owner?.name ?? "QMusic"}
          {playlist.trackCount ? ` · ${playlist.trackCount} bài` : ""}
        </p>
      </div>
      <Disc3 className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-primary" />
    </Link>
  );
}
