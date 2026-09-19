import * as crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Preference, Profile } from "./contracts";
import { createEngine } from "./engine";

vi.mock("node:crypto", { spy: true });
const profile = (gender: Profile["gender"], name: string): Profile => ({
  name,
  gender,
  age: 30,
  location: "東京都",
  job: "企画",
  intro: "一緒に暮らしを育てたい",
  story: "対話を大切にしたいです。",
  values: ["対話を大切に"],
  hobbies: ["読書"],
  timing: "within_year",
  lifestyle: "quiet",
  smoking: "no",
  children: "discuss",
  consent: true,
});
const preference = (target: Preference["target"]): Preference => ({
  target,
  ageMin: 25,
  ageMax: 40,
  ageRequired: true,
  regions: ["東京都"],
  regionRequired: true,
  values: ["対話を大切に"],
  priorityValue: "対話を大切に",
  timing: "within_year",
  timingRequired: true,
  lifestyle: "quiet",
  smoking: "no",
  smokingRequired: true,
  children: "discuss",
  childrenRequired: false,
  note: "",
});
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined)
    throw new Error("Expected fixture value");
  return value;
}
let store: ReturnType<typeof createEngine>;
function add(id: string, gender: Profile["gender"] = "woman") {
  store.register(id, `${id}@example.test`);
  store.submitApplication(id, profile(gender, id));
  store.review(id, "approved", "");
  store.savePreference(
    id,
    preference(gender === "woman" ? "man" : "woman"),
    true,
  );
  store.setPhoto(id, true);
}
function request(a = "a", b = "b") {
  store.generateIntroductions(a);
  store.interest(a, b);
  return required(store.snapshot(b).interests.find((i) => i.partner.id === a))
    .id;
}
function match(a = "a", b = "b") {
  store.respondInterest(b, request(a, b), true);
  return required(store.snapshot(a).relationship).id;
}
beforeEach(() => {
  store = createEngine();
  add("a");
  add("b", "man");
  add("c", "man");
});
describe("consultation access and matching", () => {
  it("fails closed for missing, pending and incomplete accounts", () => {
    expect(() => store.snapshot("missing")).toThrow();
    store.register("d", "d@example.test");
    store.submitApplication("d", profile("woman", "d"));
    expect(store.snapshot("d").introductions).toEqual([]);
    expect(() => store.generateIntroductions("d")).toThrow();
    store.review("d", "approved", "");
    store.savePreference("d", preference("man"), false);
    expect(() => store.generateIntroductions("d")).toThrow();
    expect(store.photoAccess("d", "b")).toBe(false);
  });
  it("only reveals photos after reciprocal acceptance, and never includes raw photo fields in intros", () => {
    const id = request();
    expect(store.photoAccess("a", "b")).toBe(false);
    expect(JSON.stringify(store.snapshot("a").introductions)).not.toContain(
      "/portraits",
    );
    store.respondInterest("b", id, true);
    expect(store.photoAccess("a", "b")).toBe(true);
    expect(store.photoAccess("c", "b")).toBe(false);
  });
  it("keeps batches stable and enforces reciprocal hard constraints", () => {
    store.savePreference(
      "c",
      { ...preference("woman"), ageMin: 40, ageMax: 50 },
      true,
    );
    store.generateIntroductions("a");
    expect(store.snapshot("a").introductions.map((p) => p.id)).toEqual(["b"]);
    store.generateIntroductions("a");
    expect(store.snapshot("a").introductions.map((p) => p.id)).toEqual(["b"]);
    expect(() => store.interest("a", "c")).toThrow();
  });
  it("blocks all parallel actions and stale acceptance", () => {
    store.generateIntroductions("c");
    store.interest("c", "a");
    const stale = store.snapshot("a").interests[0].id;
    match();
    expect(() => store.generateIntroductions("a")).toThrow();
    expect(() => store.interest("a", "c")).toThrow();
    expect(() => store.respondInterest("a", stale, true)).toThrow();
    expect(store.snapshot("a").introductions).toEqual([]);
    expect(store.snapshot("c").relationship).toBe(null);
  });
  it("ends atomically on both sides with idempotent notices, lost access and no rematch", () => {
    const id = match();
    store.endRelationship("a", id, "declined");
    const left = store.snapshot("a"),
      right = store.snapshot("b");
    expect(left.relationship).toBe(null);
    expect(right.relationship).toBe(null);
    expect(left.history).toHaveLength(1);
    expect(right.history[0].endedBy).toBe("a");
    expect(right.notifications.at(-1)?.text).toContain("a");
    const length = right.notifications.length;
    store.endRelationship("a", id, "declined");
    expect(store.snapshot("b").notifications).toHaveLength(length);
    expect(store.photoAccess("a", "b")).toBe(false);
    store.generateIntroductions("a");
    expect(store.snapshot("a").introductions.map((p) => p.id)).not.toContain(
      "b",
    );
  });
  it("freezes a match on profile re-review and preference editing cannot unlock it", () => {
    const id = match();
    store.submitApplication("a", profile("woman", "a"));
    expect(store.photoAccess("a", "b")).toBe(false);
    expect(() => store.generateIntroductions("b")).toThrow();
    store.savePreference("b", preference("woman"), true);
    expect(() => store.generateIntroductions("b")).toThrow();
    store.endRelationship("b", id, "declined");
    expect(store.snapshot("b").relationship).toBe(null);
  });
  it("one outstanding outgoing request, cancellation notifies the receiver", () => {
    request();
    expect(() => store.interest("a", "c")).toThrow();
    const id = store.snapshot("a").interests[0].id;
    store.cancelInterest("a", id);
    expect(store.snapshot("b").interests).toEqual([]);
    expect(store.snapshot("b").notifications.at(-1)?.text).toContain(
      "取り下げ",
    );
  });
  it("withdrawal ends and notifies while restart loses authority", () => {
    match();
    store.withdraw("a");
    expect(store.snapshot("b").relationship).toBe(null);
    expect(store.snapshot("b").history[0].reason).toBe("withdrawn");
    expect(createEngine().photoAccess("a", "b")).toBe(false);
  });
  it("suspension and resubmission freeze both photo routes and both partner DTOs", () => {
    match();
    store.review("a", "suspended", "調査中");
    expect(store.snapshot("a").relationship).toBe(null);
    expect(store.snapshot("b").relationship).toBe(null);
    expect(store.photoAccess("a", "b")).toBe(false);
    expect(store.photoAccess("b", "a")).toBe(false);
    expect(() => store.generateIntroductions("b")).toThrow();
  });
  it("an incomplete preference hides inbound data and supersedes old requests", () => {
    const id = request();
    store.savePreference("b", preference("woman"), false);
    expect(store.snapshot("b").interests).toEqual([]);
    expect(() => store.respondInterest("b", id, true)).toThrow();
  });
  it("racing acceptances permit only the first relationship", () => {
    add("d");
    const first = request("a", "b");
    const second = request("d", "b");
    store.respondInterest("b", first, true);
    expect(() => store.respondInterest("b", second, true)).toThrow();
    expect(store.snapshot("b").relationship?.partner.id).toBe("a");
    expect(store.snapshot("d").relationship).toBe(null);
  });
  it("blocks disclosure of private report content and safety action in partner history", () => {
    const id = match();
    store.endRelationship("a", id, "blocked", "Private safety report");
    const right = store.snapshot("b");
    expect(JSON.stringify(right)).not.toContain("Private safety report");
    expect(right.history[0]).toMatchObject({
      reason: "staff",
      endedBy: "運営",
    });
    expect(store.staffSnapshot().reports[0].reason).toBe(
      "Private safety report",
    );
  });
  it("validates every hard constraint without relaxing zero results", () => {
    for (const change of [
      { regions: ["千葉県"] },
      { smoking: "no", smokingRequired: true },
      { timing: "within_two_years" },
      { children: "no", childrenRequired: true },
    ]) {
      const fixture = createEngine();
      fixture.register("x", "x@example.test");
      fixture.submitApplication("x", profile("woman", "x"));
      fixture.review("x", "approved", "");
      fixture.savePreference("x", { ...preference("man"), ...change }, true);
      fixture.register("y", "y@example.test");
      fixture.submitApplication("y", {
        ...profile("man", "y"),
        smoking: "smoking" in change ? "yes" : "no",
      });
      fixture.review("y", "approved", "");
      fixture.savePreference("y", preference("woman"), true);
      fixture.generateIntroductions("x");
      expect(fixture.snapshot("x").introductions).toEqual([]);
    }
  });
  it("does not expose arbitrary accounts through actions, and snapshots cannot mutate stores", () => {
    expect(() => store.savePartner("a", "b")).toThrow();
    expect(() => store.interest("a", "b")).toThrow();
    const state = store.snapshot("a");
    state.account.status = "suspended";
    required(state.account.profile).name = "tampered";
    expect(store.snapshot("a").account.profile?.name).toBe("a");
  });
  it("rejects applications and preferences below the minimum age", () => {
    store.register("underage", "underage@example.test");
    expect(() =>
      store.submitApplication("underage", {
        ...profile("woman", "underage"),
        age: 19,
      }),
    ).toThrow();
    expect(() =>
      store.savePreference("a", { ...preference("man"), ageMin: 19 }, true),
    ).toThrow();
  });
  it("staff termination releases a frozen relationship and preserves a neutral record", () => {
    const id = match();
    store.review("a", "suspended", "調査中");
    expect(store.snapshot("b").account).toMatchObject({
      relationshipId: id,
      relationshipLocked: true,
    });
    store.terminateRelationship(id);
    expect(store.snapshot("b").account.relationshipLocked).toBe(false);
    expect(store.snapshot("b").history[0]).toMatchObject({
      reason: "staff",
      endedBy: "運営",
    });
    expect(store.snapshot("a").account.status).toBe("suspended");
  });
  it("failed notification preparation leaves both records and the relationship unchanged", () => {
    const id = match();
    const before = store.snapshot("b");
    const stub = vi.spyOn(crypto, "randomUUID").mockImplementationOnce(() => {
      throw new Error("allocation failure");
    });
    expect(() => store.endRelationship("a", id, "declined")).toThrow(
      "allocation failure",
    );
    stub.mockRestore();
    expect(store.snapshot("a").account.relationshipLocked).toBe(true);
    expect(store.snapshot("b")).toEqual(before);
  });
  it("saves unanswered preferences as a draft without introducing or disclosing members", () => {
    store.savePreference(
      "a",
      { ...preference("man"), values: [], priorityValue: "", regions: [] },
      false,
    );
    expect(store.snapshot("a").account.preferenceComplete).toBe(false);
    expect(() => store.generateIntroductions("a")).toThrow();
    expect(() =>
      store.savePreference(
        "a",
        { ...preference("man"), values: [], priorityValue: "" },
        true,
      ),
    ).toThrow();
  });
});

it("shares the private preference note only with its author and staff", () => {
  store.savePreference(
    "a",
    { ...preference("man"), note: "運営への非公開相談" },
    true,
  );
  store.generateIntroductions("b");
  expect(store.snapshot("a").account.preference?.note).toBe(
    "運営への非公開相談",
  );
  expect(
    store.staffSnapshot().applications.find((a) => a.id === "a")?.preference
      ?.note,
  ).toBe("運営への非公開相談");
  expect(JSON.stringify(store.snapshot("b"))).not.toContain(
    "運営への非公開相談",
  );
});
