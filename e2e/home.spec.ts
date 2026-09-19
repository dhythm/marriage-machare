import { expect, test } from "@playwright/test";

test("入会前はサービス案内だけを表示する", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/TONARI/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "かけがえのない日々に。",
  );
  await expect(page.locator('img[src*="portraits"]')).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "入会申請", exact: true }).first(),
  ).toBeVisible();
});

for (const path of [
  "home",
  "application",
  "preferences",
  "introductions",
  "relationship",
  "notifications",
  "profile",
  "discover",
  "favorites",
  "meetings",
]) {
  test(`未認証の /${path} はログインが必要`, async ({ page }) => {
    await page.goto(`/${path}`);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('img[src*="portraits"]')).toHaveCount(0);
  });
}

test("会員写真は直接アクセスでも公開されない", async ({ request }) => {
  const response = await request.get("/api/portraits/m1");
  expect(response.status()).toBe(404);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect((await request.get("/portraits/misaki.png")).status()).toBe(404);
});
