import MemberPage, { type SearchParams } from "../member-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "お相手を探す" };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <MemberPage tab="discover" searchParams={searchParams} />;
}
