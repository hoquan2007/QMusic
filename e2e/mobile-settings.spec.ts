import { expect, test } from "@playwright/test";

test.describe("mobile layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile navigation works and pages do not overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Điều hướng di động" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tìm kiếm" }).last()).toBeVisible();

    await page.getByRole("link", { name: "Tìm kiếm" }).last().click();
    await expect(page).toHaveURL(/\/search/);
    await expect(page.getByLabel("Tìm kiếm âm nhạc").first()).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("settings switches theme and persists preference", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Tùy chỉnh QMusic" })).toBeVisible();

    await page.getByRole("button", { name: "Sáng", exact: true }).click();
    await expect
      .poll(async () => page.evaluate(() => window.localStorage.getItem("theme")))
      .toBe("light");

    const reduceMotion = page.getByRole("switch", { name: "Giảm chuyển động" });
    await reduceMotion.click();
    await expect(reduceMotion).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("html")).toHaveClass(/reduce-motion/);
  });
});
