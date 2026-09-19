import { expect, test } from "@playwright/test";

const nav = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "メインナビゲーション" });

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

test("お相手を探すページに遷移できる", async ({ page }) => {
  await page.goto("/");
  await nav(page).getByRole("link", { name: "お相手を探す" }).click();
  await expect(page).toHaveURL(/\/discover$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "ふたりの未来を、見つける。" }),
  ).toBeVisible();
});

test("お気に入りページに遷移できる", async ({ page }) => {
  await page.goto("/");
  await nav(page).getByRole("link", { name: "お気に入り" }).click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "気になる人を、大切に。" }),
  ).toBeVisible();
});

test("お見合いページに遷移できる", async ({ page }) => {
  await page.goto("/");
  await nav(page).getByRole("link", { name: "お見合い" }).click();
  await expect(page).toHaveURL(/\/meetings$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "出会いを、一歩ずつ。" }),
  ).toBeVisible();
});

test("マイプロフィールページに遷移できる", async ({ page }) => {
  await page.goto("/");
  await nav(page).getByRole("link", { name: "マイプロフィール" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "あなたらしさを、伝えよう。",
    }),
  ).toBeVisible();
});

test("ページをまたいで表示対象の切り替えが維持される", async ({ page }) => {
  await page.goto("/discover?view=men");
  await nav(page).getByRole("link", { name: "お気に入り" }).click();
  await expect(page).toHaveURL(/\/favorites\?view=men$/);
});

test("表示対象の切り替えは現在のページを維持する", async ({ page }) => {
  await page.goto("/discover");
  const viewSwitch = page.getByRole("navigation", { name: "体験する会員画面" });
  await viewSwitch.getByRole("link", { name: "男性のお相手" }).click();
  await expect(page).toHaveURL(/\/discover\?view=men$/);
});
