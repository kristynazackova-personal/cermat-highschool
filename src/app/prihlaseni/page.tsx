import type { Metadata } from "next";
import SignIn from "./signin";

export const metadata: Metadata = { title: "Přihlášení" };

export default function Page() {
  return <SignIn />;
}
