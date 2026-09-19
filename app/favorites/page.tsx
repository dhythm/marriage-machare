import MemberPage, { type SearchParams } from "../member-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "お気に入り" };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <MemberPage tab="favorites" searchParams={searchParams} />;
}
