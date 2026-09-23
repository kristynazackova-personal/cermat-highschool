import type { Metadata } from "next";
import Practice from "./practice";

export const metadata: Metadata = {
  title: "Procvičování",
  description:
    "Úlohy po jedné, s okamžitou zpětnou vazbou: hned vidíte, jestli je odpověď správně, " +
    "jaké je správné řešení a proč.",
};

export default function Page() {
  return <Practice />;
}
