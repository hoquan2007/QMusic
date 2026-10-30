"use client";

import { useState } from "react";
import Link from "next/link";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LocalPlaylistCard } from "@/features/library/local-playlist-card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useMounted } from "@/hooks/use-mounted";
import { useLibraryStore, type LocalPlaylist } from "@/stores/library-store";
import { useUiStore } from "@/stores/ui-store";

export function PlaylistsView() {
  const mounted = useMounted();
  const playlists = useLibraryStore((state) => state.playlists);
  const deletePlaylist = useLibraryStore((state) => state.deletePlaylist);
  const setCreatePlaylistOpen = useUiStore((state) => state.setCreatePlaylistOpen);
  const [pendingDelete, setPendingDelete] = useState<LocalPlaylist | null>(null);

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface" />;
  }

  return (
    <div className="space-y-6 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <ListMusic className="h-3 w-3" /> Thư viện
          </p>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Danh sách phát</h1>
          <p className="mt-1.5 text-sm text-muted">
            {playlists.length > 0
              ? `${playlists.length} danh sách phát được lưu trên thiết bị này.`
              : "Tạo danh sách phát riêng và thêm bài hát từ bất kỳ trang nào."}
          </p>
        </div>
        <Button onClick={() => setCreatePlaylistOpen(true)}>
          <Plus className="h-4 w-4" /> Tạo danh sách phát
        </Button>
      </header>

      {playlists.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="Chưa có danh sách phát"
          description="Danh sách phát giúp bạn nhóm nhạc theo tâm trạng, hoạt động hoặc bất cứ điều gì bạn muốn."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => setCreatePlaylistOpen(true)}>
                <Plus className="h-4 w-4" /> Tạo danh sách đầu tiên
              </Button>
              <Link href="/discover" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Khám phá nhạc
              </Link>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {playlists.map((playlist) => (
            <LocalPlaylistCard key={playlist.id} playlist={playlist} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa danh sách phát?</DialogTitle>
            <DialogDescription>
              “{pendingDelete?.name}” sẽ bị xóa khỏi thiết bị này. Các bài hát riêng lẻ và lịch sử nghe vẫn được giữ.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!pendingDelete) return;
                deletePlaylist(pendingDelete.id);
                toast.success("Đã xóa danh sách phát", { description: pendingDelete.name });
                setPendingDelete(null);
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
