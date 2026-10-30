"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ListMusic, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { DetailHero } from "@/components/music/detail-hero";
import { PlayAllButton, ShuffleButton } from "@/components/music/play-collection-buttons";
import { TrackRow } from "@/components/music/track-row";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useMounted } from "@/hooks/use-mounted";
import { formatDate, formatRelativeDate } from "@/lib/format";
import { useLibraryStore } from "@/stores/library-store";

export function LocalPlaylistView({ playlistId }: { playlistId: string }) {
  const mounted = useMounted();
  const router = useRouter();
  const playlist = useLibraryStore((state) => state.playlists.find((item) => item.id === playlistId));
  const updatePlaylist = useLibraryStore((state) => state.updatePlaylist);
  const deletePlaylist = useLibraryStore((state) => state.deletePlaylist);
  const removeTrack = useLibraryStore((state) => state.removeTrackFromPlaylist);
  const reorderTracks = useLibraryStore((state) => state.reorderPlaylistTracks);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!mounted) {
    return <div className="h-72 animate-pulse rounded-3xl bg-surface" />;
  }

  if (!playlist) {
    return (
      <EmptyState
        icon={ListMusic}
        title="Không tìm thấy danh sách phát"
        description="Danh sách này có thể đã bị xóa hoặc thuộc một phiên trình duyệt khác. Thư viện được lưu cục bộ trên thiết bị."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/library/playlists" className={buttonVariants({ size: "sm" })}>
              Về danh sách phát
            </Link>
            <Link href="/discover" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Khám phá nhạc
            </Link>
          </div>
        }
      />
    );
  }

  const tracks = playlist.tracks;

  function startEditing() {
    if (!playlist) return;
    setName(playlist.name);
    setDescription(playlist.description);
    setEditing(true);
  }

  return (
    <div className="space-y-8 pb-6">
      <DetailHero
        artwork={tracks[0]?.artwork}
        eyebrow="Danh sách phát của bạn"
        title={playlist.name}
        description={playlist.description || "Danh sách phát cá nhân được lưu trên thiết bị này."}
        meta={
          <>
            <span>{tracks.length} bài hát</span>
            <span aria-hidden="true">·</span>
            <span>Tạo {formatDate(new Date(playlist.createdAt).toISOString())}</span>
            <span aria-hidden="true">·</span>
            <span>Cập nhật {formatRelativeDate(playlist.updatedAt)}</span>
          </>
        }
        actions={
          <>
            <PlayAllButton tracks={tracks} label="Phát danh sách" />
            <ShuffleButton tracks={tracks} />
            <Button variant="outline" onClick={startEditing}>
              <Pencil className="h-4 w-4" /> Chỉnh sửa
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(true)} aria-label="Xóa danh sách phát">
              <Trash2 className="h-4 w-4" /> Xóa
            </Button>
          </>
        }
      />

      {editing && (
        <form
          className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) {
              toast.error("Tên danh sách phát không được để trống.");
              return;
            }
            updatePlaylist(playlist.id, { name, description });
            setEditing(false);
            toast.success("Đã cập nhật danh sách phát");
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="edit-playlist-name" className="text-xs font-semibold text-muted">
                Tên danh sách
              </label>
              <Input
                id="edit-playlist-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-playlist-description" className="text-xs font-semibold text-muted">
                Mô tả
              </label>
              <Input
                id="edit-playlist-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                placeholder="Thêm mô tả..."
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" /> Hủy
            </Button>
            <Button type="submit">
              <Check className="h-4 w-4" /> Lưu thay đổi
            </Button>
          </div>
        </form>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Bài hát</h2>
            <p className="mt-1 text-sm text-muted">
              Dùng mũi tên để sắp xếp lại. Thứ tự được lưu tự động.
            </p>
          </div>
          <Link href="/search" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Search className="h-3.5 w-3.5" /> Thêm bài hát
          </Link>
        </div>

        {tracks.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Danh sách phát đang trống"
            description="Tìm nhạc và dùng nút “Thêm vào danh sách phát” trong menu của bài hát để thêm vào đây."
            action={
              <Link href="/search" className={buttonVariants({ size: "sm" })}>
                <Search className="h-4 w-4" /> Tìm bài hát
              </Link>
            }
          />
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-1.5 sm:p-2">
            {tracks.map((track, index) => (
              <TrackRow
                key={track.id}
                track={track}
                index={index}
                queue={tracks}
                showAlbum
                onRemove={() => {
                  removeTrack(playlist.id, track.id);
                  toast.success("Đã xóa khỏi danh sách phát", { description: track.title });
                }}
                onMoveUp={
                  index > 0
                    ? () => {
                        reorderTracks(playlist.id, index, index - 1);
                      }
                    : undefined
                }
                onMoveDown={
                  index < tracks.length - 1
                    ? () => {
                        reorderTracks(playlist.id, index, index + 1);
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa danh sách phát?</DialogTitle>
            <DialogDescription>
              “{playlist.name}” sẽ bị xóa khỏi thiết bị này. Bài hát vẫn có thể tìm lại từ nguồn nhạc.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deletePlaylist(playlist.id);
                toast.success("Đã xóa danh sách phát", { description: playlist.name });
                setConfirmDelete(false);
                router.push("/library/playlists");
              }}
            >
              <Trash2 className="h-4 w-4" /> Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
