import MemberPage, { type SearchParams } from "../member-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "マイプロフィール" };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <MemberPage tab="profile" searchParams={searchParams} />;
}
