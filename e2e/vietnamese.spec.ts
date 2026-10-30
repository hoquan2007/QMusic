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
      currentTime: audio.currentTime,
      duration: audio.duration,
      error: audio.error?.code ?? null,
    };
  });
}

test("Vietnamese chart shows iTunes data and plays a legal preview", async ({ page }) => {
  const cspErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /Content Security Policy/i.test(message.text())) {
      cspErrors.push(message.text());
    }
  });

  await installAudioCapture(page);
  await page.goto("/vietnamese");

  await expect(page.getByRole("heading", { name: "Bảng xếp hạng nhạc Việt" })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByText("Không thể tải nhạc Việt")).toHaveCount(0);

  const firstTrack = page.locator('a[href^="/track/itunes/"]').first();
  await expect(firstTrack).toBeVisible({ timeout: 45_000 });
  await expect(page.getByText(/Nghe thử 30s/).first()).toBeVisible();

  const row = firstTrack.locator("xpath=ancestor::div[contains(@class,'group')]").first();
  await row.getByRole("button", { name: /^Phát / }).first().click();

  await expect
    .poll(async () => (await audioState(page))?.src ?? "", { timeout: 45_000 })
    .toContain("audio-ssl.itunes.apple.com");
  await expect
    .poll(async () => (await audioState(page))?.currentTime ?? 0, { timeout: 45_000 })
    .toBeGreaterThan(0);

  const playing = await audioState(page);
  expect(playing?.paused).toBe(false);
  expect(playing?.error).toBeNull();

  await expect(page.getByRole("link", { name: /Apple Music/ }).first()).toBeVisible();
  expect(cspErrors).toEqual([]);
});

test("home surfaces the Vietnamese section and links to the chart", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 45_000 });

  await expect(page.getByRole("heading", { name: "Nhạc Việt" })).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('a[href="/vietnamese"]').first()).toBeVisible();
  await expect(page.locator('a[href^="/track/itunes/"]').first()).toBeVisible({ timeout: 45_000 });
});
