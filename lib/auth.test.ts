import { describe, expect, it } from "vitest";
import { createAuth } from "./auth";

describe("credentials and session isolation", () => {
  it("requires a real password and normalizes email", () => {
    const auth = createAuth();
    expect(() => auth.register("a@example.test", "short")).toThrow();
    const id = auth.register(" A@example.test ", "long-enough-passphrase");
    expect(auth.login("a@example.test", "long-enough-passphrase")).toBe(id);
    expect(() => auth.login("a@example.test", "wrong-password")).toThrow();
    expect(() =>
      auth.register("a@example.test", "long-enough-passphrase"),
    ).toThrow();
  });
  it("rotates opaque sessions and revokes logout without deleting account", () => {
    const auth = createAuth();
    const id = auth.register("a@example.test", "long-enough-passphrase");
    const token = auth.issue({ role: "member", accountId: id });
    expect(auth.read(token)?.accountId).toBe(id);
    expect(auth.read(id)).toBeNull();
    auth.revoke(token);
    expect(auth.read(token)).toBeNull();
    expect(auth.login("a@example.test", "long-enough-passphrase")).toBe(id);
  });
  it("fails closed on expired session or new memory store", () => {
    let clock = 100;
    const auth = createAuth(() => clock);
    const token = auth.issue({ role: "staff" });
    clock += 3600001;
    expect(auth.read(token)).toBeNull();
    expect(createAuth().read(token)).toBeNull();
  });
  it("rate limits repeated bad credentials", () => {
    const auth = createAuth();
    for (let i = 0; i < 8; i++)
      expect(() =>
        auth.login("missing@example.test", "wrong-password"),
      ).toThrow();
    expect(() => auth.login("missing@example.test", "wrong-password")).toThrow(
      /しばらく/,
    );
  });
});
it("accepts passwords of 8 characters and rejects shorter ones", () => {
  const auth = createAuth();
  expect(() => auth.register("a@example.test", "1234567")).toThrow();
  const id = auth.register("a@example.test", "12345678");
  expect(auth.login("a@example.test", "12345678")).toBe(id);
  expect(() => auth.staffLogin("12345678", "1234567")).toThrow();
  expect(auth.staffLogin("12345678", "12345678")).toBeTruthy();
});
it("staff authentication never grants role with absent or wrong configuration", () => {
  const auth = createAuth();
  expect(() => auth.staffLogin("any")).toThrow();
  expect(() => auth.staffLogin("wrong", "a-configured-staff-secret")).toThrow();
  const token = auth.staffLogin(
    "a-configured-staff-secret",
    "a-configured-staff-secret",
  );
  expect(auth.read(token)?.role).toBe("staff");
  expect(auth.read(token)?.accountId).toBeUndefined();
});
it("failed domain registration can roll back credentials without affecting other accounts", () => {
  const auth = createAuth();
  const first = auth.register("first@example.test", "long-enough-passphrase");
  const failed = auth.register("failed@example.test", "long-enough-passphrase");
  auth.discardRegistration(failed);
  expect(() =>
    auth.login("failed@example.test", "long-enough-passphrase"),
  ).toThrow();
  expect(auth.login("first@example.test", "long-enough-passphrase")).toBe(
    first,
  );
  auth.register("failed@example.test", "new-long-enough-passphrase");
});
