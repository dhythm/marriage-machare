"use client";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Flower2,
  HeartHandshake,
  Home,
  Leaf,
  LockKeyhole,
  LogOut,
  MessageCircle,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type {
  ActionResult,
  MemberState,
  PartnerSummary,
  Preference,
  Profile,
} from "../../lib/contracts";
import { regionOptions, valueOptions } from "../../lib/contracts";
import * as action from "../consultation-actions";

const statusLabel = {
  draft: "申請前",
  pending: "審査中",
  needs_changes: "追加情報が必要です",
  approved: "承認済み",
  rejected: "審査結果のお知らせ",
  suspended: "利用停止中",
  withdrawn: "退会済み",
};
const timingLabel = {
  within_year: "1年以内",
  within_two_years: "2年以内",
  discuss: "お相手と相談したい",
};
const lifestyleLabel = {
  quiet: "家でゆっくり",
  active: "外でアクティブに",
  balanced: "どちらも大切に",
  any: "こだわらない",
};
const childrenLabel = {
  yes: "希望する",
  no: "希望しない",
  discuss: "お相手と相談したい",
  undecided: "まだ決めていない",
  any: "こだわらない",
};
const dateText = (time: number) =>
  new Date(time).toLocaleString("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
function Title({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}
function Empty({
  icon,
  title,
  children,
  footer,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="empty-card">
      <span className="empty-icon">{icon || <Flower2 size={30} />}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {footer}
    </div>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className="tw modal"
      onCancel={onClose}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="閉じる"
        >
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Portal({
  state,
  section = "home",
}: {
  state: MemberState;
  section?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<PartnerSummary | null>(null);
  const [ending, setEnding] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const account = state.account;
  const active = state.relationship;
  const approved = account.status === "approved";
  const unavailable = ["rejected", "suspended", "withdrawn"].includes(
    account.status,
  );
  async function run(
    operation: () => Promise<ActionResult>,
    success?: string,
    route?: string,
  ) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await operation();
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      if (success) setMessage(success);
      if (route) router.push(route);
      router.refresh();
      return true;
    } catch {
      setError("処理できませんでした。もう一度お試しください。");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const navigation = [
    { path: "home", label: "ホーム", icon: Home },
    { path: "application", label: "入会申請・審査", icon: ShieldCheck },
    { path: "preferences", label: "出会いの希望", icon: SlidersHorizontal },
    { path: "introductions", label: "あなたへのご紹介", icon: Flower2 },
    { path: "relationship", label: "進行中のご縁", icon: HeartHandshake },
    { path: "notifications", label: "お知らせ・履歴", icon: Bell },
    { path: "profile", label: "マイプロフィール", icon: UserRound },
  ];
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const interval = window.setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A changed authorization or relationship invalidates an open detail modal.
  useEffect(() => {
    setDetail(null);
    setEnding(false);
  }, [state.relationship?.id, account.status]);
  useEffect(() => {
    if (
      detail &&
      !state.introductions.some((partner) => partner.id === detail.id) &&
      !state.interests.some((interest) => interest.partner.id === detail.id)
    )
      setDetail(null);
  }, [detail, state.introductions, state.interests]);
  const locked = account.relationshipLocked;
  const ready = approved && account.preferenceComplete && !locked;
  const generate = () =>
    run(
      action.generateIntroductions,
      "ご紹介を確認しました。",
      "/introductions",
    );
  const restrictedPanel = (
    <Empty
      icon={<LockKeyhole size={28} />}
      title="ご縁の状況を確認しています。"
      footer={
        account.relationshipId ? (
          <button
            type="button"
            className="button secondary"
            onClick={() => setEnding(true)}
          >
            このご縁を終了する
          </button>
        ) : undefined
      }
    >
      現在、お相手の情報は表示できません。ご縁は継続中のため、新しい紹介は停止しています。
    </Empty>
  );
  const introPanel = (
    <>
      <div className="section-heading">
        <h2>あなたへのご紹介</h2>
        <Link className="text-link" href="/preferences">
          希望を見直す <ArrowUpRight size={15} />
        </Link>
      </div>
      {!ready ? (
        <Empty
          icon={<LockKeyhole size={28} />}
          title={
            approved
              ? "あなたの想いを、聞かせてください。"
              : "ご紹介は、入会承認のあとに。"
          }
          footer={
            <Link
              className="button"
              href={approved ? "/preferences" : "/application"}
            >
              {approved ? "出会いの希望を入力" : "申請状況を見る"}
              <ArrowRight size={17} />
            </Link>
          }
        >
          {approved
            ? "どんな人と、どんな毎日を送りたいですか。"
            : "まずは入会申請と、あなたらしい暮らしの整理から。"}
        </Empty>
      ) : (
        <>
          {state.introductions.length ? (
            <div className="introduction-grid">
              {state.introductions.map((partner, index) => (
                <article className="introduction-card" key={partner.id}>
                  <div className="card-top">
                    <span className="eyebrow">
                      INTRODUCTION {String(index + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      className={`icon-button ${partner.saved ? "saved" : ""}`}
                      aria-label={
                        partner.saved ? "検討中から外す" : "あとで考える"
                      }
                      disabled={busy}
                      onClick={() => run(() => action.savePartner(partner.id))}
                    >
                      <Bookmark
                        size={19}
                        fill={partner.saved ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  <div className="intro-mark">
                    <Leaf size={25} strokeWidth={1.5} />
                  </div>
                  <h3>
                    {partner.reasons[0] || "これからの暮らしを、言葉から知る。"}
                  </h3>
                  <div className="partner-line">
                    <b>{partner.name}</b>
                    <span>
                      {partner.ageBand} · {partner.location}
                    </span>
                  </div>
                  <p className="card-story">{partner.intro}</p>
                  <div className="tag-list">
                    {partner.values.map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="card-link"
                    onClick={() => setDetail(partner)}
                  >
                    この方を詳しく知る <ArrowRight size={18} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <Empty
              title={
                state.introductionGenerated
                  ? "ご希望に合うご縁を、丁寧に。"
                  : "あなたの想いに重なる方を。"
              }
              footer={
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={generate}
                >
                  {state.introductionGenerated
                    ? "紹介をもう一度確認"
                    : "紹介を受け取る"}
                  <ArrowRight size={17} />
                </button>
              }
            >
              {state.introductionGenerated
                ? "現在、ご紹介できる方がいません。希望を見直して、改めてご紹介を確認できます。"
                : "大切にしたい価値観と、お互いの希望からご紹介します。"}
            </Empty>
          )}
          <div className="privacy-note">
            <LockKeyhole size={17} />
            <span>
              写真は、お互いが「お話ししたい」と希望したあとに公開されます。
            </span>
          </div>
          {state.interests.length > 0 && (
            <section className="interest-section">
              <h2>お話ししたいという想い</h2>
              {state.interests.map((interest) => (
                <div className="interest-row" key={interest.id}>
                  <span className="initial-avatar">
                    {interest.partner.name.slice(0, 1)}
                  </span>
                  <div>
                    <b>{interest.partner.name}</b>
                    <p>
                      {interest.direction === "incoming"
                        ? "あなたとお話ししたいと希望しています"
                        : "お返事を待っています"}
                    </p>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => setDetail(interest.partner)}
                    >
                      紹介を読む
                    </button>
                  </div>
                  <div className="row-actions">
                    {interest.direction === "incoming" ? (
                      <>
                        <button
                          type="button"
                          className="button compact"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => action.respondInterest(interest.id, true),
                              "ご縁がつながりました。",
                              "/relationship",
                            )
                          }
                        >
                          私もお話ししたい
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => action.respondInterest(interest.id, false),
                              "お相手にお断りをお伝えしました。",
                            )
                          }
                        >
                          お断りする
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="button secondary compact"
                        disabled={busy}
                        onClick={() =>
                          run(
                            () => action.cancelInterest(interest.id),
                            "希望の取り下げをお相手にお伝えしました。",
                          )
                        }
                      >
                        希望を取り下げる
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </>
  );
  const relationshipPanel =
    locked && !active ? (
      restrictedPanel
    ) : active ? (
      <>
        <div className="relationship-banner">
          <span className="status-pill">
            <span /> ご縁を育てています
          </span>
          <p>
            いまは、おひとりとの時間を大切に。新しいご紹介はお休みしています。
          </p>
        </div>
        <article className="relationship-card">
          <div className="relationship-photo">
            {active.photoUrl ? (
              // biome-ignore lint/performance/noImgElement: Private photos must bypass the public image optimization cache.
              <img
                src={active.photoUrl}
                alt={`${active.partner.name}のプロフィール写真`}
              />
            ) : (
              <div className="photo-placeholder">
                <UserRound size={56} strokeWidth={1} />
                <span>写真は未登録です</span>
              </div>
            )}
          </div>
          <div className="relationship-copy">
            <span className="eyebrow">YOUR CONNECTION</span>
            <h2>{active.partner.name}</h2>
            <p className="partner-meta">
              {active.partner.ageBand} · {active.partner.location} ·{" "}
              {active.partner.job}
            </p>
            <h3>{active.partner.intro}</h3>
            <p>{active.partner.story}</p>
            <div className="tag-list">
              {active.partner.values.map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
            <small>{dateText(active.startedAt)} にご縁がつながりました</small>
          </div>
        </article>
        <section className="panel meeting-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE FIRST CONVERSATION</span>
              <h2>お話しする時間を。</h2>
            </div>
            <CalendarDays size={26} />
          </div>
          {active.meeting ? (
            <div className="meeting-result">
              <span className="status-pill">
                {
                  {
                    requested: "日程を調整中",
                    confirmed: "面談日程が確定",
                    completed: "面談が完了",
                  }[active.meeting.status]
                }
              </span>
              <h3>{new Date(active.meeting.date).toLocaleString("ja-JP")}</h3>
              <p>{active.meeting.note}</p>
              <p>
                {active.meeting.status === "completed"
                  ? "面談後も、ご縁は続いています。"
                  : "運営が確認し、お知らせします。"}
              </p>
            </div>
          ) : (
            <form
              className="meeting-form"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                run(
                  () =>
                    action.requestMeeting(
                      active.id,
                      String(data.get("date")),
                      String(data.get("note")),
                    ),
                  "面談希望を運営に届けました。",
                );
              }}
            >
              <label>
                ご希望の日時
                <input type="datetime-local" name="date" required />
              </label>
              <label>
                面談について伝えたいこと
                <textarea
                  name="note"
                  maxLength={300}
                  rows={2}
                  placeholder="ご都合のよい時間帯など"
                />
              </label>
              <button type="submit" className="button" disabled={busy}>
                面談希望を届ける <ArrowRight size={17} />
              </button>
            </form>
          )}
        </section>
        <div className="ending-link">
          <p>この先について、考えが変わったときは。</p>
          <button
            type="button"
            className="text-button"
            onClick={() => setEnding(true)}
          >
            このご縁を終了する <ChevronRight size={15} />
          </button>
        </div>
      </>
    ) : (
      <Empty
        icon={<HeartHandshake size={30} />}
        title="お互いの想いが揃ったら。"
        footer={
          <Link href="/introductions" className="button">
            あなたへのご紹介 <ArrowRight size={17} />
          </Link>
        }
      >
        双方が「お話ししたい」と希望すると、ここからおふたりの時間がはじまります。
      </Empty>
    );
  return (
    <div
      className={`tw member-page ${account.theme === "rose" ? "theme-rose" : ""}`}
    >
      <aside className="sidebar">
        <Link href="/" className="wordmark">
          TONARI<span>この先を、ともにする人と。</span>
        </Link>
        <div className="sidebar-member">
          <span className="member-monogram">
            {account.profile?.name.slice(0, 1) || "T"}
          </span>
          <div>
            <b>
              {account.profile?.name || "あなた"}
              <small> さん</small>
            </b>
            <span>{statusLabel[account.status]}</span>
          </div>
        </div>
        <nav>
          {navigation.map((item) => (
            <Link
              key={item.path}
              className={section === item.path ? "selected" : ""}
              href={`/${item.path}`}
            >
              <item.icon size={19} strokeWidth={1.7} />
              {item.label}
              {item.path === "notifications" &&
                state.notifications.some((item) => !item.read) && (
                  <i className="notification-dot" />
                )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Flower2 size={23} />
          <p>
            急がずに。
            <br />
            でも、一歩ずつ。
          </p>
          <button
            type="button"
            onClick={() => run(action.logoutAccount, undefined, "/")}
          >
            <LogOut size={17} /> ログアウト
          </button>
        </div>
      </aside>
      <div className="member-content">
        <header className="member-topbar">
          <span>
            {navigation.find((item) => item.path === section)?.label ||
              "ホーム"}
          </span>
          <div>
            <span className="status-pill">
              <ShieldCheck size={14} />
              {statusLabel[account.status]}
            </span>
            <Link href="/notifications" aria-label="お知らせ">
              <Bell size={20} />
            </Link>
          </div>
        </header>
        <main className="member-main">
          {error && (
            <p role="alert" className="error global-feedback">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="success global-feedback">
              <Check size={18} />
              {message}
            </p>
          )}
          {section === "home" && (
            <>
              <Title
                eyebrow="YOUR OWN PACE"
                title={`${account.profile?.name || "あなた"}さん、おかえりなさい。`}
              >
                ともにする未来へ、今日も一歩ずつ。
              </Title>
              {locked ? (
                relationshipPanel
              ) : unavailable ? (
                <Empty title={statusLabel[account.status]}>
                  {account.reviewNote || "ご利用状況をご確認ください。"}
                </Empty>
              ) : !approved ? (
                <>
                  <section className="welcome-panel">
                    <div>
                      <span className="eyebrow">YOUR NEXT STEP</span>
                      <h2>
                        {account.status === "pending"
                          ? "あなたの想いを、\nお預かりしています。"
                          : account.status === "needs_changes"
                            ? "もう少し、\n聞かせてください。"
                            : "ご縁のはじまりは、\nあなたを知ることから。"}
                      </h2>
                      <p>
                        {account.status === "pending"
                          ? "運営が入会申請を確認しています。結果はこちらでお知らせします。"
                          : account.reviewNote ||
                            "今の暮らしと、これからの想い。入会申請からはじめましょう。"}
                      </p>
                      <Link className="button" href="/application">
                        {account.status === "pending"
                          ? "申請状況を見る"
                          : "入会申請を進める"}
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                    <div className="welcome-flower" aria-hidden="true">
                      <Flower2 size={145} strokeWidth={0.65} />
                    </div>
                  </section>
                  <div className="next-step-card">
                    <span className="round-icon">
                      <SlidersHorizontal size={22} />
                    </span>
                    <div>
                      <h3>どんな毎日を、ともにしたいですか。</h3>
                      <p>出会いの希望は、審査中から整理できます。</p>
                    </div>
                    <Link href="/preferences" className="text-link">
                      希望を整える <ArrowRight size={17} />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {!account.preferenceComplete && (
                    <section className="welcome-panel">
                      <div>
                        <span className="eyebrow">WELCOME TO TONARI</span>
                        <h2>
                          どんな毎日を、
                          <br />
                          ともにしたいですか。
                        </h2>
                        <p>大切にしたいことから、あなたらしいご縁へ。</p>
                        <Link href="/preferences" className="button">
                          出会いの希望を入力 <ArrowRight size={17} />
                        </Link>
                      </div>
                      <Flower2
                        className="welcome-flower"
                        size={120}
                        strokeWidth={0.7}
                      />
                    </section>
                  )}
                  {account.preferenceComplete && introPanel}
                </>
              )}
              <div className="quiet-quote">
                <span>“</span>
                <p>何気ない一日が、ふたりの大切な一日になる。</p>
                <small>TONARI</small>
              </div>
            </>
          )}
          {section === "application" && (
            <>
              <Title
                eyebrow="ABOUT YOU"
                title="あなたのことを、聞かせてください。"
              >
                これからの暮らしを、一緒に考えるために。
              </Title>
              {account.status === "approved" ? (
                <Empty
                  icon={<ShieldCheck size={30} />}
                  title="ご入会が承認されました。"
                  footer={
                    <Link href="/preferences" className="button">
                      出会いの希望へ <ArrowRight size={17} />
                    </Link>
                  }
                >
                  あなたの想いから、ご縁を探していきましょう。
                </Empty>
              ) : account.status === "pending" || unavailable ? (
                <Empty
                  icon={<ShieldCheck size={30} />}
                  title={
                    account.status === "pending"
                      ? "入会申請を確認しています。"
                      : statusLabel[account.status]
                  }
                >
                  {account.reviewNote ||
                    "審査結果は、こちらとお知らせに届きます。"}
                </Empty>
              ) : (
                <>
                  {account.reviewNote && (
                    <div className="notice-panel">{account.reviewNote}</div>
                  )}
                  <ApplicationForm
                    profile={account.profile}
                    busy={busy}
                    onSave={(value) =>
                      run(
                        () => action.submitApplication(value),
                        "入会申請を受け付けました。",
                        "/home",
                      )
                    }
                  />
                </>
              )}
            </>
          )}
          {section === "preferences" && (
            <>
              <Title
                eyebrow="A LIFE YOU IMAGINE"
                title="どんな毎日を、ともに。"
              >
                あなたが大切にしたいことを、ひとつずつ。
              </Title>
              {unavailable ? (
                <Empty title="現在、希望を変更できません。">
                  {account.reviewNote}
                </Empty>
              ) : (
                <PreferenceForm
                  initial={account.preference}
                  approved={approved}
                  active={locked}
                  busy={busy}
                  onSave={(value, complete) =>
                    run(
                      () => action.savePreference(value, complete),
                      complete
                        ? "出会いの希望を保存しました。"
                        : "下書きを保存しました。",
                      complete ? "/introductions" : undefined,
                    )
                  }
                />
              )}
            </>
          )}
          {section === "introductions" && (
            <>
              <Title
                eyebrow="CHOSEN WITH CARE"
                title={
                  locked ? "いまは、このご縁を大切に。" : "想いに重なる、ご縁。"
                }
              >
                {locked
                  ? "おふたりのご縁が続く間、新しい紹介は届きません。"
                  : "顔より先に、ことばから。その人らしさを知っていく。"}
              </Title>
              {locked && !active ? (
                restrictedPanel
              ) : active ? (
                <Empty
                  icon={<HeartHandshake size={30} />}
                  title={`${active.partner.name}とのご縁が進んでいます。`}
                  footer={
                    <Link href="/relationship" className="button">
                      進行中のご縁へ <ArrowRight size={17} />
                    </Link>
                  }
                />
              ) : (
                introPanel
              )}
            </>
          )}
          {section === "relationship" && (
            <>
              <Title
                eyebrow="ONE CONNECTION AT A TIME"
                title="いま、大切に育てているご縁。"
              />
              {relationshipPanel}
            </>
          )}
          {section === "notifications" && (
            <>
              <Title
                eyebrow="UPDATES & MEMORIES"
                title="お知らせと、ご縁の記録。"
              />
              <section className="panel">
                <h2>お知らせ</h2>
                {!state.notifications.length ? (
                  <p className="muted">新しいお知らせはありません。</p>
                ) : (
                  state.notifications.map((notification) => (
                    <article
                      className={`notification-row ${notification.read ? "" : "unread"}`}
                      key={notification.id}
                    >
                      <Bell size={19} />
                      <div>
                        <time>{dateText(notification.createdAt)}</time>
                        <p>{notification.text}</p>
                      </div>
                      {!notification.read && (
                        <button
                          type="button"
                          className="text-button"
                          disabled={busy}
                          onClick={() =>
                            run(() =>
                              action.markNotificationRead(notification.id),
                            )
                          }
                        >
                          確認済みにする
                        </button>
                      )}
                    </article>
                  ))
                )}
              </section>
              <section className="panel">
                <h2>ご縁の履歴</h2>
                {!state.history.length ? (
                  <p className="muted">終了したご縁はありません。</p>
                ) : (
                  state.history.map((history) => (
                    <article className="history-row" key={history.id}>
                      <span className="initial-avatar">
                        {history.partnerName.slice(0, 1)}
                      </span>
                      <div>
                        <h3>{history.partnerName}とのご縁</h3>
                        <time>{dateText(history.endedAt)}</time>
                        <p>{history.endedBy}がアプリ上のご縁を終了しました。</p>
                        <small>
                          終了した事実は、双方のお知らせに保存されています。
                        </small>
                      </div>
                    </article>
                  ))
                )}
              </section>
            </>
          )}
          {section === "profile" && (
            <>
              <Title eyebrow="MY PROFILE" title="あなたらしさを、大切に。" />
              <section className="panel profile-panel">
                <div className="own-photo">
                  {account.hasPhoto ? (
                    // biome-ignore lint/performance/noImgElement: Authenticated images must be requested directly.
                    <img
                      src={`/api/portraits/${account.id}`}
                      alt="自分のプロフィール写真"
                    />
                  ) : (
                    <UserRound size={45} />
                  )}
                </div>
                <div>
                  <span className="eyebrow">YOUR PROFILE</span>
                  <h2>{account.profile?.name || "プロフィール未登録"}</h2>
                  <p>{account.email}</p>
                  <span className="status-pill">
                    {statusLabel[account.status]}
                  </span>
                </div>
              </section>
              {account.profile && (
                <section className="panel">
                  <h2>今の暮らしと、これから</h2>
                  <p>{account.profile.intro}</p>
                  <p>{account.profile.story}</p>
                  <div className="tag-list">
                    {account.profile.values.map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  </div>
                  <dl className="summary-list">
                    <div>
                      <dt>基本情報</dt>
                      <dd>
                        {account.profile.age}歳 · {account.profile.location} ·{" "}
                        {account.profile.job}
                      </dd>
                    </div>
                    <div>
                      <dt>結婚の時期</dt>
                      <dd>{timingLabel[account.profile.timing]}</dd>
                    </div>
                  </dl>
                </section>
              )}
              <section className="panel">
                <h2>あなたの写真</h2>
                <p>お相手への公開は、双方の「お話ししたい」が揃ってから。</p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    run(() => action.uploadPhoto(data), "写真を保存しました。");
                  }}
                >
                  <label>
                    プロフィール写真
                    <input
                      name="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="button secondary"
                  >
                    写真を保存
                  </button>
                </form>
              </section>
              <section className="panel account-panel">
                <h2>アカウント</h2>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => run(action.logoutAccount, undefined, "/")}
                >
                  ログアウト
                </button>
                <br />
                <button
                  type="button"
                  className="text-button danger-text"
                  onClick={() => setWithdraw(true)}
                >
                  退会する
                </button>
                <p className="prototype-note">
                  試作版のため、保存データはサーバー再起動で消去されます。
                </p>
              </section>
            </>
          )}
        </main>
        <footer className="member-footer">
          <span>TONARI</span>
          <small>この先を、ともにする人と。</small>
        </footer>
      </div>
      {detail && !active && (
        <Modal title={`${detail.name}のご紹介`} onClose={() => setDetail(null)}>
          <div className="detail-body">
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <span className="eyebrow">BEYOND THE FIRST IMPRESSION</span>
            <h3 className="detail-lead">{detail.intro}</h3>
            <p className="partner-meta">
              {detail.ageBand} · {detail.location} · {detail.job}
            </p>
            <div className="detail-reasons">
              <h3>おふたりに重なる想い</h3>
              {detail.reasons.map((reason) => (
                <p key={reason}>
                  <Check size={17} />
                  {reason}
                </p>
              ))}
            </div>
            <h3>大切にしたい暮らし</h3>
            <p>{detail.story}</p>
            <div className="tag-list">
              {detail.values.map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
            <h3>好きなこと</h3>
            <p>{detail.hobbies.join(" · ")}</p>
            <h3>お話ししてみたいこと</h3>
            {detail.discussion.map((item) => (
              <p key={item}>{item}</p>
            ))}
            <div className="privacy-note">
              <LockKeyhole size={17} />
              写真は、お互いの希望が揃ってから。
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="button"
                disabled={
                  busy ||
                  state.interests.some((item) => item.direction === "outgoing")
                }
                onClick={async () => {
                  if (
                    await run(
                      () => action.sendInterest(detail.id),
                      "お話ししたいという想いを届けました。",
                    )
                  )
                    setDetail(null);
                }}
              >
                お話ししてみたい <MessageCircle size={17} />
              </button>
              <button
                type="button"
                className="text-button"
                disabled={busy}
                onClick={async () => {
                  if (
                    await run(
                      () => action.dismissPartner(detail.id),
                      "今回は見送りました。",
                    )
                  )
                    setDetail(null);
                }}
              >
                今回は見送る
              </button>
            </div>
          </div>
        </Modal>
      )}
      {ending && account.relationshipId && (
        <Modal
          title="このご縁を、終了しますか。"
          onClose={() => setEnding(false)}
        >
          <form
            className="detail-body"
            onSubmit={async (event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              if (
                await run(
                  () =>
                    action.endRelationship(
                      account.relationshipId || "",
                      data.get("report") === "on" ? "blocked" : "declined",
                      String(data.get("note") || ""),
                    ),
                  "ご縁の終了をお相手に伝えました。",
                  "/notifications",
                )
              )
                setEnding(false);
            }}
          >
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <p>
              <b>{active?.partner.name || "お相手"}</b>
              との、TONARI上のご縁を終了します。
            </p>
            <div className="notice-panel">
              <h3>お相手に届くお知らせ</h3>
              <p>
                「{account.profile?.name || "お相手"}
                さんが、このご縁を終了することを選びました。おふたりとも、次の紹介を受けられる状態になりました。」
              </p>
            </div>
            <ul className="confirmation-list">
              <li>終了した事実と日時を、双方の履歴に残します。</li>
              <li>お相手の写真・プロフィールは閲覧できなくなります。</li>
              <li>アプリ外のやり取りは、この操作では終了しません。</li>
            </ul>
            <label>
              運営へ伝えたいこと
              <textarea name="note" maxLength={500} rows={3} />
            </label>
            <label className="check-label">
              <input type="checkbox" name="report" />
              不安があるため、ブロック・運営への報告も行う
            </label>
            <div className="modal-actions">
              <button type="submit" className="button danger" disabled={busy}>
                お断りを伝えて、このご縁を終了する
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => setEnding(false)}
              >
                ご縁に戻る
              </button>
            </div>
          </form>
        </Modal>
      )}
      {withdraw && (
        <Modal
          title="TONARIを退会しますか。"
          onClose={() => setWithdraw(false)}
        >
          <div className="detail-body">
            <p>
              進行中のご縁や希望がある場合は終了し、お相手にも通知します。紹介と写真の閲覧はできなくなります。
            </p>
            <button
              type="button"
              className="button danger"
              disabled={busy}
              onClick={() => run(action.withdrawAccount, undefined, "/")}
            >
              退会を確定する
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Choice({
  value,
  selected,
  onClick,
}: {
  value: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`choice ${selected ? "chosen" : ""}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {value}
      {selected ? <Check size={17} /> : <span className="choice-circle" />}
    </button>
  );
}
function ApplicationForm({
  profile,
  busy,
  onSave,
}: {
  profile: Profile | null;
  busy: boolean;
  onSave: (value: Profile) => Promise<boolean>;
}) {
  const [values, setValues] = useState<string[]>(profile?.values || []);
  return (
    <form
      className="panel form-panel"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSave({
          name: String(data.get("name")),
          age: Number(data.get("age")),
          gender: data.get("gender") as Profile["gender"],
          location: String(data.get("location")),
          job: String(data.get("job")),
          intro: String(data.get("intro")),
          story: String(data.get("story")),
          values,
          hobbies: String(data.get("hobbies"))
            .split(/[、,]/)
            .map((item) => item.trim())
            .filter(Boolean),
          timing: data.get("timing") as Profile["timing"],
          lifestyle: data.get("lifestyle") as Profile["lifestyle"],
          smoking: data.get("smoking") as Profile["smoking"],
          children: data.get("children") as Profile["children"],
          consent: data.get("consent") === "on",
        });
      }}
    >
      <div className="form-section">
        <span className="eyebrow">01 / INTRODUCE YOURSELF</span>
        <h2>まずは、あなたについて。</h2>
        <div className="field-grid">
          <label>
            公開するお名前
            <input
              name="name"
              required
              maxLength={30}
              defaultValue={profile?.name}
              placeholder="ニックネーム・イニシャル"
            />
          </label>
          <label>
            年齢
            <input
              type="number"
              name="age"
              required
              min={20}
              max={100}
              defaultValue={profile?.age}
            />
          </label>
          <label>
            性別
            <select name="gender" defaultValue={profile?.gender || "woman"}>
              <option value="woman">女性</option>
              <option value="man">男性</option>
            </select>
          </label>
          <label>
            お住まい
            <select
              name="location"
              defaultValue={profile?.location || "東京都"}
            >
              {regionOptions.map((region) => (
                <option key={region}>{region}</option>
              ))}
            </select>
          </label>
          <label className="full-width">
            お仕事
            <input
              name="job"
              required
              maxLength={60}
              defaultValue={profile?.job}
              placeholder="職種"
            />
          </label>
        </div>
      </div>
      <div className="form-section">
        <span className="eyebrow">02 / YOUR EVERYDAY</span>
        <h2>あなたらしい日々と、想い。</h2>
        <label>
          あなたを表すひとこと
          <input
            name="intro"
            required
            maxLength={120}
            defaultValue={profile?.intro}
            placeholder="何気ない日常を、一緒に楽しみたいです"
          />
        </label>
        <label>
          自己紹介・結婚への想い
          <textarea
            name="story"
            required
            minLength={20}
            maxLength={1000}
            rows={5}
            defaultValue={profile?.story}
          />
        </label>
        <label>
          好きなこと
          <input
            name="hobbies"
            required
            maxLength={200}
            defaultValue={profile?.hobbies.join("、")}
            placeholder="料理、散歩、読書"
          />
        </label>
        <div className="field-label">大切にしている価値観</div>
        <div className="choice-grid">
          {valueOptions.map((value) => (
            <Choice
              key={value}
              value={value}
              selected={values.includes(value)}
              onClick={() =>
                setValues(
                  values.includes(value)
                    ? values.filter((item) => item !== value)
                    : values.length < 3
                      ? [...values, value]
                      : values,
                )
              }
            />
          ))}
        </div>
      </div>
      <div className="form-section">
        <span className="eyebrow">03 / LOOKING AHEAD</span>
        <h2>これからの暮らし。</h2>
        <div className="field-grid">
          <label>
            結婚を考える時期
            <select
              name="timing"
              defaultValue={profile?.timing || "within_two_years"}
            >
              {Object.entries(timingLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            休日の過ごし方
            <select
              name="lifestyle"
              defaultValue={profile?.lifestyle || "balanced"}
            >
              {Object.entries(lifestyleLabel)
                .filter(([key]) => key !== "any")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <label>
            喫煙
            <select name="smoking" defaultValue={profile?.smoking || "no"}>
              <option value="no">吸わない</option>
              <option value="yes">吸う</option>
            </select>
          </label>
          <label>
            子どもについて
            <select
              name="children"
              defaultValue={profile?.children || "discuss"}
            >
              {Object.entries(childrenLabel)
                .filter(([key]) => key !== "any")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </div>
      <div className="notice-panel prototype-note">
        現在は試作版です。正式な本人・独身確認は行いません。証明書や勤務先の詳細などは入力しないでください。
      </div>
      <label className="check-label">
        <input
          name="consent"
          type="checkbox"
          required
          defaultChecked={profile?.consent}
        />
        結婚を真剣に考えており、独身です。入力内容の審査と、承認後の会員への紹介に同意します。
      </label>
      <button type="submit" className="button" disabled={busy}>
        入会申請を提出する <ArrowRight size={17} />
      </button>
    </form>
  );
}
function PreferenceForm({
  initial,
  approved,
  active,
  busy,
  onSave,
}: {
  initial: Preference | null;
  approved: boolean;
  active: boolean;
  busy: boolean;
  onSave: (value: Preference, complete: boolean) => Promise<boolean>;
}) {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState<Preference>(
    initial || {
      target: "man",
      ageMin: 25,
      ageMax: 45,
      ageRequired: false,
      regions: [],
      regionRequired: false,
      values: [],
      priorityValue: "",
      timing: "discuss",
      timingRequired: false,
      lifestyle: "any",
      smoking: "any",
      smokingRequired: false,
      children: "any",
      childrenRequired: false,
      note: "",
    },
  );
  function update<K extends keyof Preference>(key: K, next: Preference[K]) {
    setValue((current) => ({ ...current, [key]: next }));
  }
  const stepTitle = [
    "どんな時間を、大切にしたいですか。",
    "ふたりの暮らしを、思い描いて。",
    "出会いたい人を、少し具体的に。",
    "あなたの想いを、ことばに。",
  ];
  return (
    <section className="preference-layout">
      <aside className="wizard-guide">
        <span className="eyebrow">YOUR WISHES</span>
        <h2>
          未来を描く、
          <br />
          4つのステップ。
        </h2>
        <ol>
          {[
            "大切にしたいこと",
            "これからの暮らし",
            "お相手への希望",
            "ことばと、確認",
          ].map((label, index) => (
            <li
              key={label}
              className={
                step === index ? "current" : step > index ? "done" : ""
              }
            >
              <span>
                {step > index ? (
                  <Check size={15} />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              {label}
            </li>
          ))}
        </ol>
        <Flower2 size={90} strokeWidth={0.8} />
      </aside>
      <form
        className="panel wizard-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (step < 3) {
            if (await onSave(value, false)) setStep(step + 1);
          } else await onSave(value, true);
        }}
      >
        <span className="eyebrow">STEP 0{step + 1} / 04</span>
        <h2>{stepTitle[step]}</h2>
        {step === 0 && (
          <>
            <p className="muted">大切なものを、3つまで。</p>
            <div className="choice-grid one-column">
              {valueOptions.map((option) => (
                <Choice
                  key={option}
                  value={option}
                  selected={value.values.includes(option)}
                  onClick={() => {
                    const next = value.values.includes(option)
                      ? value.values.filter((item) => item !== option)
                      : value.values.length < 3
                        ? [...value.values, option]
                        : value.values;
                    setValue({
                      ...value,
                      values: next,
                      priorityValue: next.includes(value.priorityValue)
                        ? value.priorityValue
                        : next[0] || "",
                    });
                  }}
                />
              ))}
            </div>
            {value.values.length > 0 && (
              <label className="priority-label">
                そのなかで、特に大切なこと
                <select
                  value={value.priorityValue}
                  onChange={(event) =>
                    update("priorityValue", event.target.value)
                  }
                >
                  {value.values.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}
        {step === 1 && (
          <>
            <label>
              結婚を考える時期
              <select
                value={value.timing}
                onChange={(event) =>
                  update("timing", event.target.value as Preference["timing"])
                }
              >
                {Object.entries(timingLabel).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={value.timingRequired}
                onChange={(event) =>
                  update("timingRequired", event.target.checked)
                }
              />
              結婚の時期を必須条件にする
            </label>
            <label>
              一緒に過ごす休日
              <select
                value={value.lifestyle}
                onChange={(event) =>
                  update(
                    "lifestyle",
                    event.target.value as Preference["lifestyle"],
                  )
                }
              >
                {Object.entries(lifestyleLabel).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              子どもについてのお相手の考え
              <select
                value={value.children}
                onChange={(event) =>
                  update(
                    "children",
                    event.target.value as Preference["children"],
                  )
                }
              >
                {Object.entries(childrenLabel).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={value.childrenRequired}
                onChange={(event) =>
                  update("childrenRequired", event.target.checked)
                }
              />
              子どもについての考えを必須条件にする
            </label>
          </>
        )}
        {step === 2 && (
          <>
            <label>
              紹介を希望するお相手
              <select
                value={value.target}
                onChange={(event) =>
                  update("target", event.target.value as Preference["target"])
                }
              >
                <option value="man">男性</option>
                <option value="woman">女性</option>
              </select>
            </label>
            <div className="field-label">年齢の範囲</div>
            <div className="age-range">
              <input
                aria-label="希望年齢の下限"
                type="number"
                min={20}
                max={100}
                value={value.ageMin}
                onChange={(event) =>
                  update("ageMin", Number(event.target.value))
                }
              />
              <span>歳 〜</span>
              <input
                aria-label="希望年齢の上限"
                type="number"
                min={value.ageMin}
                max={100}
                value={value.ageMax}
                onChange={(event) =>
                  update("ageMax", Number(event.target.value))
                }
              />
              <span>歳</span>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={value.ageRequired}
                onChange={(event) =>
                  update("ageRequired", event.target.checked)
                }
              />
              年齢を必須条件にする
            </label>
            <div className="field-label">会いやすい地域</div>
            <div className="region-choice">
              {regionOptions.map((region) => (
                <Choice
                  key={region}
                  value={region}
                  selected={value.regions.includes(region)}
                  onClick={() =>
                    update(
                      "regions",
                      value.regions.includes(region)
                        ? value.regions.filter((item) => item !== region)
                        : [...value.regions, region],
                    )
                  }
                />
              ))}
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={value.regionRequired}
                onChange={(event) =>
                  update("regionRequired", event.target.checked)
                }
              />
              地域を必須条件にする
            </label>
            <label>
              喫煙について
              <select
                value={value.smoking}
                onChange={(event) =>
                  update("smoking", event.target.value as Preference["smoking"])
                }
              >
                <option value="any">こだわらない</option>
                <option value="no">吸わない方</option>
              </select>
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={value.smokingRequired}
                onChange={(event) =>
                  update("smokingRequired", event.target.checked)
                }
              />
              喫煙について必須条件にする
            </label>
          </>
        )}
        {step === 3 && (
          <>
            <label>
              どんな人と、どんな日々を送りたいですか。
              <textarea
                rows={4}
                value={value.note}
                maxLength={300}
                onChange={(event) => update("note", event.target.value)}
                placeholder="疲れた日も、夕食を囲んで何気ない話ができる人と。"
              />
            </label>
            <div className="preference-summary">
              <h3>大切にしたいこと</h3>
              <div className="tag-list">
                {value.values.map((item) => (
                  <span key={item}>
                    {item === value.priorityValue ? "◎ " : ""}
                    {item}
                  </span>
                ))}
              </div>
              <dl className="summary-list">
                <div>
                  <dt>お相手</dt>
                  <dd>
                    {value.target === "man" ? "男性" : "女性"} · {value.ageMin}
                    〜{value.ageMax}歳{value.ageRequired && "（必須）"}
                  </dd>
                </div>
                <div>
                  <dt>地域</dt>
                  <dd>
                    {value.regions.join("・") || "こだわらない"}
                    {value.regionRequired && "（必須）"}
                  </dd>
                </div>
                <div>
                  <dt>結婚の時期</dt>
                  <dd>
                    {timingLabel[value.timing]}
                    {value.timingRequired && "（必須）"}
                  </dd>
                </div>
                <div>
                  <dt>休日</dt>
                  <dd>{lifestyleLabel[value.lifestyle]}</dd>
                </div>
                <div>
                  <dt>子ども</dt>
                  <dd>
                    {childrenLabel[value.children]}
                    {value.childrenRequired && "（必須）"}
                  </dd>
                </div>
                <div>
                  <dt>喫煙</dt>
                  <dd>
                    {value.smoking === "no" ? "吸わない方" : "こだわらない"}
                    {value.smokingRequired && "（必須）"}
                  </dd>
                </div>
              </dl>
            </div>
            <p className="privacy-note">
              <LockKeyhole size={16} />
              自由記述は運営にのみ共有されます。
            </p>
            {!approved && (
              <p className="notice-panel">
                ご紹介は、入会承認後に受け取れます。
              </p>
            )}
            {active && (
              <p className="notice-panel">
                更新した希望は、現在のご縁が終了したあとに適用されます。
              </p>
            )}
          </>
        )}
        <div className="wizard-actions">
          {step > 0 ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={16} />
              戻る
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="button"
            disabled={busy || (step === 0 && value.values.length === 0)}
          >
            {step === 3 ? "この希望を保存する" : "保存して、次へ"}
            <ArrowRight size={17} />
          </button>
        </div>
        <button
          type="button"
          className="draft-button"
          disabled={busy}
          onClick={() => onSave(value, false)}
        >
          下書き保存
        </button>
      </form>
    </section>
  );
}
