import { expect, test } from "vitest";
import { applicationSchema, favorite, requestMeeting, session } from "./store";

test("セッションは分離され、未知のセッションIDは採用されない", () => {
  const a = session("untrusted-id");
  const b = session();
  expect(a.id).not.toBe("untrusted-id");
  favorite(a.account, "m1");
  expect(b.account.favorites).toEqual([]);
  expect(session(a.id).account).toBe(a.account);
});

test("お気に入りはトグルでき、架空のIDは拒否する", () => {
  const { account } = session();
  favorite(account, "m1");
  favorite(account, "m1");
  expect(account.favorites).toEqual([]);
  expect(() => favorite(account, "missing")).toThrow();
});

test("申請前は面談希望を拒否し、申請後は重複登録しない", () => {
  const { account } = session();
  expect(() => requestMeeting(account, "m1")).toThrow();
  account.status = "pending";
  requestMeeting(account, "m1");
  requestMeeting(account, "m1");
  expect(account.requests).toEqual(["m1"]);
  expect(() => requestMeeting(account, "missing")).toThrow();
});

test("年齢、価値観、同意をサーバーで検証する", () => {
  const data = {
    name: "はる",
    age: 30,
    location: "東京都",
    values: ["家族との時間"],
    consent: true,
  };
  expect(applicationSchema.safeParse(data).success).toBe(true);
  for (const patch of [
    { age: 19 },
    { values: [] },
    { values: ["unknown"] },
    { consent: false },
    { name: " " },
  ]) {
    expect(applicationSchema.safeParse({ ...data, ...patch }).success).toBe(
      false,
    );
  }
});

test("期限切れのセッションは再利用されない", () => {
  const { id, account } = session();
  account.expires = Date.now() - 1;
  expect(session(id).id).not.toBe(id);
});

test("男性会員にも既存と同じ保存・面談希望の制約を適用する", () => {
  const { account } = session();
  favorite(account, "m7");
  expect(account.favorites).toEqual(["m7"]);
  expect(() => requestMeeting(account, "m7")).toThrow();
  account.status = "pending";
  requestMeeting(account, "m7");
  requestMeeting(account, "m7");
  expect(account.requests).toEqual(["m7"]);
  favorite(account, "m1");
  expect(account.favorites).toEqual(["m7", "m1"]);
  favorite(account, "m7");
  expect(account.favorites).toEqual(["m1"]);
});
