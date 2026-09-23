import type { Metadata } from "next";
import Link from "next/link";
import {
  EXAM,
  MATH_TOPICS,
  CZECH_TOPICS,
  MATH_BLUEPRINT,
  CZECH_BLUEPRINT,
  SOURCES,
  type SpecTopic,
  type BlueprintItem,
} from "@/lib/cermat/spec";

export const metadata: Metadata = {
  title: "Co se učit",
  description:
    "Tematické okruhy jednotné přijímací zkoušky z matematiky a českého jazyka podle " +
    "Specifikace požadavků Cermatu, plus plán testu úlohu po úloze.",
};

const FORMAT_LABEL: Record<string, string> = {
  "open-result": "otevřená — jen výsledek",
  "open-work": "otevřená — se zápisem postupu",
  choice: "uzavřená — výběr z nabídky",
  truefalse: "uzavřená — ANO/NE",
  match: "přiřazovací",
  construction: "konstrukční",
};

function TopicList({ topics }: { topics: SpecTopic[] }) {
  return (
    <div className="mt-4 grid gap-4">
      {topics.map((t) => (
        <section
          key={t.key}
          className="rounded-2xl border p-5"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <h3 className="font-semibold tracking-tight">{t.area}</h3>
          <ul className="mt-3 grid gap-1.5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {t.skills.map((s) => (
              <li key={s} className="flex gap-2">
                <span aria-hidden style={{ color: "var(--accent)" }}>
                  ·
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function BlueprintTable({ items, topics }: { items: BlueprintItem[]; topics: SpecTopic[] }) {
  const label = (key: string) => topics.find((t) => t.key === key)?.area ?? key;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr style={{ color: "var(--muted)" }}>
            <th className="border-b py-2 pr-3 text-left font-medium" style={{ borderColor: "var(--line)" }}>
              Úloha
            </th>
            <th className="border-b py-2 pr-3 text-left font-medium" style={{ borderColor: "var(--line)" }}>
              Okruh
            </th>
            <th className="border-b py-2 pr-3 text-left font-medium" style={{ borderColor: "var(--line)" }}>
              Typ úlohy
            </th>
            <th className="border-b py-2 text-right font-medium" style={{ borderColor: "var(--line)" }}>
              Body
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.n}>
              <td className="border-b py-2 pr-3 tabular-nums" style={{ borderColor: "var(--line)" }}>
                {i.n}
              </td>
              <td className="border-b py-2 pr-3" style={{ borderColor: "var(--line)" }}>
                {label(i.topic)}
              </td>
              <td className="border-b py-2 pr-3" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
                {FORMAT_LABEL[i.format] ?? i.format}
              </td>
              <td className="border-b py-2 text-right tabular-nums" style={{ borderColor: "var(--line)" }}>
                {i.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubjectHeader({
  label,
  minutes,
  tasks,
  points,
  note,
  allowed,
}: {
  label: string;
  minutes: number;
  tasks: number;
  points: number;
  note: string;
  allowed: string;
}) {
  return (
    <>
      <h2 className="text-2xl font-semibold tracking-tight">{label}</h2>
      <p className="mt-2 text-sm tabular-nums" style={{ color: "var(--muted)" }}>
        {minutes} minut · {tasks} úloh · {points} bodů
      </p>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        {note}
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        <strong style={{ color: "var(--ink)" }}>Pomůcky:</strong> {allowed}
      </p>
    </>
  );
}

export default function StudyPage() {
  const m = EXAM.subjects.matematika;
  const c = EXAM.subjects.cestina;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
        Co se učit na přijímačky
      </h1>
      <p className="mt-4 leading-relaxed text-pretty" style={{ color: "var(--muted)" }}>
        Rozsah zkoušky vymezuje <em>Specifikace požadavků</em> vydávaná Cermatem. Vychází
        ze vzdělávacích oborů <em>Český jazyk a literatura</em> a <em>Matematika a její
        aplikace</em> podle Rámcového vzdělávacího programu pro základní vzdělávání — nic
        nad rámec učiva základní školy se ve zkoušce objevit nemá. Platí pro{" "}
        {EXAM.branch.toLowerCase()}, školní rok {EXAM.schoolYear}.
      </p>
      <p className="mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
        Níže je celý seznam okruhů a k nim plán testu — co se na které pozici v testu
        objevuje a za kolik bodů. Podle téhož plánu se generují{" "}
        <Link href="/" className="underline underline-offset-4" style={{ color: "var(--accent)" }}>
          cvičné testy na tomto webu
        </Link>
        .
      </p>

      <hr className="my-10" style={{ borderColor: "var(--line)" }} />

      <SubjectHeader
        label={m.label}
        minutes={m.minutes}
        tasks={MATH_BLUEPRINT.length}
        points={m.points}
        note={m.note}
        allowed={m.allowed}
      />
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        Tematické okruhy
      </h3>
      <TopicList topics={MATH_TOPICS} />
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        Plán testu
      </h3>
      <BlueprintTable items={MATH_BLUEPRINT} topics={MATH_TOPICS} />

      <hr className="my-10" style={{ borderColor: "var(--line)" }} />

      <SubjectHeader
        label={c.label}
        minutes={c.minutes}
        tasks={CZECH_BLUEPRINT.length}
        points={c.points}
        note={c.note}
        allowed={c.allowed}
      />
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        Tematické okruhy
      </h3>
      <TopicList topics={CZECH_TOPICS} />
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        Plán testu
      </h3>
      <BlueprintTable items={CZECH_BLUEPRINT} topics={CZECH_TOPICS} />

      <hr className="my-10" style={{ borderColor: "var(--line)" }} />

      <h2 className="text-xl font-semibold tracking-tight">Oficiální zdroje</h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        Skutečná zadání z minulých let i závazné znění specifikace najdete u Cermatu.
        Doporučený postup: projděte si nejdřív pár skutečných testů, ať víte, jak zkouška
        vypadá, a pak trénujte na generovaných.
      </p>
      <ul className="mt-4 grid gap-3">
        {SOURCES.map((s) => (
          <li
            key={s.url}
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
              style={{ color: "var(--accent)" }}
            >
              {s.label}
            </a>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              {s.note}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
