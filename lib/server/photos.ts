import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { engine } from "@/lib/engine";

const shared = globalThis as unknown as { tonariPhotos?: Map<string, Buffer> };
shared.tonariPhotos ??= new Map<string, Buffer>();
const photoStore = shared.tonariPhotos;
export async function storePhoto(id: string, file: File) {
  const state = engine.snapshot(id);
  if (["withdrawn", "suspended", "rejected"].includes(state.account.status))
    throw new Error("現在、写真を変更できません。");
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size === 0 ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error("写真は5MB以内のJPEG・PNG・WebPを選んでください。");
  let image: Buffer;
  try {
    image = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 20_000_000,
      animated: false,
    })
      .rotate()
      .resize({
        width: 1000,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    throw new Error("画像を読み込めませんでした。別の写真を選んでください。");
  }
  // Recheck after asynchronous decoding in case account was withdrawn meanwhile.
  if (
    ["withdrawn", "suspended", "rejected"].includes(
      engine.snapshot(id).account.status,
    )
  )
    throw new Error("現在、写真を変更できません。");
  photoStore.set(id, image);
  engine.setPhoto(id, true);
}
export async function readPhoto(id: string) {
  const uploaded = photoStore.get(id);
  if (uploaded) return { bytes: uploaded, type: "image/jpeg" };
  const key = engine.partnerPhotoKey(id);
  if (!key || !/^[-a-z0-9]+\.png$/.test(key)) return null;
  try {
    return {
      bytes: await readFile(join(process.cwd(), "private", "portraits", key)),
      type: "image/png",
    };
  } catch {
    return null;
  }
}
export function removePhoto(id: string) {
  photoStore.delete(id);
  engine.setPhoto(id, false);
}
