import { demoMembers } from "@/lib/server/runtime";
import { AuthForm } from "../components/auth-form";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AuthForm mode="login" demoMembers={demoMembers()} />;
}
