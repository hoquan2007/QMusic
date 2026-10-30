import { expect, test } from "@playwright/test";

test("home renders real Audius data and plays a track across navigation", async ({ page }) => {
  const cspErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /Content Security Policy/i.test(message.text())) {
      cspErrors.push(message.text());
    }
  });

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

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 45_000 });
  await expect(page.getByText("Không thể tải trang chủ")).toHaveCount(0);

  const streamResponse = page.waitForResponse(
    (response) =>
      /\/tracks\/[^/]+\/stream/.test(response.url()) && [200, 206, 302].includes(response.status()),
    { timeout: 60_000 },
  );

  await page.getByRole("button", { name: /Phát ngay|Tạm dừng/ }).first().click();

  const response = await streamResponse;
  expect([200, 206, 302]).toContain(response.status());

  await expect(page.getByRole("button", { name: "Tạm dừng" }).first()).toBeVisible({ timeout: 45_000 });

  const audioState = () =>
    page.evaluate(() => {
      const audio = (window as unknown as { __audios?: HTMLAudioElement[] }).__audios?.[0];
      if (!audio) return null;
      return {
        src: audio.src,
        paused: audio.paused,
        currentTime: audio.currentTime,
        duration: audio.duration,
        error: audio.error?.code ?? null,
      };
    });

  await expect.poll(async () => (await audioState())?.currentTime ?? 0, { timeout: 40_000 }).toBeGreaterThan(0);
  const playing = await audioState();
  expect(playing?.paused).toBe(false);
  expect(playing?.error).toBeNull();
  expect(playing?.src).toContain("/tracks/");

  const before = playing?.currentTime ?? 0;

  await page.getByRole("link", { name: "Khám phá" }).first().click();
  await expect(page).toHaveURL(/\/discover$/);
  await expect(page.getByRole("heading", { name: /Tìm nhạc mới/ })).toBeVisible();

  await expect
    .poll(async () => (await audioState())?.currentTime ?? 0, { timeout: 20_000 })
    .toBeGreaterThan(before);
  const after = await audioState();
  expect(after?.src).toBe(playing?.src);
  await expect(page.getByRole("button", { name: "Tạm dừng" }).first()).toBeVisible();

  expect(cspErrors).toEqual([]);
});

test("track detail page exposes real metadata and lyrics panel", async ({ page }) => {
  await page.goto("/");
  const trackLink = page.locator('a[href^="/track/"]').first();
  await expect(trackLink).toBeVisible({ timeout: 45_000 });
  await trackLink.click();

  await expect(page).toHaveURL(/\/track\/(audius|jamendo)\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Lời bài hát", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Phát bài hát" }).first()).toBeVisible();
});
