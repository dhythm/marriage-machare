"use client";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActionResult, Preference, StaffState } from "../../lib/contracts";
import {
  logoutAccount,
  staffConfirmMeeting,
  staffEndRelationship,
  staffReview,
} from "../consultation-actions";

const statusLabel = {
  draft: "申請前",
  pending: "審査待ち",
  needs_changes: "追加情報の回答待ち",
  approved: "承認済み",
  rejected: "入会見送り",
  suspended: "利用停止中",
  withdrawn: "退会済み",
};
const reviewPriority = {
  pending: 0,
  needs_changes: 1,
  suspended: 2,
  draft: 3,
  approved: 4,
  rejected: 5,
  withdrawn: 6,
};
function PreferenceSummary({ preference }: { preference: Preference }) {
  const timingLabel = {
    within_year: "1年以内",
    within_two_years: "2年以内",
    discuss: "お相手と相談",
  };
  const childrenLabel = {
    yes: "希望する",
    no: "希望しない",
    discuss: "お相手と相談",
    undecided: "未定",
    any: "こだわらない",
  };
  const lifestyleLabel = {
    quiet: "家でゆっくり",
    active: "外でアクティブに",
    balanced: "どちらも大切に",
    any: "こだわらない",
  };
  return (
    <details className="notice-panel">
      <summary>出会いの希望・運営へのメッセージ</summary>
      <dl className="summary-list">
        <div>
          <dt>大切な価値観</dt>
          <dd>
            {preference.values.join("・") || "未入力"}
            {preference.priorityValue && (
              <>
                <br />
                特に大切：{preference.priorityValue}
              </>
            )}
          </dd>
        </div>
        <div>
          <dt>お相手・年齢</dt>
          <dd>
            {preference.target === "man" ? "男性" : "女性"} ·{" "}
            {preference.ageMin}〜{preference.ageMax}歳
            {preference.ageRequired && "（年齢は必須）"}
          </dd>
        </div>
        <div>
          <dt>地域</dt>
          <dd>
            {preference.regions.join("・") || "こだわらない"}
            {preference.regionRequired && "（必須）"}
          </dd>
        </div>
        <div>
          <dt>結婚の時期</dt>
          <dd>
            {timingLabel[preference.timing]}
            {preference.timingRequired && "（必須）"}
          </dd>
        </div>
        <div>
          <dt>休日</dt>
          <dd>{lifestyleLabel[preference.lifestyle]}</dd>
        </div>
        <div>
          <dt>子ども</dt>
          <dd>
            {childrenLabel[preference.children]}
            {preference.childrenRequired && "（必須）"}
          </dd>
        </div>
        <div>
          <dt>喫煙</dt>
          <dd>
            {preference.smoking === "no" ? "吸わない方" : "こだわらない"}
            {preference.smokingRequired && "（必須）"}
          </dd>
        </div>
        <div>
          <dt>運営への言葉</dt>
          <dd style={{ whiteSpace: "pre-wrap" }}>
            {preference.note || "記入なし"}
          </dd>
        </div>
      </dl>
    </details>
  );
}
export function StaffPanel({ state }: { state: StaffState }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function run(operation: () => Promise<ActionResult>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await operation();
      if (!result.ok) setError(result.error);
      else {
        setMessage("更新しました。");
        router.refresh();
      }
    } catch {
      setError("更新できませんでした。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="tw staff-page">
      <header className="public-header">
        <Link href="/" className="wordmark">
          TOWARI<span>運営管理</span>
        </Link>
        <button
          type="button"
          className="text-button"
          onClick={async () => {
            await logoutAccount();
            router.push("/");
            router.refresh();
          }}
        >
          ログアウト
        </button>
      </header>
      <main className="staff-main">
        <header className="page-heading">
          <span className="eyebrow">CARE & REVIEW</span>
          <h1>一つひとつの想いに、向き合う。</h1>
          <p>入会審査・面談調整</p>
        </header>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="success" role="status">
            <Check size={16} />
            {message}
          </p>
        )}
        <section>
          <div className="section-heading">
            <h2>入会申請</h2>
            <ShieldCheck size={23} />
          </div>
          {state.applications.length === 0 && (
            <div className="panel">入会申請はありません。</div>
          )}
          {[...state.applications]
            .sort(
              (first, second) =>
                reviewPriority[first.status] - reviewPriority[second.status],
            )
            .map((application) => (
              <article className="panel staff-application" key={application.id}>
                <div className="section-heading">
                  <div>
                    <span className="status-pill">
                      {statusLabel[application.status]}
                    </span>
                    <h2>{application.profile?.name || "申請未入力"}</h2>
                    <p>{application.email}</p>
                  </div>
                </div>
                {application.profile && (
                  <>
                    <p>
                      {application.profile.age}歳 ·{" "}
                      {application.profile.location} · {application.profile.job}
                    </p>
                    <h3>{application.profile.intro}</h3>
                    <p>{application.profile.story}</p>
                    <div className="tag-list">
                      {application.profile.values.map((value) => (
                        <span key={value}>{value}</span>
                      ))}
                    </div>
                  </>
                )}
                {application.preference && (
                  <PreferenceSummary preference={application.preference} />
                )}
                <form
                  key={`${application.id}-${application.status}`}
                  onSubmit={(event) => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    run(() =>
                      staffReview(
                        application.id,
                        data.get("status") as
                          | "approved"
                          | "needs_changes"
                          | "rejected"
                          | "suspended",
                        String(data.get("note")),
                      ),
                    );
                  }}
                >
                  <div className="field-grid">
                    <label>
                      審査結果
                      <select
                        name="status"
                        required
                        defaultValue={
                          [
                            "approved",
                            "needs_changes",
                            "rejected",
                            "suspended",
                          ].includes(application.status)
                            ? application.status
                            : ""
                        }
                        disabled={application.status === "withdrawn"}
                      >
                        <option value="" disabled>
                          審査結果を選択
                        </option>
                        <option value="needs_changes">追加情報を依頼</option>
                        <option value="approved">入会を承認</option>
                        <option value="rejected">入会を見送り</option>
                        <option value="suspended">利用を停止</option>
                      </select>
                    </label>
                    <label>
                      本人に伝える内容
                      <textarea
                        name="note"
                        maxLength={500}
                        defaultValue={application.note}
                        rows={2}
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="button compact"
                    disabled={busy || application.status === "withdrawn"}
                  >
                    審査結果を保存
                  </button>
                </form>
              </article>
            ))}
        </section>
        <section>
          <h2>面談の日程調整</h2>
          {state.meetings.length === 0 ? (
            <div className="panel">調整する面談はありません。</div>
          ) : (
            state.meetings.map((meeting) => (
              <article className="panel" key={meeting.id}>
                <span className="status-pill">
                  {{
                    requested: "日程を調整中",
                    confirmed: "日程確定",
                    completed: "面談完了",
                  }[meeting.status] || "確認中"}
                </span>
                <h3>{meeting.names.join(" × ")}</h3>
                <p>{new Date(meeting.date).toLocaleString("ja-JP")}</p>
                <p>{meeting.note}</p>
                <div className="row-actions">
                  {meeting.status === "requested" && (
                    <button
                      type="button"
                      className="button compact"
                      disabled={busy}
                      onClick={() =>
                        run(() => staffConfirmMeeting(meeting.id, "confirmed"))
                      }
                    >
                      日程を確定して通知
                    </button>
                  )}
                  {meeting.status === "confirmed" && (
                    <button
                      type="button"
                      className="button secondary compact"
                      disabled={busy}
                      onClick={() =>
                        run(() => staffConfirmMeeting(meeting.id, "completed"))
                      }
                    >
                      面談完了を記録
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
        <section>
          <h2>確認が必要なご縁</h2>
          {state.relationships.filter((relationship) => relationship.restricted)
            .length === 0 ? (
            <div className="panel">確認が必要なご縁はありません。</div>
          ) : (
            state.relationships
              .filter((relationship) => relationship.restricted)
              .map((relationship) => (
                <article className="panel" key={relationship.id}>
                  <h3>{relationship.names.join(" × ")}</h3>
                  <p>会員の利用資格が制限されています。</p>
                  <button
                    type="button"
                    className="button secondary compact"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          "このご縁を終了し、双方に終了通知を保存します。よろしいですか？",
                        )
                      )
                        run(() => staffEndRelationship(relationship.id));
                    }}
                  >
                    運営判断でご縁を終了する
                  </button>
                </article>
              ))
          )}
        </section>
        <section>
          <h2>運営への報告</h2>
          {state.reports.length === 0 ? (
            <div className="panel">報告はありません。</div>
          ) : (
            state.reports.map((report) => (
              <article className="panel" key={report.id}>
                <h3>
                  {report.reporterName} → {report.partnerName}
                </h3>
                <time>
                  {new Date(report.createdAt).toLocaleString("ja-JP")}
                </time>
                <p>{report.reason}</p>
              </article>
            ))
          )}
        </section>
        <Link className="text-link" href="/">
          <ArrowLeft size={16} /> 公開トップへ
        </Link>
      </main>
    </div>
  );
}
