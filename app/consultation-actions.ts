"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import type { ActionResult } from "@/lib/contracts";
import { removePhoto, storePhoto } from "@/lib/server/photos";
import {
  auth,
  engine,
  memberId,
  prepareDemo,
  requireStaff,
  SESSION_COOKIE,
  setSession,
} from "@/lib/server/runtime";

const credentials = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("メールアドレスを確認してください")
    .max(254),
  password: z.string().min(1).max(128),
});
async function handle(work: () => void | Promise<void>): Promise<ActionResult> {
  try {
    await work();
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    if (error instanceof z.ZodError)
      return {
        ok: false,
        error: error.issues[0]?.message ?? "入力内容を確認してください。",
      };
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "処理できませんでした。もう一度お試しください。",
    };
  }
}
export async function registerAccount(input: unknown) {
  return handle(async () => {
    const data = credentials.parse(input);
    prepareDemo();
    const id = auth.register(data.email, data.password);
    try {
      engine.register(id, data.email);
    } catch (error) {
      auth.discardRegistration(id);
      throw error;
    }
    await setSession(auth.issue({ role: "member", accountId: id }));
  });
}
export async function loginAccount(input: unknown) {
  return handle(async () => {
    const data = credentials.parse(input);
    prepareDemo();
    const id = auth.login(data.email, data.password);
    if (!engine.hasAccount(id))
      throw new Error("アカウントが見つかりません。再登録をお願いします。");
    if (engine.snapshot(id).account.status === "withdrawn")
      throw new Error("退会済みのアカウントです。");
    await setSession(auth.issue({ role: "member", accountId: id }));
  });
}
export async function logoutAccount() {
  return handle(async () => {
    const jar = await cookies();
    auth.revoke(jar.get(SESSION_COOKIE)?.value);
    jar.delete(SESSION_COOKIE);
  });
}
export async function submitApplication(input: unknown) {
  return handle(async () => engine.submitApplication(await memberId(), input));
}
export async function savePreference(input: unknown, complete: boolean) {
  return handle(async () => {
    z.boolean().parse(complete);
    engine.savePreference(await memberId(), input, complete);
  });
}
export async function generateIntroductions() {
  return handle(async () => engine.generateIntroductions(await memberId()));
}
export async function sendInterest(partnerId: string) {
  return handle(async () => engine.interest(await memberId(), partnerId));
}
export async function respondInterest(requestId: string, accept: boolean) {
  return handle(async () => {
    z.boolean().parse(accept);
    engine.respondInterest(await memberId(), requestId, accept);
  });
}
export async function cancelInterest(requestId: string) {
  return handle(async () => engine.cancelInterest(await memberId(), requestId));
}
export async function savePartner(partnerId: string) {
  return handle(async () => engine.savePartner(await memberId(), partnerId));
}
export async function dismissPartner(partnerId: string) {
  return handle(async () => engine.dismiss(await memberId(), partnerId));
}
export async function endRelationship(
  relationshipId: string,
  reason: "declined" | "blocked",
  reportNote?: string,
) {
  return handle(async () =>
    engine.endRelationship(
      await memberId(),
      relationshipId,
      reason,
      reportNote,
    ),
  );
}
export async function markNotificationRead(id: string) {
  return handle(async () => engine.markRead(await memberId(), id));
}
export async function requestMeeting(
  relationshipId: string,
  date: string,
  note: string,
) {
  return handle(async () =>
    engine.setMeeting(await memberId(), relationshipId, date, note),
  );
}
export async function withdrawAccount() {
  return handle(async () => {
    const id = await memberId();
    engine.withdraw(id);
    removePhoto(id);
    auth.revokeAccount(id);
    (await cookies()).delete(SESSION_COOKIE);
  });
}
export async function uploadPhoto(formData: FormData) {
  return handle(async () => {
    const id = await memberId();
    const file = formData.get("photo");
    if (!(file instanceof File)) throw new Error("写真を選んでください。");
    await storePhoto(id, file);
  });
}
export async function staffLogin(password: string) {
  return handle(async () => {
    const token = auth.staffLogin(password, process.env.TONARI_ADMIN_PASSWORD);
    await setSession(token);
  });
}
export async function staffReview(
  id: string,
  status: "approved" | "needs_changes" | "rejected" | "suspended",
  note: string,
) {
  return handle(async () => {
    await requireStaff();
    engine.review(id, status, note);
  });
}
export async function staffConfirmMeeting(
  id: string,
  status: "confirmed" | "completed",
) {
  return handle(async () => {
    await requireStaff();
    engine.confirmMeeting(id, status);
  });
}
export async function staffEndRelationship(id: string) {
  return handle(async () => {
    await requireStaff();
    engine.terminateRelationship(id);
  });
}
