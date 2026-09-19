import { engine, getSession } from "@/lib/server/runtime";
import { AuthForm } from "../components/auth-form";
import { StaffPanel } from "../components/staff-panel";
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await getSession();
  return session?.role === "staff" ? (
    <StaffPanel state={engine.staffSnapshot()} />
  ) : (
    <AuthForm mode="staff" />
  );
}
