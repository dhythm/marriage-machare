import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("メールアドレスを確認してください")
  .max(254);
const passwordSchema = z
  .string()
  .min(12, "パスワードは12文字以上で入力してください")
  .max(128, "パスワードは128文字以内です");
type Credential = { id: string; salt: string; hash: Buffer };
type Session = {
  role: "member" | "staff";
  accountId?: string;
  expires: number;
};
export function createAuth(now: () => number = Date.now) {
  const credentials = new Map<string, Credential>();
  const sessions = new Map<string, Session>();
  const attempts = new Map<string, { count: number; reset: number }>();
  function limit(key: string, max = 8) {
    for (const [k, v] of attempts) if (v.reset < now()) attempts.delete(k);
    const record = attempts.get(key) ?? {
      count: 0,
      reset: now() + 15 * 60 * 1000,
    };
    record.count++;
    attempts.set(key, record);
    if (record.count > max)
      throw new Error("試行回数が多いため、しばらく待ってからお試しください。");
  }
  function register(email: unknown, password: unknown, id = randomUUID()) {
    limit("registration", 50);
    const normalized = emailSchema.parse(email);
    const secret = passwordSchema.parse(password);
    if (credentials.has(normalized))
      throw new Error(
        "このメールアドレスは登録できません。ログインをご確認ください。",
      );
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(secret, salt, 64);
    credentials.set(normalized, { id, salt, hash });
    return id;
  }
  function login(email: unknown, password: unknown) {
    limit("login-global", 100);
    const normalized = emailSchema.parse(email);
    limit(`login:${normalized}`);
    if (typeof password !== "string" || password.length > 128)
      throw new Error("メールアドレスまたはパスワードが違います。");
    const credential = credentials.get(normalized);
    const hash = scryptSync(
      password,
      credential?.salt ?? "invalid-login-salt",
      64,
    );
    if (!credential || !timingSafeEqual(credential.hash, hash))
      throw new Error("メールアドレスまたはパスワードが違います。");
    attempts.delete(`login:${normalized}`);
    return credential.id;
  }
  function issue(input: Omit<Session, "expires">) {
    for (const [key, value] of sessions)
      if (value.expires < now()) sessions.delete(key);
    const token = randomBytes(32).toString("hex");
    sessions.set(token, {
      ...input,
      expires:
        now() + (input.role === "staff" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
    });
    return token;
  }
  function read(token?: string) {
    if (!token) return null;
    const value = sessions.get(token);
    if (!value || value.expires <= now()) {
      sessions.delete(token);
      return null;
    }
    return { ...value };
  }
  function revoke(token?: string) {
    if (token) sessions.delete(token);
  }
  function revokeAccount(id: string) {
    for (const [token, value] of sessions)
      if (value.accountId === id) sessions.delete(token);
  }
  function staffLogin(password: unknown, configured?: string) {
    limit("staff-login", 8);
    if (!configured || configured.length < 16)
      throw new Error(
        "運営ログインが未設定です。管理者にお問い合わせください。",
      );
    if (typeof password !== "string" || password.length > 128)
      throw new Error("認証できませんでした。");
    const a = createHash("sha256").update(password).digest();
    const b = createHash("sha256").update(configured).digest();
    if (!timingSafeEqual(a, b)) throw new Error("認証できませんでした。");
    attempts.delete("staff-login");
    return issue({ role: "staff" });
  }
  function seed(email: string, password: string, id: string) {
    if (!credentials.has(email)) {
      const salt = randomBytes(16).toString("hex");
      credentials.set(email, {
        id,
        salt,
        hash: scryptSync(passwordSchema.parse(password), salt, 64),
      });
    }
  }
  function discardRegistration(id: string) {
    for (const [email, credential] of credentials)
      if (credential.id === id) credentials.delete(email);
    revokeAccount(id);
  }
  return {
    register,
    login,
    issue,
    read,
    revoke,
    revokeAccount,
    staffLogin,
    seed,
    discardRegistration,
  };
}
const globalAuth = globalThis as unknown as {
  towariAuthV2?: ReturnType<typeof createAuth>;
};
globalAuth.towariAuthV2 ??= createAuth();
export const auth = globalAuth.towariAuthV2;
