import { expect, test } from "@playwright/test";

test("ホームが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/TOWARI/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "心が通う出会いを、ここから。",
    }),
  ).toBeVisible();
});

test("会員画面を男性のお相手に切り替えられる", async ({ page }) => {
  await page.goto("/");
  const viewSwitch = page.getByRole("navigation", { name: "体験する会員画面" });
  await viewSwitch.getByRole("link", { name: "男性のお相手" }).click();
  await expect(page).toHaveURL(/\?view=men$/);
  await expect(
    viewSwitch.getByRole("link", { name: "男性のお相手" }),
  ).toHaveAttribute("aria-current", "page");
});
