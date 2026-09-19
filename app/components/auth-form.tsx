"use client";
import { ArrowRight, Flower2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  loginAccount,
  registerAccount,
  staffLogin,
} from "../consultation-actions";

export function AuthForm({ mode }: { mode: "login" | "register" | "staff" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="tw auth-page">
      <Link href="/" className="wordmark auth-brand">
        TOWARI
      </Link>
      <div className="auth-story">
        <Flower2 size={45} strokeWidth={1.3} />
        <h1>
          ふたりの未来は、
          <br />
          あなたの想いから。
        </h1>
        <p>この先を、ともにする人と。</p>
        <span className="eyebrow">A LIFE, SHARED.</span>
      </div>
      <section className="auth-card">
        <span className="eyebrow">
          {mode === "register"
            ? "YOUR FIRST STEP"
            : mode === "staff"
              ? "STAFF ONLY"
              : "WELCOME BACK"}
        </span>
        <h2>
          {mode === "register"
            ? "TOWARIをはじめる"
            : mode === "staff"
              ? "運営ログイン"
              : "おかえりなさい"}
        </h2>
        <p>
          {mode === "register"
            ? "アカウントを作成して、入会申請へ。"
            : mode === "staff"
              ? "入会審査・面談を管理します。"
              : "あなたのご縁の続きを、ここから。"}
        </p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setBusy(true);
            const data = new FormData(event.currentTarget);
            try {
              const result =
                mode === "staff"
                  ? await staffLogin(String(data.get("password")))
                  : await (mode === "register"
                      ? registerAccount
                      : loginAccount)({
                      email: String(data.get("email")),
                      password: String(data.get("password")),
                    });
              if (!result.ok) setError(result.error);
              else {
                router.push(
                  mode === "staff"
                    ? "/staff"
                    : mode === "register"
                      ? "/application"
                      : "/home",
                );
                router.refresh();
              }
            } catch {
              setError("処理できませんでした。もう一度お試しください。");
            } finally {
              setBusy(false);
            }
          }}
        >
          {mode !== "staff" && (
            <label>
              メールアドレス
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </label>
          )}
          <label>
            パスワード
            <input
              name="password"
              type="password"
              required
              minLength={mode === "register" ? 12 : 1}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              placeholder={
                mode === "register" ? "12文字以上" : "パスワードを入力"
              }
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button" disabled={busy}>
            {busy
              ? "確認しています…"
              : mode === "register"
                ? "アカウントを作成"
                : "ログイン"}
            <ArrowRight size={18} />
          </button>
        </form>
        {mode !== "staff" && (
          <div className="auth-switch">
            {mode === "register" ? "アカウントをお持ちの方" : "はじめての方"}
            <Link href={mode === "register" ? "/login" : "/register"}>
              {mode === "register" ? "ログイン" : "入会申請へ"}{" "}
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
        <div className="auth-note">
          <LockKeyhole size={16} />
          <span>他会員の情報は、入会承認と希望の入力後にご紹介します。</span>
        </div>
        <small className="prototype-note">
          試作版：データはサーバーの再起動で消去されます。
        </small>
      </section>
    </main>
  );
}
