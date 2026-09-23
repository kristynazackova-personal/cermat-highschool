import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Přijímačky nanečisto — generátor testů",
    template: "%s — Přijímačky nanečisto",
  },
  description:
    "Generátor cvičných testů k jednotné přijímací zkoušce na čtyřleté obory. " +
    "Matematika i český jazyk, pokaždé nové úlohy podle specifikace požadavků Cermatu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className="min-h-dvh flex flex-col">
        <header
          className="no-print sticky top-0 z-40 border-b backdrop-blur"
          style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 88%, transparent)" }}
        >
          <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="font-semibold tracking-tight">
              Přijímačky <span style={{ color: "var(--muted)" }}>nanečisto</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/co-se-ucit" className="hover:underline underline-offset-4">
                Co se učit
              </Link>
              <Link href="/o-projektu" className="hover:underline underline-offset-4">
                O projektu
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer
          className="no-print border-t mt-16"
          style={{ borderColor: "var(--line)" }}
        >
          <div
            className="mx-auto max-w-4xl px-4 py-6 text-xs leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            Neoficiální cvičná pomůcka. Úlohy generuje tento web podle{" "}
            <em>Specifikace požadavků</em> vydávané Cermatem; nejde o zadání Cermatu
            ani o materiál jím schválený. Skutečná zadání z minulých let najdete na{" "}
            <a
              href="https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              prijimacky.cermat.cz
            </a>
            .
          </div>
        </footer>
      </body>
    </html>
  );
}
