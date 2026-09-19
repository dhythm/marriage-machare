import { expect, test } from "@playwright/test";

test("ログイン画面からデモ会員を選んでそのまま体験できる", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /美咲/ }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: /美咲さん/ })).toBeVisible();
});

test("セッションCookieがなくてもデモ会員のまま利用できる", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /美咲/ }).click();
  await expect(page).toHaveURL(/\/home$/);
  await context.clearCookies({ name: "tonari_session_v2" });
  await page.reload();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: /美咲さん/ })).toBeVisible();
});

test("サイドバーから別のデモ会員に切り替えられる", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /拓海/ }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: /拓海さん/ })).toBeVisible();
  await page.getByLabel("デモ会員").selectOption("m2");
  await expect(page.getByRole("heading", { name: /彩乃さん/ })).toBeVisible();
});
