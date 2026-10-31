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

test("keyless YouTube link opens the official embedded video player", async ({ page }) => {
  const cspErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /Content Security Policy/i.test(message.text())) {
      cspErrors.push(message.text());
    }
  });

  await installAudioCapture(page);
  const response = await page.goto("/videos");
  expect(response?.headers()["content-security-policy"]).toContain("frame-src https://www.youtube.com");

  await expect(page.getByRole("heading", { name: "Xem MV chính thức, trọn khung hình" })).toBeVisible({
    timeout: 45_000,
  });

  await page.getByLabel("Dán liên kết YouTube").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await page.getByRole("button", { name: "Mở video" }).click();

  await expect(page).toHaveURL(/\/track\/youtube\/dQw4w9WgXcQ$/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: /Never Gonna Give You Up/i, level: 1 }),
  ).toBeVisible({ timeout: 60_000 });

  const frame = page.locator('iframe[title*="YouTube"]').first();
  await expect(frame).toBeVisible();
  const src = await frame.getAttribute("src");
  expect(src).toContain("youtube.com/embed/dQw4w9WgXcQ");
  expect(src).not.toContain("controls=0");

  const audioCount = await page.evaluate(
    () => (window as unknown as { __audios?: HTMLAudioElement[] }).__audios?.length ?? 0,
  );
  expect(audioCount).toBe(0);
  expect(cspErrors).toEqual([]);
});
