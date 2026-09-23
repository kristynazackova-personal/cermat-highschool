import { Suspense } from "react";
import type { Metadata } from "next";
import Runner from "./runner";

export const metadata: Metadata = {
  title: "Cvičný test",
  description: "Nově vygenerovaný cvičný test k jednotné přijímací zkoušce.",
};

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-24 text-center" style={{ color: "var(--muted)" }}>
          Připravuji test…
        </div>
      }
    >
      <Runner />
    </Suspense>
  );
}
