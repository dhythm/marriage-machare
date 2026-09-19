import MemberPage, { type SearchParams } from "./member-page";

export const dynamic = "force-dynamic";

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <MemberPage tab="home" searchParams={searchParams} />;
}
