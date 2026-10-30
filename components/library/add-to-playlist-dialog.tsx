"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ListMusic, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Artwork } from "@/components/music/artwork";
import { useLibraryStore } from "@/stores/library-store";
import { useUiStore } from "@/stores/ui-store";
import type { MusicTrack } from "@/types/music";

export function AddToPlaylistDialog() {
  const track = useUiStore((state) => state.addToPlaylistTrack);
  const close = useUiStore((state) => state.closeAddToPlaylist);

  return (
    <Dialog open={Boolean(track)} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm vào danh sách phát</DialogTitle>
          <DialogDescription className="truncate">
            {track ? `${track.title} — ${track.artist.name}` : ""}
          </DialogDescription>
        </DialogHeader>
        <AddToPlaylistBody key={track?.id ?? "empty"} track={track} onClose={close} />
      </DialogContent>
    </Dialog>
  );
}

function AddToPlaylistBody({
  track,
  onClose,
}: {
  track: MusicTrack | null;
  onClose: () => void;
}) {
  const playlists = useLibraryStore((state) => state.playlists);
  const addTrackToPlaylist = useLibraryStore((state) => state.addTrackToPlaylist);
  const createPlaylist = useLibraryStore((state) => state.createPlaylist);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  if (creating) {
    return (
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!track) return;
          const id = createPlaylist(name, [track]);
          if (!id) {
            toast.error("Vui lòng nhập tên danh sách phát.");
            return;
          }
          toast.success("Đã tạo danh sách và thêm bài hát", { description: name.trim() });
          onClose();
        }}
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tên danh sách phát"
          maxLength={80}
          autoFocus
          required
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
            Quay lại
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Tạo và thêm
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-2">
      {playlists.length === 0 && (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <ListMusic className="mx-auto mb-2 h-6 w-6 text-muted" />
          <p className="text-sm text-muted">Bạn chưa có danh sách phát nào.</p>
        </div>
      )}
      <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
        {playlists.map((playlist) => {
          const already = track ? playlist.tracks.some((item) => item.id === track.id) : false;
          return (
            <button
              key={playlist.id}
              type="button"
              onClick={() => {
                if (!track) return;
                if (already) {
                  toast.info("Bài hát đã có trong danh sách này.");
                  return;
                }
                const added = addTrackToPlaylist(playlist.id, track);
                if (added) {
                  toast.success("Đã thêm vào danh sách phát", { description: playlist.name });
                  onClose();
                }
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-2"
            >
              <Artwork
                src={playlist.tracks[0]?.artwork}
                alt={playlist.name}
                className="h-11 w-11 shrink-0 rounded-lg"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{playlist.name}</span>
                <span className="block text-xs text-muted">{playlist.tracks.length} bài hát</span>
              </span>
              {already ? (
                <Check className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <Plus className="h-4 w-4 shrink-0 text-muted" />
              )}
            </button>
          );
        })}
      </div>
      <Button variant="outline" className="w-full" onClick={() => setCreating(true)}>
        <Plus className="h-4 w-4" /> Tạo danh sách phát mới
      </Button>
      <div className="pt-1 text-center">
        <Link href="/library/playlists" onClick={onClose} className="text-xs text-muted hover:text-foreground">
          Quản lý danh sách phát
        </Link>
      </div>
    </div>
  );
}
