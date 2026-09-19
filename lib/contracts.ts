export const valueOptions = [
  "何気ない日常を大切に",
  "お互いを尊重したい",
  "家族との時間",
  "穏やかな暮らし",
  "一緒に新しい体験を",
  "対話を大切に",
] as const;
export const regionOptions = [
  "東京都",
  "神奈川県",
  "千葉県",
  "埼玉県",
  "その他",
] as const;
type Gender = "woman" | "man";
export type Status =
  | "draft"
  | "pending"
  | "needs_changes"
  | "approved"
  | "rejected"
  | "suspended"
  | "withdrawn";
export type Profile = {
  name: string;
  age: number;
  gender: Gender;
  location: string;
  job: string;
  intro: string;
  story: string;
  values: string[];
  hobbies: string[];
  timing: "within_year" | "within_two_years" | "discuss";
  lifestyle: "quiet" | "active" | "balanced";
  smoking: "no" | "yes";
  children: "yes" | "no" | "discuss" | "undecided";
  consent: boolean;
};
export type Preference = {
  target: Gender;
  ageMin: number;
  ageMax: number;
  ageRequired: boolean;
  regions: string[];
  regionRequired: boolean;
  values: string[];
  priorityValue: string;
  timing: "within_year" | "within_two_years" | "discuss";
  timingRequired: boolean;
  lifestyle: "quiet" | "active" | "balanced" | "any";
  smoking: "no" | "any";
  smokingRequired: boolean;
  children: "yes" | "no" | "discuss" | "undecided" | "any";
  childrenRequired: boolean;
  note: string;
};
export type PartnerSummary = {
  id: string;
  name: string;
  ageBand: string;
  location: string;
  job: string;
  intro: string;
  story: string;
  values: string[];
  hobbies: string[];
  reasons: string[];
  discussion: string[];
  saved: boolean;
  hasPhoto: boolean;
};
type InterestSummary = {
  id: string;
  partner: PartnerSummary;
  direction: "incoming" | "outgoing";
  createdAt: number;
};
type RelationshipSummary = {
  id: string;
  partner: PartnerSummary;
  photoUrl: string | null;
  startedAt: number;
  meeting: {
    date: string;
    note: string;
    status: "requested" | "confirmed" | "completed";
  } | null;
};
export type NotificationSummary = {
  id: string;
  text: string;
  createdAt: number;
  read: boolean;
};
export type HistorySummary = {
  id: string;
  partnerName: string;
  endedBy: string;
  endedAt: number;
  reason: "declined" | "blocked" | "withdrawn" | "staff";
};
export type MemberState = {
  account: {
    id: string;
    email: string;
    status: Status;
    reviewNote: string;
    profile: Profile | null;
    preference: Preference | null;
    preferenceComplete: boolean;
    relationshipId: string | null;
    relationshipLocked: boolean;
    hasPhoto: boolean;
    theme: "rose" | "sage";
  };
  introductions: PartnerSummary[];
  interests: InterestSummary[];
  relationship: RelationshipSummary | null;
  notifications: NotificationSummary[];
  history: HistorySummary[];
  introductionGenerated: boolean;
  isDemo: boolean;
};
export type StaffState = {
  relationships: { id: string; names: string[]; restricted: boolean }[];
  applications: {
    id: string;
    email: string;
    status: Status;
    profile: Profile | null;
    preference: Preference | null;
    note: string;
  }[];
  meetings: {
    id: string;
    names: string[];
    date: string;
    note: string;
    status: string;
  }[];
  reports: {
    id: string;
    reporterName: string;
    partnerName: string;
    reason: string;
    createdAt: number;
  }[];
};
export type ActionResult = { ok: true } | { ok: false; error: string };
