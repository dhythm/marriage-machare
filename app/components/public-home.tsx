import {
  ArrowRight,
  ArrowUpRight,
  Flower2,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export function PublicHome() {
  return (
    <div className="tw public-page">
      <header className="public-header">
        <Link href="/" className="wordmark">
          TOWARI<span>この先を、ともにする人と。</span>
        </Link>
        <nav>
          <a href="#philosophy">私たちの想い</a>
          <a href="#journey">ご縁が育つまで</a>
          <Link href="/login">ログイン</Link>
          <Link className="button compact" href="/register">
            入会申請 <ArrowUpRight size={16} />
          </Link>
        </nav>
      </header>
      <main>
        <section className="public-hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> A PARTNER FOR YOUR EVERYDAY
            </div>
            <h1>
              ときめきの、その先。
              <br />
              ともに生きる人と。
            </h1>
            <p>
              うれしい日も、何気ない日も。
              <br />
              これからの毎日を、分かち合える人がいる。
              <br />
              TOWARIは、あなたの想いからはじまる婚活です。
            </p>
            <Link href="/register" className="button">
              あなたの一歩を、ここから <ArrowRight size={19} />
            </Link>
            <div className="hero-caption">
              <ShieldCheck size={16} /> 審査制・一つのご縁に向き合う婚活
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-window">
              <div className="window-light" />
              <div className="art-branch branch-one" />
              <div className="art-branch branch-two" />
            </div>
            <div className="art-table" />
            <div className="art-vase">
              <i />
              <i />
              <i />
            </div>
            <div className="art-cup cup-one" />
            <div className="art-cup cup-two" />
            <div className="art-caption">
              A quiet moment.
              <br />A life together.
            </div>
            <span className="art-number">01 — THE BEGINNING</span>
          </div>
        </section>
        <section className="promise-strip">
          <span>
            <ShieldCheck size={20} /> 想いを確かめる、入会審査
          </span>
          <span>
            <HeartHandshake size={20} /> 価値観からつながる、ご紹介
          </span>
          <span>
            <LockKeyhole size={20} /> 写真は、お互いの希望が揃ってから
          </span>
        </section>
        <section className="philosophy-section" id="philosophy">
          <div>
            <span className="eyebrow">OUR PHILOSOPHY</span>
            <h2>
              探したいのは、
              <br />
              一緒にいる自分を
              <br />
              好きでいられる人。
            </h2>
          </div>
          <div className="philosophy-text">
            <Flower2 size={39} strokeWidth={1.2} />
            <p>
              条件だけでも、見た目だけでも分からない。
              <br />
              大切にしていること。思い描く暮らし。
              <br />
              まずは、あなたの言葉を聞かせてください。
            </p>
            <p>
              想いの重なる方を、理由とともにご紹介。
              <br />
              お互いが「お話ししたい」と感じたら、
              <br />
              次の紹介を止めて、そのご縁を丁寧に育てます。
            </p>
          </div>
        </section>
        <section className="journey-section" id="journey">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR JOURNEY</span>
              <h2>想いから、ご縁へ。</h2>
            </div>
            <p>ひとつずつ、あなたのペースで。</p>
          </div>
          <div className="journey-grid">
            {[
              {
                n: "01",
                title: "あなたのことを",
                text: "入会申請で、今の暮らしと結婚への想いを。運営が内容を確認します。",
              },
              {
                n: "02",
                title: "これからのことを",
                text: "大切にしたい価値観や、出会いたいお相手のイメージを整理します。",
              },
              {
                n: "03",
                title: "重なる想いを",
                text: "希望に合う方を複数名ご紹介。写真を見ずに、言葉から人柄を知ります。",
              },
              {
                n: "04",
                title: "ひとりの人と",
                text: "双方の希望が揃ったら写真を公開。面談を通じて、一つのご縁を育てます。",
              },
            ].map((item) => (
              <article key={item.n}>
                <span>{item.n}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="public-cta">
          <Flower2 size={32} />
          <h2>この先を、ともにする人と。</h2>
          <Link className="button" href="/register">
            入会申請をはじめる <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="public-footer">
        <Link href="/" className="wordmark">
          TOWARI
        </Link>
        <p>
          現在はインメモリで動作する試作版です。正式な本人・独身確認は行いません。実際の証明書は送信しないでください。
        </p>
        <small>© TOWARI</small>
      </footer>
    </div>
  );
}
