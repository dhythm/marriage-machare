import MemberPage, { type SearchParams } from "../member-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "お見合い" };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <MemberPage tab="meetings" searchParams={searchParams} />;
}
