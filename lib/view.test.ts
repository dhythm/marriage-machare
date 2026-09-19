import { expect, test } from "vitest";
import { partnersFor, resolveView } from "./view";

test("view=men は men、その他は women を返す", () => {
  expect(resolveView("men")).toBe("men");
  expect(resolveView(undefined)).toBe("women");
  expect(resolveView("women")).toBe("women");
  expect(resolveView(["men"])).toBe("women");
});

test("表示対象に応じた会員だけを返す", () => {
  expect(partnersFor("men").every((m) => m.gender === "man")).toBe(true);
  expect(partnersFor("women").every((m) => m.gender === "woman")).toBe(true);
  expect(partnersFor("men").length).toBeGreaterThan(0);
  expect(partnersFor("women").length).toBeGreaterThan(0);
});
