"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { generateTest, scoreTest, type ScoreResult } from "@/lib/cermat/build";
import { TaskView } from "@/components/task-view";
import { EXAM, MATH_FORMULAS, type Subject } from "@/lib/cermat/spec";
import { seedFromCode } from "@/lib/cermat/rng";

/* ------------------------------ pomocné ------------------------------ */

function isSubject(v: string | null): v is Subject {
  return v === "matematika" || v === "cestina";
}

function randomSeed() {
  return Math.floor(Math.random() * 2 ** 30);
}

function mmss(total: number) {
  const s = Math.max(0, total);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Výchozí text může být prostý text, nebo tabulka zapsaná v markdownu. */
/* ------------------------------ běh testu ------------------------------ */

export default function Runner() {
  const params = useSearchParams();
  const subject: Subject = isSubject(params.get("predmet")) ? (params.get("predmet") as Subject) : "matematika";
  const codeParam = params.get("kod");

  // Semínko a okamžik startu vznikají spolu: díky tomu se konec času odvodí
  // čistou funkcí a Date.now() se během renderu nevolá.
  const [start, setStart] = useState<{ seed: number; at: number } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const topRef = useRef<HTMLDivElement>(null);

  // Semínko určíme až na klientu — kdyby ho zvolil server, vyrenderoval by
  // jiný test než ten, který se pak objeví v prohlížeči.
   
  useEffect(() => {
    setStart({ seed: codeParam ? seedFromCode(codeParam) : randomSeed(), at: Date.now() });
  }, [codeParam]);

  const test = useMemo(
    () => (start === null ? null : generateTest(subject, start.seed)),
    [subject, start],
  );

  // Konec času držíme jako OKAMŽIK, ne jako zbývající sekundy. Odpočet se pak
  // odvozuje a nemůže se stát, že by ho překreslení nebo pozastavení záložky
  // natáhlo. (Stejný důvod, proč má `attempts.deadline_at` v databázi timestamp.)
  const deadline = test && start ? start.at + test.minutes * 60_000 : null;

  // Kód testu držíme v adrese, aby šel odkaz sdílet.
  useEffect(() => {
    if (!test) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("kod") !== test.code) {
      url.searchParams.set("predmet", subject);
      url.searchParams.set("kod", test.code);
      window.history.replaceState(null, "", url.toString());
    }
  }, [test, subject]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const left =
    deadline === null ? null : Math.max(0, Math.round((deadline - now) / 1000));

  const setAnswer = useCallback((k: string, v: string) => {
    setAnswers((prev) => ({ ...prev, [k]: v }));
  }, []);
  const setSelfScore = useCallback((k: string, n: number) => {
    setSelfScores((prev) => ({ ...prev, [k]: n }));
  }, []);

  // Výsledek se odvozuje, neukládá. Přiznání bodů u konstrukce ho tím pádem
  // přepočítá samo, bez efektu, který by po každé změně překresloval podruhé.
  const result: ScoreResult | null = useMemo(
    () => (test && submitted ? scoreTest(test, answers, selfScores) : null),
    [test, submitted, answers, selfScores],
  );

  const submit = useCallback(() => {
    if (!test) return;
    setSubmitted(true);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [test]);

  const newTest = useCallback(() => {
    setAnswers({});
    setSelfScores({});
    setSubmitted(false);
    const at = Date.now();
    setNow(at);
    setStart({ seed: randomSeed(), at });
  }, []);

  if (!test) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center" style={{ color: "var(--muted)" }}>
        Připravuji test…
      </div>
    );
  }

  const cfg = EXAM.subjects[subject];
  const answered = test.tasks.reduce(
    (s, t) => s + t.parts.filter((p) => (answers[`${t.n}.${p.id}`] ?? "").trim() !== "").length,
    0,
  );
  const totalParts = test.tasks.reduce((s, t) => s + t.parts.length, 0);
  const timeUp = left === 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div ref={topRef} />

      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{test.subjectLabel}</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {EXAM.branch} · {test.tasks.length} úloh · {test.totalPoints} bodů · kód testu{" "}
            <code className="font-mono">{test.code}</code>
          </p>
        </div>
        <div
          className="no-print rounded-xl border px-3 py-2 text-right tabular-nums"
          style={{
            borderColor: timeUp ? "var(--bad)" : "var(--line)",
            background: timeUp ? "var(--bad-soft)" : "var(--surface)",
          }}
        >
          <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            {timeUp ? "čas vypršel" : "zbývá"}
          </div>
          <div className="text-xl font-semibold" style={{ color: timeUp ? "var(--bad)" : "var(--ink)" }}>
            {mmss(left ?? cfg.minutes * 60)}
          </div>
        </div>
      </div>

      <p
        className="mb-6 rounded-xl border px-4 py-3 text-sm leading-relaxed"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--line) 18%, transparent)" }}
      >
        <strong>Pokyny:</strong> Na řešení máte {cfg.minutes} minut. {cfg.note} {cfg.allowed}
      </p>

      {test.intro && (
        <section
          className="mb-4 rounded-2xl border p-5 sm:p-6"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          aria-label="Výchozí text"
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "var(--muted)" }}>
            {test.intro.title}
          </p>
          <div className="pre-wrap mt-2 text-[15px] leading-relaxed">{test.intro.text}</div>
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
            K výchozímu textu se vztahují {test.intro.tasks}.
          </p>
        </section>
      )}

      <div className="grid gap-4">
        {test.tasks.map((task) => (
          <TaskView
            key={task.n}
            task={task}
            answers={answers}
            setAnswer={setAnswer}
            selfScores={selfScores}
            setSelfScore={setSelfScore}
            result={result}
            showAnswers={!!result}
          />
        ))}
      </div>

      {subject === "matematika" && (
        <details
          className="mt-6 rounded-2xl border px-5 py-4"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <summary className="cursor-pointer text-sm font-semibold">
            Vybrané vzorce a vztahy
            <span className="ml-2 font-normal" style={{ color: "var(--muted)" }}>
              — u zkoušky je najdete na poslední straně testového sešitu
            </span>
          </summary>
          <div className="mt-3 grid gap-2 text-sm" style={{ color: "var(--muted)" }}>
            <p>
              <strong style={{ color: "var(--ink)" }}>Druhé mocniny 11–20:</strong> {MATH_FORMULAS.squares}
            </p>
            <p>
              <strong style={{ color: "var(--ink)" }}>Ludolfovo číslo:</strong> {MATH_FORMULAS.pi}
            </p>
            <p>
              <strong style={{ color: "var(--ink)" }}>Rozklad na součin:</strong>
            </p>
            <ul className="ml-4 grid gap-0.5">
              {MATH_FORMULAS.products.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p>
              <strong style={{ color: "var(--ink)" }}>Kruh:</strong> {MATH_FORMULAS.circle}
            </p>
          </div>
        </details>
      )}

      {!result ? (
        <div className="no-print sticky bottom-0 mt-6 -mx-4 border-t px-4 py-3 backdrop-blur"
          style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm tabular-nums" style={{ color: "var(--muted)" }}>
              Vyplněno {answered} z {totalParts}
            </span>
            <button
              type="button"
              onClick={submit}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              Odevzdat a vyhodnotit
            </button>
          </div>
        </div>
      ) : (
        <ResultPanel result={result} onNew={newTest} subject={subject} />
      )}
    </div>
  );
}

/* ------------------------------ výsledek ------------------------------ */

function ResultPanel({
  result,
  onNew,
  subject,
}: {
  result: ScoreResult;
  onNew: () => void;
  subject: Subject;
}) {
  const other: Subject = subject === "matematika" ? "cestina" : "matematika";
  return (
    <section
      className="mt-8 rounded-2xl border p-6"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <h2 className="text-lg font-semibold tracking-tight">Výsledek</h2>
      <p className="mt-2 text-3xl font-semibold tabular-nums">
        {result.earned}
        <span className="text-xl font-normal" style={{ color: "var(--muted)" }}>
          {" "}
          / {result.total} bodů
        </span>
        <span className="ml-3 text-xl font-normal" style={{ color: "var(--muted)" }}>
          ({result.percent} %)
        </span>
      </p>
      {result.selfGradedPoints > 0 && (
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Z toho {result.selfGradedPoints} b připadá na ručně hodnocenou konstrukční část.
        </p>
      )}

      <h3 className="mt-6 text-sm font-semibold">Podle tematických okruhů</h3>
      <ul className="mt-2 grid gap-2">
        {result.byTopic.map((t) => {
          const pct = t.total ? Math.round((t.earned / t.total) * 100) : 0;
          return (
            <li key={t.topic} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span>{t.label}</span>
                <span className="tabular-nums shrink-0" style={{ color: "var(--muted)" }}>
                  {t.earned} / {t.total} b
                </span>
              </div>
              <div
                className="mt-1 h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "var(--line)" }}
                role="img"
                aria-label={`${t.label}: ${pct} procent`}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: pct >= 70 ? "var(--good)" : pct >= 40 ? "var(--warn)" : "var(--bad)",
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onNew}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          Nový test
        </button>
        <Link
          href={`/test?predmet=${other}`}
          className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--line)" }}
        >
          Zkusit {other === "matematika" ? "matematiku" : "češtinu"}
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--line)" }}
        >
          Vytisknout
        </button>
      </div>
    </section>
  );
}
