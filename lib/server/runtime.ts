import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { engine } from "@/lib/engine";
export const SESSION_COOKIE = "towari_session_v2";
export function prepareDemo() {
  const secret = process.env.TOWARI_DEMO_PASSWORD;
  if (
    process.env.TOWARI_DEMO_ENABLED === "true" &&
    secret &&
    secret.length >= 12
  ) {
    for (const account of engine.seedAccounts())
      auth.seed(account.email, secret, account.id);
  }
}
export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = auth.read(token);
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
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
}
export { auth, engine };
