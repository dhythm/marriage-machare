import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "../landing.css";

const steps = [
  {
    title: "あなたの想いを、聞かせてください。",
    text: "入会申請では、今の暮らしと結婚への想いを。運営による審査のあと、大切な価値観やお相手への希望を整理します。",
  },
  {
    title: "顔より先に、ことばで出会う。",
    text: "お互いの希望に合う方を、紹介の理由とともに複数名ご紹介。写真はまだ見せず、思い描く暮らしや人柄から知っていきます。",
  },
  {
    title: "想いが重なったら、ひとりの人と。",
    text: "双方が「お話ししたい」と希望したら、写真を公開。新しい紹介をお休みして、目の前のご縁に向き合います。",
  },
];
const questions = [
  {
    q: "入会前に、会員の情報は見られますか？",
    a: "会員の写真やプロフィールは公開していません。入会が承認され、出会いの希望を入力した方にだけ、条件の合うお相手をご紹介します。",
  },
  {
    q: "お相手の写真は、いつ見られますか？",
    a: "お互いが「お話ししたい」と希望したあとに公開します。紹介の段階では、価値観や暮らしについてのことばから、その人を知っていただきます。",
  },
  {
    q: "複数の方と、同時にお話しできますか？",
    a: "紹介された複数名を検討できますが、成立するご縁はおひとりだけ。成立中は新しい紹介を停止し、その方との時間を大切にしていただきます。",
  },
  {
    q: "ご縁を終了したいときは？",
    a: "アプリ内でお断りを伝えて終了します。終了した事実はお相手にも通知され、双方の履歴に残ります。その後、次の紹介を受けられます。アプリ外でのやり取りは、この操作では終了しません。",
  },
];

export function PublicHome() {
  return (
    <div className="lp">
      <a className="lp-skip" href="#main">
        本文へ移動
      </a>
      <header className="lp-header">
        <Link href="/" className="lp-logo" aria-label="TONARI ホーム">
          TONARI<span>この先を、ともにする人と。</span>
        </Link>
        <nav aria-label="サービス案内">
          <a className="lp-nav-story" href="#philosophy">
            TONARIの想い
          </a>
          <a className="lp-nav-story" href="#journey">
            出会いのかたち
          </a>
          <Link className="lp-login" href="/login">
            ログイン
          </Link>
          <Link className="lp-nav-entry" href="/register">
            入会申請 <ArrowUpRight size={17} />
          </Link>
        </nav>
      </header>
      <main id="main">
        <section className="lp-hero" aria-labelledby="lp-title">
          <div className="lp-hero-media">
            <Image
              className="lp-hero-image"
              src="/brand/shared-morning.webp"
              alt="朝の食卓で、ゆっくりと言葉を交わすふたり。TONARIのブランドイメージ"
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="lp-hero-shade" />
          <div className="lp-hero-copy">
            <p className="lp-hero-kicker">
              一生のパートナーを探す、審査制の婚活。
            </p>
            <h1 id="lp-title">
              何でもない日を、
              <br />
              かけがえのない
              <br className="lp-mobile-break" />
              日々に。
            </h1>
            <p className="lp-hero-line">
              おかえり、と言いたい人がいる。
              <br />
              そんな未来を、ここから。
            </p>
          </div>
          <a className="lp-scroll" href="#philosophy">
            <ArrowDown size={17} /> TONARIについて
          </a>
          <Link className="lp-hero-entry" href="/register">
            <span>
              <small>この先を、ともにする人と。</small>
              あなたの想いから、はじめる
            </span>
            <ArrowUpRight size={27} strokeWidth={1.3} />
          </Link>
        </section>
        <div className="lp-photo-caption">
          <span>ふたりの日常を、これから。</span>
          <span>写真はブランドイメージです。実際の会員ではありません。</span>
        </div>

        <section
          className="lp-story"
          id="philosophy"
          aria-labelledby="lp-story-title"
        >
          <div className="lp-story-image-wrap">
            <Image
              src="/brand/table-for-two.webp"
              alt="木のテーブルに並ぶふたつのカップと、朝の光"
              width={1024}
              height={1536}
              sizes="(max-width: 700px) 75vw, 40vw"
              className="lp-story-image"
            />
            <span className="lp-image-note">
              いつもの食卓に、あなたがいる。
            </span>
          </div>
          <div className="lp-story-copy">
            <p className="lp-section-label">私たちが、大切にしていること</p>
            <h2 id="lp-story-title">
              恋の、その先にある
              <br />
              暮らしまで。
            </h2>
            <p>
              特別な日の、ときめきも。
              <br />
              何もない日の、心地よさも。
            </p>
            <p>
              一緒にごはんを食べて、今日の話をする。
              <br />
              うれしいことは分け合って、
              <br />
              うまくいかない日は、そっと隣にいる。
            </p>
            <p>
              探したいのは、そんな日々を
              <br />
              重ねていける、生涯のパートナー。
            </p>
            <p>
              TONARIは、あなたが大切にしたい暮らしから、
              <br className="lp-desktop-break" />
              ふたりの未来を考える婚活です。
            </p>
            <span className="lp-story-sign">ともに、生きていく。</span>
          </div>
        </section>

        <section className="lp-values" aria-labelledby="lp-values-title">
          <div className="lp-values-heading">
            <p className="lp-section-label">
              出会いのはじまりは、あなたの中に。
            </p>
            <h2 id="lp-values-title">
              どんな人と、よりも。
              <br />
              どんな毎日を、ともに。
            </h2>
            <p>
              休日の過ごし方。家族との時間。
              <br />
              これからの人生で、大切にしたいこと。
              <br />
              あなたの想いが、ご縁の道しるべになります。
            </p>
            <Link href="/register" className="lp-light-link">
              あなたの想いを聞かせてください <ArrowRight size={20} />
            </Link>
          </div>
          <div className="lp-value-notes">
            <p>
              <span>01</span>何気ないことも、
              <br />
              話し合えるふたりでいたい。
            </p>
            <p>
              <span>02</span>一緒の時間も、
              <br />
              ひとりの時間も大切にしたい。
            </p>
            <p>
              <span>03</span>十年先も、同じ食卓で
              <br />
              笑っていたい。
            </p>
            <small>正解はありません。あなたのことばで。</small>
          </div>
        </section>

        <section
          className="lp-journey"
          id="journey"
          aria-labelledby="lp-journey-title"
        >
          <div className="lp-journey-heading">
            <p className="lp-section-label">TONARIの出会い方</p>
            <h2 id="lp-journey-title">
              急がずに。
              <br />
              でも、まっすぐに。
            </h2>
            <p>ひとつのご縁を、丁寧に育てるために。</p>
          </div>
          <ol className="lp-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="lp-step-number">0{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="lp-faq" aria-labelledby="lp-faq-title">
          <div>
            <p className="lp-section-label">はじめる前に</p>
            <h2 id="lp-faq-title">気になること。</h2>
          </div>
          <div className="lp-questions">
            {questions.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <span aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="lp-invitation">
          <p>まだ出会っていない、ふたりの毎日へ。</p>
          <h2>
            この先を、
            <br className="lp-mobile-break" />
            ともにする人と。
          </h2>
          <Link href="/register">
            入会申請をはじめる <ArrowUpRight size={24} />
          </Link>
          <span>TONARI</span>
        </section>
      </main>
      <footer className="lp-footer">
        <p>この先を、ともにする人と。</p>
        <div>
          <Link href="/login">
            会員ログイン <ArrowUpRight size={13} />
          </Link>
          <a href="#journey">出会いのかたち</a>
          <small>© TONARI</small>
        </div>
        <p className="lp-prototype">
          現在は試作版です。正式な本人・独身確認は行いません。実際の証明書は送信しないでください。
        </p>
      </footer>
    </div>
  );
}
