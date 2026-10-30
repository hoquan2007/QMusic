"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useLibraryStore } from "@/stores/library-store";
import { useUiStore } from "@/stores/ui-store";

export function CreatePlaylistDialog() {
  const open = useUiStore((state) => state.createPlaylistOpen);
  const setOpen = useUiStore((state) => state.setCreatePlaylistOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo danh sách phát</DialogTitle>
          <DialogDescription>
            Danh sách được lưu trên thiết bị này. Bạn có thể thêm bài hát sau.
          </DialogDescription>
        </DialogHeader>
        <CreatePlaylistForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CreatePlaylistForm({ onDone }: { onDone: () => void }) {
  const createPlaylist = useLibraryStore((state) => state.createPlaylist);
  const updatePlaylist = useLibraryStore((state) => state.updatePlaylist);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const id = createPlaylist(name);
        if (!id) {
          toast.error("Vui lòng nhập tên danh sách phát.");
          return;
        }
        if (description.trim()) updatePlaylist(id, { description });
        toast.success("Đã tạo danh sách phát", { description: name.trim() });
        onDone();
      }}
    >
      <div className="space-y-1.5">
        <label htmlFor="playlist-name" className="text-sm font-medium">
          Tên danh sách
        </label>
        <Input
          id="playlist-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ví dụ: Nhạc chill buổi tối"
          maxLength={80}
          autoFocus
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="playlist-description" className="text-sm font-medium">
          Mô tả <span className="font-normal text-muted">(tùy chọn)</span>
        </label>
        <textarea
          id="playlist-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Cảm hứng cho danh sách này..."
          maxLength={500}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-primary/60 focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onDone}>
          Hủy
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          <Plus className="h-4 w-4" />
          Tạo danh sách
        </Button>
      </div>
    </form>
  );
}
