import type { Metadata } from "next";
import "./experience.css";
export const metadata: Metadata = {
  title: {
    default: "TONARI — この先を、ともにする人と。",
    template: "%s — TONARI",
  },
  description:
    "価値観から、人生をともにする人に出会う。審査制婚活サービス TONARI。",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
