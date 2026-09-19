import { readPhoto } from "@/lib/server/photos";
import { engine, getSession } from "@/lib/server/runtime";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const privacyHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'",
};
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (
    !session?.accountId ||
    session.role !== "member" ||
    !engine.photoAccess(session.accountId, id)
  )
    return new Response(null, { status: 404, headers: privacyHeaders });
  const photo = await readPhoto(id);
  // Membership and relationship may have changed while reading the fixture file.
  const freshSession = await getSession();
  if (
    !photo ||
    freshSession?.role !== "member" ||
    freshSession.accountId !== session.accountId ||
    !engine.photoAccess(session.accountId, id)
  )
    return new Response(null, { status: 404, headers: privacyHeaders });
  return new Response(new Uint8Array(photo.bytes), {
    headers: { ...privacyHeaders, "Content-Type": photo.type },
  });
}
