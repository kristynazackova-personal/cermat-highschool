import Link from "next/link";
import { EXAM, MATH_BLUEPRINT, CZECH_BLUEPRINT } from "@/lib/cermat/spec";

function Card({
  href,
  title,
  minutes,
  tasks,
  points,
  areas,
  accent,
}: {
  href: string;
  title: string;
  minutes: number;
  tasks: number;
  points: number;
  areas: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border p-6 transition-all hover:-translate-y-0.5"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <span
          aria-hidden
          className="mt-1 shrink-0 h-8 w-8 rounded-full grid place-items-center text-sm transition-transform group-hover:translate-x-0.5"
          style={{ background: accent, color: "var(--surface)" }}
        >
          →
        </span>
      </div>
      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm" style={{ color: "var(--muted)" }}>
        <div className="flex gap-1.5">
          <dt>Čas</dt>
          <dd className="font-medium" style={{ color: "var(--ink)" }}>
            {minutes} min
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Úloh</dt>
          <dd className="font-medium" style={{ color: "var(--ink)" }}>
            {tasks}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Bodů</dt>
          <dd className="font-medium" style={{ color: "var(--ink)" }}>
            {points}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        {areas}
      </p>
      <p className="mt-5 text-sm font-medium" style={{ color: accent }}>
        Vygenerovat nový test →
      </p>
    </Link>
  );
}

export default function Home() {
  const m = EXAM.subjects.matematika;
  const c = EXAM.subjects.cestina;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
        Pokaždé nový test na přijímačky
      </h1>
      <p
        className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-pretty"
        style={{ color: "var(--muted)" }}
      >
        Jedno kliknutí vygeneruje celý cvičný test k jednotné přijímací zkoušce na
        čtyřleté obory — se stejnou stavbou, stejným rozložením typů úloh i stejným
        bodováním, jaké má skutečná zkouška. Úlohy se generují znovu pokaždé, takže
        se nedají naučit nazpaměť.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card
          href="/test?predmet=matematika"
          title={m.label}
          minutes={m.minutes}
          tasks={MATH_BLUEPRINT.length}
          points={m.points}
          areas="Číslo a proměnná · Závislosti a práce s daty · Geometrie · Nestandardní aplikační úlohy"
          accent="#1d4ed8"
        />
        <Card
          href="/test?predmet=cestina"
          title={c.label}
          minutes={c.minutes}
          tasks={CZECH_BLUEPRINT.length}
          points={c.points}
          areas="Porozumění textu · Sloh · Pravopis · Slovní zásoba · Tvarosloví · Skladba · Literatura"
          accent="#7c3aed"
        />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Nebo po menších kouscích</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link
            href="/procvicovani"
            className="group block rounded-2xl border p-5 transition-all hover:-translate-y-0.5"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            <h3 className="font-semibold tracking-tight">Procvičování</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Úlohy po jedné, bez časomíry. Po každé odpovědi hned uvidíte, jestli
              je správně, jaké je správné řešení a proč. Jde vybrat jen jeden okruh.
            </p>
            <p className="mt-3 text-sm font-medium" style={{ color: "#1d4ed8" }}>
              Začít procvičovat →
            </p>
          </Link>
          <Link
            href="/karticky"
            className="group block rounded-2xl border p-5 transition-all hover:-translate-y-0.5"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            <h3 className="font-semibold tracking-tight">Kartičky</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Pravidla, pojmy a vzorce, které se hodí umět zpaměti — s vysvětlením,
              proč to tak je. Co si nejste jistí, se vrátí zpátky.
            </p>
            <p className="mt-3 text-sm font-medium" style={{ color: "#7c3aed" }}>
              Otevřít kartičky →
            </p>
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-lg font-semibold tracking-tight">Jak to funguje</h2>
        <ol
          className="mt-4 grid gap-4 sm:grid-cols-3 text-sm leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          {[
            [
              "Plán testu",
              "Každá pozice v testu má pevně daný okruh, typ úlohy a bodovou dotaci — podle Specifikace požadavků Cermatu.",
            ],
            [
              "Generování",
              "Na každou pozici se dosadí nově vytvořená úloha. Čísla, zadání i pořadí nabídek jsou pokaždé jiné.",
            ],
            [
              "Vyhodnocení",
              "Po odevzdání uvidíte body, správné odpovědi i komentovaný postup u každé úlohy.",
            ],
          ].map(([h, t], i) => (
            <li
              key={h}
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 font-medium" style={{ color: "var(--ink)" }}>
                {h}
              </h3>
              <p className="mt-1">{t}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 text-sm" style={{ color: "var(--muted)" }}>
        Nevíte, co se máte učit?{" "}
        <Link href="/co-se-ucit" className="underline underline-offset-4" style={{ color: "var(--accent)" }}>
          Přehled všech tematických okruhů
        </Link>{" "}
        vychází ze stejné specifikace, podle které se testy generují.
      </p>
    </div>
  );
}
