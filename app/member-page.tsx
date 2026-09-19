import { engine, requireMemberPage } from "@/lib/server/runtime";
import { Portal } from "./components/portal";
export default async function MemberPage({
  section = "home",
}: {
  section?: string;
}) {
  const id = await requireMemberPage();
  return <Portal state={engine.snapshot(id)} section={section} />;
}
