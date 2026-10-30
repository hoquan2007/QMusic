"use client";

import Link from "next/link";
import { BadgeCheck, ExternalLink, Music2, Users } from "lucide-react";
import { DetailHero } from "@/components/music/detail-hero";
import { PlayAllButton, ShuffleButton } from "@/components/music/play-collection-buttons";
import { SectionHeader } from "@/components/music/section-header";
import { TrackRow } from "@/components/music/track-row";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCount } from "@/lib/format";
import { providerLabel } from "@/lib/utils";
import type { MusicArtist, MusicTrack } from "@/types/music";

export function ArtistDetailView({
  artist,
  tracks,
}: {
  artist: MusicArtist;
  tracks: MusicTrack[];
}) {
  return (
    <div className="space-y-9 pb-6">
      <DetailHero
        artwork={artist.avatar}
        artworkClassName="rounded-full"
        eyebrow={`Nghệ sĩ · ${providerLabel(artist.provider)}`}
        title={artist.name}
        description={artist.bio}
        meta={
          <>
            {artist.handle && <span>@{artist.handle.replace(/^@/, "")}</span>}
            {typeof artist.followers === "number" && (
              <>
                {artist.handle && <span aria-hidden="true">·</span>}
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {formatCount(artist.followers)} người theo dõi
                </span>
              </>
            )}
            {artist.verified && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-accent">
                  <BadgeCheck className="h-3.5 w-3.5" /> Đã xác minh
                </span>
              </>
            )}
          </>
        }
        actions={
          <>
            <PlayAllButton tracks={tracks} label="Phát nhạc của nghệ sĩ" />
            <ShuffleButton tracks={tracks} />
            {artist.sourceUrl && (
              <a
                href={artist.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" /> Trang nghệ sĩ
              </a>
            )}
          </>
        }
      >
        <div className="mt-4">
          <Badge variant="accent">
            {tracks.length > 0 ? `${tracks.length} bài hát có thể phát` : "Chưa có bài hát"}
          </Badge>
        </div>
      </DetailHero>

      <section>
        <SectionHeader
          title="Bài hát nổi bật"
          subtitle="Sắp xếp theo lượt nghe từ nguồn nhạc"
          className="mb-3"
        />
        {tracks.length === 0 ? (
          <EmptyState
            icon={Music2}
            title="Chưa có bài hát"
            description="Nguồn nhạc chưa trả về bài hát có thể phát cho nghệ sĩ này."
          />
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
              {tracks.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index} queue={tracks} showAlbum />
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              Dữ liệu từ{" "}
              <Link href="https://audius.co" target="_blank" rel="noreferrer noopener" className="font-semibold hover:text-foreground">
                Audius
              </Link>
              . QMusic không sở hữu bản quyền các bản nhạc.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
