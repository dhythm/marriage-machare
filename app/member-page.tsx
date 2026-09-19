import { partnersFor, resolveView } from "@/lib/view";
import Dashboard, { type Tab } from "./dashboard";

export type SearchParams = Promise<{ view?: string | string[] }>;

export default async function MemberPage({
  tab,
  searchParams,
}: {
  tab: Tab;
  searchParams: SearchParams;
}) {
  const view = resolveView((await searchParams).view);
  return (
    <Dashboard key={view} tab={tab} view={view} members={partnersFor(view)} />
  );
}
