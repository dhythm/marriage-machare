import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { engine } from "@/lib/engine";
export const SESSION_COOKIE = "tonari_session_v2";
export const DEMO_COOKIE = "tonari_demo_user";

function isDemoMember(id: string) {
  return engine.seedAccounts().some((account) => account.id === id);
}
export function prepareDemo() {
  if (process.env.TONARI_DEMO_ENABLED !== "true") return;
  const secret = process.env.TONARI_DEMO_PASSWORD;
  if (!secret || secret.length < 8) {
    console.warn(
      "TONARI_DEMO_PASSWORD は8文字以上で設定してください。デモ会員は登録されません。",
    );
    return;
  }
  for (const account of engine.seedAccounts())
    auth.seed(account.email, secret, account.id);
}
export async function getSession() {
  const jar = await cookies();
  const demoId = jar.get(DEMO_COOKIE)?.value;
  if (
    process.env.TONARI_DEMO_ENABLED === "true" &&
    demoId &&
    isDemoMember(demoId)
  )
    return { role: "member" as const, accountId: demoId };
  const session = auth.read(jar.get(SESSION_COOKIE)?.value);
  if (
    session?.role === "member" &&
    (!session.accountId || !engine.hasAccount(session.accountId))
  )
    return null;
  return session;
}
export async function memberId() {
  const session = await getSession();
  if (session?.role !== "member" || !session.accountId)
    throw new Error("ログインし直してください。");
  return session.accountId;
}
export async function requireMemberPage() {
  const session = await getSession();
  if (session?.role !== "member" || !session.accountId) redirect("/login");
  return session.accountId;
}
export async function requireStaff() {
  const session = await getSession();
  if (session?.role !== "staff")
    throw new Error("運営アカウントでログインしてください。");
}
export async function setSession(token: string) {
  const jar = await cookies();
  auth.revoke(jar.get(SESSION_COOKIE)?.value);
  jar.delete(DEMO_COOKIE);
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
}
export async function assumeDemoMember(id: string) {
  if (process.env.TONARI_DEMO_ENABLED !== "true" || !isDemoMember(id))
    throw new Error("デモ会員が見つかりません。");
  const jar = await cookies();
  auth.revoke(jar.get(SESSION_COOKIE)?.value);
  jar.delete(SESSION_COOKIE);
  jar.set(DEMO_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}
export function demoMembers() {
  return engine.seedAccounts().map((account) => {
    const profile = engine.snapshot(account.id).account.profile;
    return {
      id: account.id,
      name: profile?.name ?? account.email,
      gender: profile?.gender ?? ("woman" as const),
    };
  });
}
export { auth, engine };
