import { expect, test, type Page } from "@playwright/test";

async function installAudioCapture(page: Page) {
  await page.addInitScript(() => {
    const scope = window as unknown as { __audios?: HTMLAudioElement[] };
    scope.__audios = [];
    const Original = window.Audio;
    window.Audio = function (...args: ConstructorParameters<typeof Audio>) {
      const audio = new Original(...args);
      scope.__audios?.push(audio);
      return audio;
    } as unknown as typeof Audio;
    window.Audio.prototype = Original.prototype;
  });
}

function audioState(page: Page) {
  return page.evaluate(() => {
    const audio = (window as unknown as { __audios?: HTMLAudioElement[] }).__audios?.[0];
    if (!audio) return null;
    return {
      src: audio.src,
      paused: audio.paused,
      muted: audio.muted,
      currentTime: audio.currentTime,
      duration: audio.duration,
      error: audio.error?.code ?? null,
    };
  });
}

test("player controls pause, seek, mute, shuffle, repeat, next and overlays", async ({ page }) => {
  await installAudioCapture(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 45_000 });
  await page.getByRole("button", { name: /Phát ngay|Tạm dừng/ }).first().click();
  await expect(page.getByRole("button", { name: "Tạm dừng" }).first()).toBeVisible({ timeout: 45_000 });

  await expect.poll(async () => (await audioState(page))?.currentTime ?? 0, { timeout: 40_000 }).toBeGreaterThan(1);
  const playing = await audioState(page);
  expect(playing?.paused).toBe(false);
  expect(playing?.error).toBeNull();

  await page.getByRole("button", { name: "Tạm dừng" }).first().click();
  await expect.poll(async () => (await audioState(page))?.paused, { timeout: 10_000 }).toBe(true);

  await page.getByRole("button", { name: "Phát", exact: true }).first().click();
  await expect.poll(async () => (await audioState(page))?.paused, { timeout: 10_000 }).toBe(false);

  const beforeSeek = (await audioState(page))?.currentTime ?? 0;
  const progress = page.locator('[aria-label="Tiến trình bài hát"]').first();
  const progressBox = await progress.boundingBox();
  expect(progressBox).not.toBeNull();
  if (progressBox) {
    await page.mouse.click(progressBox.x + progressBox.width * 0.5, progressBox.y + progressBox.height / 2);
  }
  await expect
    .poll(async () => (await audioState(page))?.currentTime ?? 0, { timeout: 15_000 })
    .toBeGreaterThan(beforeSeek + 1);

  await page.getByRole("button", { name: "Tắt âm thanh" }).click();
  await expect.poll(async () => (await audioState(page))?.muted, { timeout: 10_000 }).toBe(true);
  await page.getByRole("button", { name: "Bật âm thanh" }).click();
  await expect.poll(async () => (await audioState(page))?.muted, { timeout: 10_000 }).toBe(false);

  const shuffle = page.getByRole("button", { name: "Bật phát ngẫu nhiên" });
  await shuffle.click();
  await expect(page.getByRole("button", { name: "Tắt phát ngẫu nhiên" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Tắt phát ngẫu nhiên" }).click();

  const repeat = page.getByRole("button", { name: "Lặp lại: tắt" });
  await repeat.click();
  await expect(page.getByRole("button", { name: "Lặp lại toàn bộ" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Lặp lại toàn bộ" }).click();
  await expect(page.getByRole("button", { name: "Lặp lại một bài" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Lặp lại một bài" }).click();

  await page.getByRole("button", { name: "Mở hàng đợi" }).click();
  const queueDialog = page.getByRole("dialog").filter({ has: page.getByRole("heading", { name: /Hàng đợi/ }) });
  await expect(queueDialog).toBeVisible();
  await expect(queueDialog.getByRole("button", { name: /^Phát / }).first()).toBeVisible();
  await queueDialog.getByRole("button", { name: "Đóng hàng đợi" }).click();

  await page.getByRole("button", { name: "Mở trình phát toàn màn hình" }).click();
  await expect(page.getByRole("button", { name: "Đóng trình phát toàn màn hình" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lời bài hát" })).toBeVisible();
  await page.getByRole("button", { name: "Đóng trình phát toàn màn hình" }).click();

  const beforeNext = (await audioState(page))?.src ?? "";
  await page.getByRole("button", { name: "Bài tiếp theo" }).click();
  await expect.poll(async () => (await audioState(page))?.src ?? "", { timeout: 45_000 }).not.toBe(beforeNext);
  await expect.poll(async () => (await audioState(page))?.currentTime ?? 0, { timeout: 45_000 }).toBeGreaterThan(0);
  const nextTrack = await audioState(page);
  expect(nextTrack?.paused).toBe(false);
  expect(nextTrack?.error).toBeNull();
});
