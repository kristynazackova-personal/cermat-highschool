import type { Metadata } from "next";
import Cards from "./cards";

export const metadata: Metadata = {
  title: "Kartičky",
  description:
    "Pravidla, pojmy a vzorce k jednotné přijímací zkoušce — na líci otázka, " +
    "na rubu odpověď i s vysvětlením, proč to tak je.",
};

export default function Page() {
  return <Cards />;
}
