import { members } from "./data";

export type View = "men" | "women";

export function resolveView(param: string | string[] | undefined): View {
  return param === "men" ? "men" : "women";
}

export function partnersFor(view: View) {
  const gender = view === "men" ? "man" : "woman";
  return members.filter((member) => member.gender === gender);
}
