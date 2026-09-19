import type { Metadata } from "next";
import "./globals.css";
import "./rose-theme.css";
export const metadata: Metadata = {
  title: {
    default: "TOWARI — この先を、ともにする人と。",
    template: "%s — TOWARI",
  },
  description:
    "価値観から、人生をともにする人に出会う。審査制婚活サービス TOWARI。",
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
