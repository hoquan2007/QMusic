"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";

/**
 * Video YouTube phát trong iframe riêng. Tạm dừng trình phát audio toàn cục khi
 * mở trang xem video để hai nguồn âm thanh không chồng lên nhau; hàng đợi và vị
 * trí bài đang nghe vẫn được giữ nguyên để tiếp tục sau khi rời trang.
 */
export function PauseAudioForVideo() {
  useEffect(() => {
    const player = usePlayerStore.getState();
    if (player.isPlaying) player.pause();
  }, []);

  return null;
}
