import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  type HistorySummary,
  type MemberState,
  type NotificationSummary,
  type PartnerSummary,
  type Preference,
  type Profile,
  regionOptions,
  type StaffState,
  type Status,
  valueOptions,
} from "./contracts";
import { members } from "./server/member-fixtures";

const text = (max: number) => z.string().trim().min(1).max(max);
const valueList = z
  .array(z.enum(valueOptions))
  .min(1)
  .max(3)
  .refine((v) => new Set(v).size === v.length);
const profileSchema = z.object({
  name: text(30),
  age: z.number().int().min(20).max(100),
  gender: z.enum(["woman", "man"]),
  location: z.enum(regionOptions),
  job: text(60),
  intro: text(200),
  story: text(1500),
  values: valueList,
  hobbies: z.array(text(30)).max(5),
  timing: z.enum(["within_year", "within_two_years", "discuss"]),
  lifestyle: z.enum(["quiet", "active", "balanced"]),
  smoking: z.enum(["no", "yes"]),
  children: z.enum(["yes", "no", "discuss", "undecided"]),
  consent: z.literal(true),
});
const preferenceBaseSchema = z.object({
  target: z.enum(["woman", "man"]),
  ageMin: z.number().int().min(20).max(100),
  ageMax: z.number().int().min(20).max(100),
  ageRequired: z.boolean(),
  regions: z.array(z.enum(regionOptions)).max(5),
  regionRequired: z.boolean(),
  values: valueList,
  priorityValue: z.enum(valueOptions),
  timing: z.enum(["within_year", "within_two_years", "discuss"]),
  timingRequired: z.boolean(),
  lifestyle: z.enum(["quiet", "active", "balanced", "any"]),
  smoking: z.enum(["no", "any"]),
  smokingRequired: z.boolean(),
  children: z.enum(["yes", "no", "discuss", "undecided", "any"]),
  childrenRequired: z.boolean(),
  note: z.string().trim().max(300),
});
const preferenceDraftSchema = preferenceBaseSchema.extend({
  values: z.array(z.enum(valueOptions)).max(3),
  priorityValue: z.union([z.enum(valueOptions), z.literal("")]),
});
const preferenceSchema = preferenceBaseSchema.refine(
  (p) =>
    p.ageMin <= p.ageMax &&
    p.values.includes(p.priorityValue) &&
    (!p.regionRequired || p.regions.length > 0),
);
type Account = {
  id: string;
  email: string;
  status: Status;
  reviewNote: string;
  profile: Profile | null;
  preference: Preference | null;
  preferenceComplete: boolean;
  hasPhoto: boolean;
  photoKey: string | null;
  demo: boolean;
  revision: number;
  batchRevision: number | null;
  introductions: string[];
  saved: Set<string>;
  excluded: Set<string>;
  notifications: NotificationSummary[];
  history: HistorySummary[];
};
type Request = {
  id: string;
  from: string;
  to: string;
  createdAt: number;
  expiresAt: number;
  state:
    | "pending"
    | "accepted"
    | "declined"
    | "cancelled"
    | "expired"
    | "superseded";
};
type Relationship = {
  id: string;
  left: string;
  right: string;
  startedAt: number;
  endedAt: number | null;
  meeting: {
    date: string;
    note: string;
    status: "requested" | "confirmed" | "completed";
  } | null;
};
function deny(): never {
  throw new Error("現在、この操作は利用できません。");
}
function required<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) return deny();
  return value;
}
function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error("入力内容を確認してください。");
  return result.data;
}
export function createEngine(seed = false) {
  const accountStore = new Map<string, Account>();
  const requestStore = new Map<string, Request>();
  const relationshipStore = new Map<string, Relationship>();
  const reports: StaffState["reports"] = [];
  const account = (id: string) => {
    const result = accountStore.get(id);
    if (!result) throw new Error("ログインし直してください。");
    return result;
  };
  const active = (id: string) =>
    [...relationshipStore.values()].find(
      (r) => r.endedAt === null && (r.left === id || r.right === id),
    );
  const eligible = (a: Account) =>
    a.status === "approved" &&
    a.profile?.consent === true &&
    a.preferenceComplete &&
    a.preference !== null;
  const requireEligible = (id: string) => {
    const a = account(id);
    if (!eligible(a)) deny();
    return a;
  };
  const requireFree = (id: string) => {
    const a = requireEligible(id);
    if (active(id)) deny();
    return a;
  };
  const other = (r: Relationship, id: string) => {
    if (r.left !== id && r.right !== id) deny();
    return r.left === id ? r.right : r.left;
  };
  const notify = (id: string, message: string) => {
    account(id).notifications.push({
      id: randomUUID(),
      text: message,
      createdAt: Date.now(),
      read: false,
    });
  };
  const available = (a: Account) => eligible(a) && !active(a.id);
  const meets = (a: Account, b: Account) => {
    const p = required(a.preference),
      q = required(b.profile);
    return (
      p.target === q.gender &&
      (!p.ageRequired || (q.age >= p.ageMin && q.age <= p.ageMax)) &&
      (!p.regionRequired || p.regions.includes(q.location)) &&
      (!p.smokingRequired || p.smoking === "any" || p.smoking === q.smoking) &&
      (!p.timingRequired || p.timing === q.timing) &&
      (!p.childrenRequired || p.children === "any" || p.children === q.children)
    );
  };
  const compatible = (a: Account, b: Account) =>
    a.id !== b.id &&
    available(a) &&
    available(b) &&
    !a.excluded.has(b.id) &&
    !b.excluded.has(a.id) &&
    meets(a, b) &&
    meets(b, a);
  const score = (a: Account, b: Account) => {
    const p = required(a.preference),
      q = required(b.profile);
    return (
      p.values.filter((v) => q.values.includes(v)).length * 3 +
      (q.values.includes(p.priorityValue) ? 3 : 0) +
      (p.regions.includes(q.location) ? 1 : 0) +
      (q.age >= p.ageMin && q.age <= p.ageMax ? 1 : 0) +
      (q.timing === p.timing ? 1 : 0) +
      (q.lifestyle === p.lifestyle ? 1 : 0)
    );
  };
  const summary = (a: Account, b: Account): PartnerSummary => {
    const p = required(a.preference),
      q = required(b.profile);
    const reasons = p.values
      .filter((v) => q.values.includes(v))
      .map((v) => `「${v}」という想いが重なります`);
    if (p.timing === q.timing && p.timing !== "discuss")
      reasons.push("結婚を考える時期が重なります");
    if (p.regions.includes(q.location))
      reasons.push("希望する地域にお住まいです");
    const discussion: string[] = [];
    if (p.timing !== q.timing || q.timing === "discuss")
      discussion.push("結婚を考える時期");
    if (
      q.children === "discuss" ||
      q.children === "undecided" ||
      p.children !== q.children
    )
      discussion.push("子どもについての考え方");
    if (p.lifestyle !== "any" && p.lifestyle !== q.lifestyle)
      discussion.push("休日の過ごし方");
    return {
      id: b.id,
      name: q.name,
      ageBand: `${Math.floor(q.age / 10) * 10}代${q.age % 10 < 5 ? "前半" : "後半"}`,
      location: q.location,
      job: q.job,
      intro: q.intro,
      story: q.story,
      values: [...q.values],
      hobbies: [...q.hobbies],
      reasons,
      discussion,
      saved: a.saved.has(b.id),
      hasPhoto: b.hasPhoto,
    };
  };
  const invalidate = (ids: string[], except?: string) => {
    for (const a of accountStore.values()) {
      if (ids.includes(a.id)) {
        a.introductions = [];
        a.batchRevision = null;
        a.saved.clear();
      } else
        a.introductions = a.introductions.filter((id) => !ids.includes(id));
    }
    for (const r of requestStore.values())
      if (
        r.id !== except &&
        r.state === "pending" &&
        (ids.includes(r.from) || ids.includes(r.to))
      ) {
        r.state = "superseded";
        notify(r.from, "このご紹介の受付は終了しました。");
        notify(r.to, "このご紹介の受付は終了しました。");
      }
  };
  const expire = () => {
    for (const r of requestStore.values())
      if (r.state === "pending" && r.expiresAt <= Date.now()) {
        r.state = "expired";
        notify(r.from, "お話し希望の受付期限が終了しました。");
        notify(r.to, "お話し希望の受付期限が終了しました。");
      }
  };
  const end = (
    id: string,
    relationshipId: string,
    reason: HistorySummary["reason"],
    reportNote?: string,
  ) => {
    const actor = account(id),
      r = relationshipStore.get(relationshipId);
    if (!r) deny();
    const partnerId = other(r, id);
    if (r.endedAt !== null) return;
    const partner = account(partnerId),
      endedAt = Date.now(),
      actorName = required(actor.profile).name;
    const history = (b: Account): HistorySummary => ({
      id: r.id,
      partnerName: required(b.profile).name,
      endedBy: actorName,
      endedAt,
      reason,
    });
    const leftEvent = history(partner),
      rightEvent = history(actor);
    if (reason === "staff") {
      leftEvent.endedBy = "運営";
      rightEvent.endedBy = "運営";
    }
    if (reason === "blocked") {
      rightEvent.endedBy = "運営";
      rightEvent.reason = "staff";
    }
    const message =
      reason === "blocked" || reason === "staff"
        ? "このご縁は終了しました。次の紹介を受けられる状態になりました。"
        : reason === "withdrawn"
          ? `${actorName}さんの退会により、このご縁は終了しました。次の紹介を受けられる状態になりました。`
          : `${actorName}さんが「このご縁を終了する」を選択しました。おふたりとも、次の紹介を受けられる状態になりました。`;
    const actorNotice: NotificationSummary = {
      id: randomUUID(),
      text:
        reason === "staff"
          ? "運営により、このご縁は終了しました。次の紹介を受けられる状態になりました。"
          : "このご縁を終了し、お相手への通知を保存しました。",
      createdAt: endedAt,
      read: false,
    };
    const partnerNotice: NotificationSummary = {
      id: randomUUID(),
      text: message,
      createdAt: endedAt,
      read: false,
    };
    const report =
      reason === "blocked"
        ? {
            id: randomUUID(),
            reporterName: actorName,
            partnerName: required(partner.profile).name,
            reason: reportNote || "ブロック",
            createdAt: endedAt,
          }
        : null;
    // Prepare all records before committing. This synchronous transaction has no I/O or yield points.
    actor.history.push(leftEvent);
    partner.history.push(rightEvent);
    actor.notifications.push(actorNotice);
    partner.notifications.push(partnerNotice);
    actor.excluded.add(partnerId);
    partner.excluded.add(id);
    actor.introductions = [];
    partner.introductions = [];
    actor.batchRevision = null;
    partner.batchRevision = null;
    if (report) reports.push(report);
    r.endedAt = endedAt;
  };
  const api = {
    register(id: string, email: string) {
      if (
        accountStore.has(id) ||
        [...accountStore.values()].some((a) => a.email === email.toLowerCase())
      )
        throw new Error("このアカウントは登録済みです。");
      if (!id || !z.string().email().safeParse(email).success)
        throw new Error("メールアドレスを確認してください。");
      accountStore.set(id, {
        id,
        email: email.toLowerCase(),
        status: "draft",
        reviewNote: "",
        profile: null,
        preference: null,
        preferenceComplete: false,
        hasPhoto: false,
        photoKey: null,
        demo: false,
        revision: 0,
        batchRevision: null,
        introductions: [],
        saved: new Set(),
        excluded: new Set(),
        notifications: [],
        history: [],
      });
    },
    submitApplication(id: string, input: unknown) {
      const a = account(id);
      if (["withdrawn", "suspended", "rejected"].includes(a.status)) deny();
      const profile = parse(profileSchema, input);
      a.profile = profile;
      a.status = "pending";
      a.reviewNote = "";
      invalidate([id]);
    },
    savePreference(id: string, input: unknown, complete: boolean) {
      const a = account(id);
      if (["withdrawn", "suspended", "rejected"].includes(a.status)) deny();
      const preference = parse(
        complete ? preferenceSchema : preferenceDraftSchema,
        input,
      );
      a.preference = preference;
      a.preferenceComplete = complete;
      a.revision++;
      a.batchRevision = null;
      invalidate([id]);
    },
    review(
      id: string,
      status: "approved" | "needs_changes" | "rejected" | "suspended",
      note: string,
    ) {
      const a = account(id);
      if (
        !["approved", "needs_changes", "rejected", "suspended"].includes(
          status,
        ) ||
        a.status === "withdrawn" ||
        !a.profile
      )
        deny();
      const reviewNote = z.string().max(500).parse(note);
      a.status = status;
      a.reviewNote = reviewNote;
      if (status !== "approved") invalidate([id]);
      notify(
        id,
        status === "approved"
          ? "入会審査が完了しました。"
          : status === "needs_changes"
            ? "申請内容の追加確認が必要です。"
            : "入会状況が更新されました。",
      );
    },
    generateIntroductions(id: string) {
      const a = requireFree(id);
      if (a.batchRevision === a.revision) return;
      a.introductions = [...accountStore.values()]
        .filter((b) => compatible(a, b))
        .sort((b, c) => score(a, c) - score(a, b) || b.id.localeCompare(c.id))
        .slice(0, 5)
        .map((b) => b.id);
      a.batchRevision = a.revision;
    },
    interest(id: string, partnerId: string) {
      expire();
      const a = requireFree(id),
        b = requireFree(partnerId);
      if (!a.introductions.includes(partnerId) || !compatible(a, b)) deny();
      const previous = [...requestStore.values()].find(
        (r) => r.from === id && r.state === "pending",
      );
      if (previous) {
        if (previous.to === partnerId) return;
        throw new Error(
          "送信済みのお話し希望にお返事が届くまでお待ちください。",
        );
      }
      const reciprocal = [...requestStore.values()].find(
        (r) => r.from === partnerId && r.to === id && r.state === "pending",
      );
      if (reciprocal) {
        api.respondInterest(id, reciprocal.id, true);
        return;
      }
      const createdAt = Date.now();
      const request: Request = {
        id: randomUUID(),
        from: id,
        to: partnerId,
        createdAt,
        expiresAt: createdAt + 14 * 24 * 60 * 60 * 1000,
        state: "pending",
      };
      requestStore.set(request.id, request);
      notify(
        partnerId,
        `${required(a.profile).name}さんからお話し希望が届きました。`,
      );
    },
    respondInterest(id: string, requestId: string, accept: boolean) {
      expire();
      const r = requestStore.get(requestId);
      if (!r || r.to !== id || r.state !== "pending") deny();
      const a = requireFree(id),
        b = requireFree(r.from);
      if (!compatible(a, b) || !b.introductions.includes(id)) deny();
      if (!accept) {
        r.state = "declined";
        a.excluded.add(b.id);
        b.excluded.add(id);
        a.introductions = a.introductions.filter((p) => p !== b.id);
        b.introductions = b.introductions.filter((p) => p !== id);
        notify(
          b.id,
          `${required(a.profile).name}さんへのお話し希望は見送りとなりました。`,
        );
        return;
      }
      const relation: Relationship = {
        id: randomUUID(),
        left: id,
        right: b.id,
        startedAt: Date.now(),
        endedAt: null,
        meeting: null,
      };
      r.state = "accepted";
      relationshipStore.set(relation.id, relation);
      invalidate([id, b.id], r.id);
      notify(id, `${required(b.profile).name}さんとのご縁が成立しました。`);
      notify(b.id, `${required(a.profile).name}さんとのご縁が成立しました。`);
    },
    cancelInterest(id: string, requestId: string) {
      account(id);
      const r = requestStore.get(requestId);
      if (!r || r.from !== id || r.state !== "pending") deny();
      r.state = "cancelled";
      notify(
        r.to,
        `${required(account(id).profile).name}さんがお話し希望を取り下げました。`,
      );
    },
    savePartner(id: string, partnerId: string) {
      const a = requireFree(id),
        b = account(partnerId);
      if (!a.introductions.includes(partnerId) || !compatible(a, b)) deny();
      if (a.saved.has(partnerId)) a.saved.delete(partnerId);
      else a.saved.add(partnerId);
    },
    dismiss(id: string, partnerId: string) {
      const a = requireFree(id);
      if (!a.introductions.includes(partnerId)) deny();
      if (
        [...requestStore.values()].some(
          (r) =>
            r.state === "pending" &&
            ((r.from === id && r.to === partnerId) ||
              (r.to === id && r.from === partnerId)),
        )
      )
        throw new Error("お話し希望への返答、または取り下げを行ってください。");
      a.excluded.add(partnerId);
      a.introductions = a.introductions.filter((p) => p !== partnerId);
      a.saved.delete(partnerId);
    },
    endRelationship(
      id: string,
      relationshipId: string,
      reason: "declined" | "blocked",
      reportNote?: string,
    ) {
      if (!["declined", "blocked"].includes(reason)) deny();
      if (reportNote !== undefined) z.string().max(1000).parse(reportNote);
      end(id, relationshipId, reason, reportNote);
    },
    terminateRelationship(relationshipId: string) {
      const r = relationshipStore.get(relationshipId);
      if (!r) deny();
      end(r.left, relationshipId, "staff");
    },
    markRead(id: string, noticeId: string) {
      const notice = account(id).notifications.find((n) => n.id === noticeId);
      if (!notice) deny();
      notice.read = true;
    },
    setMeeting(id: string, relationshipId: string, date: string, note: string) {
      requireEligible(id);
      const r = active(id);
      if (!r || r.id !== relationshipId || !eligible(account(other(r, id))))
        deny();
      if (
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        Date.parse(date) <= Date.now()
      )
        throw new Error("今後の日時を選んでください。");
      r.meeting = {
        date,
        note: z.string().trim().max(300).parse(note),
        status: "requested",
      };
      notify(other(r, id), "面談希望の日時が届きました。");
    },
    confirmMeeting(relationshipId: string, status: "confirmed" | "completed") {
      const r = relationshipStore.get(relationshipId);
      if (
        !r ||
        r.endedAt !== null ||
        !r.meeting ||
        !["confirmed", "completed"].includes(status) ||
        !eligible(account(r.left)) ||
        !eligible(account(r.right))
      )
        deny();
      required(r.meeting).status = status;
      notify(r.left, "面談の状況が更新されました。");
      notify(r.right, "面談の状況が更新されました。");
    },
    withdraw(id: string) {
      const a = account(id);
      const r = active(id);
      if (r) end(id, r.id, "withdrawn");
      a.status = "withdrawn";
      invalidate([id]);
    },
    snapshot(id: string): MemberState {
      expire();
      const a = account(id),
        r = active(id);
      const canView = eligible(a);
      const partner = r ? account(other(r, id)) : null;
      const relation =
        canView && r && partner && eligible(partner)
          ? {
              id: r.id,
              partner: summary(a, partner),
              photoUrl:
                api.photoAccess(id, partner.id) && partner.hasPhoto
                  ? `/api/portraits/${partner.id}`
                  : null,
              startedAt: r.startedAt,
              meeting: r.meeting,
            }
          : null;
      return structuredClone({
        account: {
          id: a.id,
          email: a.email,
          status: a.status,
          reviewNote: a.reviewNote,
          profile: a.profile,
          preference: a.preference,
          preferenceComplete: a.preferenceComplete,
          relationshipId: r?.id ?? null,
          relationshipLocked: !!r,
          hasPhoto: a.hasPhoto,
          theme: a.profile?.gender === "woman" ? "rose" : "sage",
        },
        introductions:
          canView && !r
            ? a.introductions
                .map((p) => accountStore.get(p))
                .filter((b): b is Account => !!b && compatible(a, b))
                .map((b) => summary(a, b))
            : [],
        interests:
          canView && !r
            ? [...requestStore.values()]
                .filter(
                  (q) =>
                    q.state === "pending" && (q.from === id || q.to === id),
                )
                .filter((q) =>
                  compatible(a, account(q.from === id ? q.to : q.from)),
                )
                .map((q) => ({
                  id: q.id,
                  partner: summary(a, account(q.from === id ? q.to : q.from)),
                  direction:
                    q.from === id
                      ? ("outgoing" as const)
                      : ("incoming" as const),
                  createdAt: q.createdAt,
                }))
            : [],
        relationship: relation,
        notifications: a.notifications,
        history: a.history,
        introductionGenerated: a.batchRevision !== null,
        isDemo: a.demo,
      });
    },
    staffSnapshot(): StaffState {
      return structuredClone({
        applications: [...accountStore.values()].map((a) => ({
          id: a.id,
          email: a.email,
          status: a.status,
          profile: a.profile,
          preference: a.preference,
          note: a.reviewNote,
        })),
        meetings: [...relationshipStore.values()]
          .filter((r) => r.endedAt === null && r.meeting !== null)
          .map((r) => ({
            id: r.id,
            names: [
              required(account(r.left).profile).name,
              required(account(r.right).profile).name,
            ],
            ...required(r.meeting),
          })),
        relationships: [...relationshipStore.values()]
          .filter((r) => r.endedAt === null)
          .map((r) => ({
            id: r.id,
            names: [
              required(account(r.left).profile).name,
              required(account(r.right).profile).name,
            ],
            restricted:
              !eligible(account(r.left)) || !eligible(account(r.right)),
          })),
        reports,
      });
    },
    photoAccess(viewerId: string, partnerId: string) {
      const a = accountStore.get(viewerId),
        b = accountStore.get(partnerId);
      if (!a || !b || a.status === "withdrawn" || b.status === "withdrawn")
        return false;
      if (viewerId === partnerId) return true;
      const r = active(viewerId);
      return (
        !!r && other(r, viewerId) === partnerId && eligible(a) && eligible(b)
      );
    },
    hasAccount(id: string) {
      return accountStore.has(id);
    },
    seedAccounts() {
      return [...accountStore.values()]
        .filter((a) => a.demo)
        .map((a) => ({ id: a.id, email: a.email }));
    },
    setPhoto(id: string, hasPhoto: boolean) {
      account(id).hasPhoto = hasPhoto;
    },
    partnerPhotoKey(id: string) {
      return account(id).photoKey;
    },
  };
  if (seed) {
    for (const member of members) {
      api.register(member.id, `member-${member.id}@example.test`);
      const a = account(member.id);
      a.profile = {
        name: member.name,
        age: member.age,
        gender: member.gender,
        location: member.location,
        job: member.job,
        intro: member.intro,
        story: member.story,
        values: member.values,
        hobbies: member.hobbies,
        timing: "within_two_years",
        lifestyle: "balanced",
        smoking: "no",
        children: "discuss",
        consent: true,
      };
      a.status = "approved";
      a.preference = {
        target: member.gender === "woman" ? "man" : "woman",
        ageMin: 20,
        ageMax: 80,
        ageRequired: false,
        regions: [],
        regionRequired: false,
        values: member.values,
        priorityValue: member.values[0],
        timing: "within_two_years",
        timingRequired: false,
        lifestyle: "any",
        smoking: "any",
        smokingRequired: false,
        children: "any",
        childrenRequired: false,
        note: "",
      };
      a.preferenceComplete = true;
      a.demo = true;
      a.hasPhoto = true;
      a.photoKey = required(member.photo.split("/").at(-1));
    }
    api.generateIntroductions("m1");
    api.generateIntroductions("m7");
    api.interest("m1", "m7");
    const seeded = [...requestStore.values()].find(
      (r) => r.from === "m1" && r.to === "m7" && r.state === "pending",
    );
    if (seeded) api.respondInterest("m7", seeded.id, true);
  }
  return api;
}
const globalEngine = globalThis as typeof globalThis & {
  towariEngine?: ReturnType<typeof createEngine>;
};
export const engine =
  globalEngine.towariEngine ??
  createEngine(process.env.TOWARI_DEMO_ENABLED === "true");
globalEngine.towariEngine = engine;
