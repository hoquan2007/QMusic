import { expect, test } from "@playwright/test";

test("search debounces into the URL and renders real results", async ({ page }) => {
  await page.goto("/search");
  const input = page.getByPlaceholder("Nhập tên bài hát, nghệ sĩ, playlist…");
  await input.fill("lofi");
  await expect(page).toHaveURL(/q=lofi/, { timeout: 10_000 });

  await expect(page.locator('a[href^="/track/"], a[href^="/artist/"], a[href^="/playlist/"]').first()).toBeVisible(
    { timeout: 45_000 },
  );
  await expect(page.getByText("Không tìm thấy kết quả")).toHaveCount(0);
});

test("favorites survive a full page reload", async ({ page }) => {
  await page.goto("/discover");
  const article = page.locator("article").filter({ has: page.locator('a[href^="/track/"]') }).first();
  const like = article.locator("button[aria-pressed]").first();
  await expect(like).toBeVisible({ timeout: 45_000 });
  await like.click();
  await expect(like).toHaveAttribute("aria-pressed", "true");

  await page.goto("/library/liked");
  const likedTrack = page.locator('a[href^="/track/"]').first();
  await expect(likedTrack).toBeVisible();
  const href = await likedTrack.getAttribute("href");

  await page.reload();
  await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
});

test("creates a local playlist, opens it and renames it", async ({ page }) => {
  await page.goto("/library/playlists");
  await page.getByRole("button", { name: "Tạo danh sách phát" }).first().click();
  await page.getByLabel("Tên danh sách").fill("E2E chill");
  await page.getByRole("button", { name: "Tạo danh sách", exact: true }).click();

  const playlistLink = page.getByRole("link", { name: "E2E chill" }).first();
  await expect(playlistLink).toBeVisible();
  await playlistLink.click();

  await expect(page.getByRole("heading", { name: "E2E chill" })).toBeVisible();
  await page.getByRole("button", { name: "Chỉnh sửa" }).click();
  await page.getByLabel("Tên danh sách").fill("E2E chill đã đổi");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();

  await expect(page.getByRole("heading", { name: "E2E chill đã đổi" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "E2E chill đã đổi" })).toBeVisible();
});
