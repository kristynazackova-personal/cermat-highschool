"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { generateTest, scoreTest, type ScoreResult } from "@/lib/cermat/build";
import type { Choice, GeneratedTask, Part } from "@/lib/cermat/types";
import { EXAM, MATH_FORMULAS, type Subject } from "@/lib/cermat/spec";
import { seedCode, seedFromCode } from "@/lib/cermat/rng";

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
function Stimulus({ title, text }: { title?: string; text: string }) {
  const isTable = text.includes("|");
  return (
    <div
      className="mb-4 rounded-xl border px-4 py-3"
      style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--line) 18%, transparent)" }}
    >
      {title && (
        <p className="mb-2 text-[11px] font-semibold tracking-widest uppercase" style={{ color: "var(--muted)" }}>
          {title}
        </p>
      )}
      {isTable ? <MarkdownTable src={text} /> : <div className="pre-wrap text-[15px] leading-relaxed">{text}</div>}
    </div>
  );
}

function MarkdownTable({ src }: { src: string }) {
  const rows = src
    .trim()
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r.startsWith("|") && !/^\|[\s|:-]+\|$/.test(r))
    .map((r) => r.slice(1, -1).split("|").map((c) => c.trim()));
  if (rows.length === 0) return <div className="pre-wrap">{src}</div>;
  const [head, ...body] = rows;
  return (
    <div className="stimulus-table overflow-x-auto">
      <table>
        <thead>
          <tr>
            {head.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------ podúloha ------------------------------ */

function PartView({
  task,
  part,
  offer,
  value,
  onChange,
  selfScore,
  onSelfScore,
  result,
  showAnswers,
}: {
  task: GeneratedTask;
  part: Part;
  offer?: Choice[];
  value: string;
  onChange: (v: string) => void;
  selfScore: number;
  onSelfScore: (n: number) => void;
  result: { correct: boolean; earned: number } | null;
  showAnswers: boolean;
}) {
  const name = `t${task.n}-${part.id || "x"}`;
  const locked = showAnswers;

  const mark =
    result && !showAnswers
      ? null
      : result
        ? result.correct
          ? { label: "správně", color: "var(--good)", bg: "var(--good-soft)" }
          : { label: "chybně", color: "var(--bad)", bg: "var(--bad-soft)" }
        : null;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-baseline gap-2">
        {part.id && (
          <span className="font-semibold whitespace-nowrap" aria-hidden>
            {/* číselné podúlohy se v sešitu značí „2.1“, písmenné „a)“ */}
            {/^\d+$/.test(part.id) ? `${task.n}.${part.id}` : `${part.id})`}
          </span>
        )}
        {part.prompt && <span className="pre-wrap text-[15px]">{part.prompt}</span>}
        {part.points > 0 && task.scoring !== "stepped" && (
          <span className="text-xs tabular-nums" style={{ color: "var(--muted)" }}>
            ({part.points} b)
          </span>
        )}
        {mark && (
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ color: mark.color, background: mark.bg }}
          >
            {mark.label}
          </span>
        )}
      </div>

      {/* uzavřená úloha */}
      {(part.format === "choice" || part.format === "truefalse") && part.choices && (
        <fieldset className="mt-2" disabled={locked}>
          <legend className="sr-only">
            Úloha {task.n}
            {part.id ? ` ${part.id}` : ""}
          </legend>
          <div className={part.format === "truefalse" ? "flex gap-2" : "grid gap-1.5"}>
            {part.choices.map((ch) => {
              const picked = value === ch.key;
              const isRight = showAnswers && ch.key === part.answer;
              const isWrongPick = showAnswers && picked && ch.key !== part.answer;
              return (
                <label
                  key={ch.key}
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-[15px] transition-colors"
                  style={{
                    borderColor: isRight
                      ? "var(--good)"
                      : isWrongPick
                        ? "var(--bad)"
                        : picked
                          ? "var(--accent)"
                          : "var(--line)",
                    background: isRight
                      ? "var(--good-soft)"
                      : isWrongPick
                        ? "var(--bad-soft)"
                        : picked
                          ? "var(--accent-soft)"
                          : "var(--surface)",
                    cursor: locked ? "default" : "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name={name}
                    value={ch.key}
                    checked={picked}
                    onChange={() => onChange(ch.key)}
                    className="mt-1 accent-current"
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <span className="flex gap-2">
                    {/* U ANO/NE je klíč totožný s textem — nevypisujeme ho dvakrát. */}
                    {ch.key !== ch.text && (
                      <span className="font-semibold tabular-nums" aria-hidden>
                        {ch.key}
                      </span>
                    )}
                    <span className="pre-wrap">{ch.text}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* přiřazovací podúloha — vybírá se písmeno ze společné nabídky */}
      {part.format === "match" && offer && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {offer.map((c) => {
            const picked = value === c.key;
            const isRight = showAnswers && c.key === part.answer;
            const isWrongPick = showAnswers && picked && c.key !== part.answer;
            return (
              <button
                key={c.key}
                type="button"
                disabled={locked}
                onClick={() => onChange(c.key)}
                aria-pressed={picked}
                aria-label={`Možnost ${c.key}: ${c.text}`}
                className="h-9 w-9 rounded-lg border text-sm font-semibold tabular-nums"
                style={{
                  borderColor: isRight ? "var(--good)" : isWrongPick ? "var(--bad)" : picked ? "var(--accent)" : "var(--line)",
                  background: isRight ? "var(--good-soft)" : isWrongPick ? "var(--bad-soft)" : picked ? "var(--accent-soft)" : "var(--surface)",
                  color: "var(--ink)",
                }}
              >
                {c.key}
              </button>
            );
          })}
          {showAnswers && (
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              správně: <strong style={{ color: "var(--good)" }}>{part.answer}</strong>
            </span>
          )}
        </div>
      )}

      {/* otevřená úloha s výsledkem */}
      {(part.format === "open-result" || part.format === "open-work") && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="text"
            inputMode="text"
            value={value}
            disabled={locked}
            onChange={(e) => onChange(e.target.value)}
            placeholder="výsledek"
            aria-label={`Odpověď k úloze ${task.n}${part.id ? " " + part.id : ""}`}
            className="w-44 rounded-lg border px-3 py-2 text-[15px] outline-none focus:ring-2"
            style={{
              borderColor: "var(--line)",
              background: "var(--surface)",
              color: "var(--ink)",
            }}
          />
          {part.unit && (
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              {part.unit}
            </span>
          )}
          {showAnswers && (
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              správně:{" "}
              <strong style={{ color: "var(--good)" }}>
                {part.answer}
                {part.unit ? ` ${part.unit}` : ""}
              </strong>
            </span>
          )}
        </div>
      )}

      {/* konstrukční úloha — hodnotí žák sám */}
      {part.format === "construction" && (
        <div className="mt-2">
          <textarea
            value={value}
            disabled={locked}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            placeholder="Zapište postup konstrukce. Rýsujte na papír."
            aria-label={`Postup konstrukce k úloze ${task.n}`}
            className="w-full rounded-lg border px-3 py-2 text-[15px] outline-none focus:ring-2"
            style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--ink)" }}
          />
          {showAnswers && (
            <div
              className="mt-2 rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--line)", background: "var(--warn-soft)" }}
            >
              <p className="font-medium" style={{ color: "var(--warn)" }}>
                Tuto část ohodnoťte sami podle vzorového postupu níže.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span style={{ color: "var(--muted)" }}>Přiznávám si</span>
                {Array.from({ length: part.points + 1 }, (_, i) => i).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onSelfScore(n)}
                    aria-pressed={selfScore === n}
                    className="h-8 w-8 rounded-md border text-sm font-medium tabular-nums"
                    style={{
                      borderColor: selfScore === n ? "var(--accent)" : "var(--line)",
                      background: selfScore === n ? "var(--accent-soft)" : "var(--surface)",
                      color: "var(--ink)",
                    }}
                  >
                    {n}
                  </button>
                ))}
                <span style={{ color: "var(--muted)" }}>z {part.points} b</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ úloha ------------------------------ */

function TaskView({
  task,
  answers,
  setAnswer,
  selfScores,
  setSelfScore,
  result,
  showAnswers,
}: {
  task: GeneratedTask;
  answers: Record<string, string>;
  setAnswer: (k: string, v: string) => void;
  selfScores: Record<string, number>;
  setSelfScore: (k: string, n: number) => void;
  result: ScoreResult | null;
  showAnswers: boolean;
}) {
  const tr = result?.tasks.find((t) => t.n === task.n);
  const earned = tr?.earned ?? 0;

  return (
    <article
      id={`uloha-${task.n}`}
      className="scroll-mt-20 rounded-2xl border p-5 sm:p-6"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">
          Úloha {task.n}
          <span className="ml-2 text-xs font-normal tabular-nums" style={{ color: "var(--muted)" }}>
            {task.points} {task.points === 1 ? "bod" : task.points < 5 ? "body" : "bodů"}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          {showAnswers && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums"
              style={{
                color: earned === task.points ? "var(--good)" : earned > 0 ? "var(--warn)" : "var(--bad)",
                background:
                  earned === task.points ? "var(--good-soft)" : earned > 0 ? "var(--warn-soft)" : "var(--bad-soft)",
              }}
            >
              {earned} / {task.points} b
            </span>
          )}
          <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            {task.topicLabel}
          </span>
        </div>
      </header>

      {task.stimulus && <Stimulus title={task.stimulusTitle} text={task.stimulus} />}

      {task.prompt && <div className="pre-wrap text-[15px] leading-relaxed">{task.prompt}</div>}

      {task.figure && (
        <div
          className="my-4 flex justify-center"
          style={{ color: "var(--ink)" }}
          // SVG pochází z vlastního generátoru, ne od uživatele
          dangerouslySetInnerHTML={{ __html: task.figure }}
        />
      )}

      {task.offer && (
        <div
          className="mt-3 rounded-xl border px-4 py-3"
          style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--line) 18%, transparent)" }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "var(--muted)" }}>
            Nabídka
          </p>
          <ul className="mt-1.5 grid gap-1 sm:grid-cols-2 text-[15px]">
            {task.offer.map((c) => (
              <li key={c.key} className="flex gap-2">
                <span className="font-semibold tabular-nums">{c.key})</span>
                <span>{c.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {task.parts.map((part) => {
        const key = `${task.n}.${part.id}`;
        const pr = result?.parts.find((p) => p.taskN === task.n && p.partId === part.id) ?? null;
        return (
          <PartView
            key={key}
            task={task}
            part={part}
            offer={task.offer}
            value={answers[key] ?? ""}
            onChange={(v) => setAnswer(key, v)}
            selfScore={selfScores[key] ?? 0}
            onSelfScore={(n) => setSelfScore(key, n)}
            result={pr ? { correct: pr.correct, earned: pr.earned } : null}
            showAnswers={showAnswers}
          />
        );
      })}

      {showAnswers && (
        <details
          className="mt-4 rounded-xl border px-4 py-3"
          style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--line) 18%, transparent)" }}
          open
        >
          <summary className="cursor-pointer text-sm font-medium">Postup řešení</summary>
          <div className="pre-wrap mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {task.solution}
          </div>
        </details>
      )}
    </article>
  );
}

/* ------------------------------ běh testu ------------------------------ */

export default function Runner() {
  const params = useSearchParams();
  const subject: Subject = isSubject(params.get("predmet")) ? (params.get("predmet") as Subject) : "matematika";
  const codeParam = params.get("kod");

  const [seed, setSeed] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);

  // Semínko určíme až na klientu, aby se server a klient neshodly na jiném testu.
  useEffect(() => {
    setSeed(codeParam ? seedFromCode(codeParam) : randomSeed());
  }, [codeParam]);

  const test = useMemo(() => (seed === null ? null : generateTest(subject, seed)), [subject, seed]);

  // Kód testu držíme v adrese, aby šel odkaz sdílet.
  useEffect(() => {
    if (!test) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("kod") !== test.code) {
      url.searchParams.set("predmet", subject);
      url.searchParams.set("kod", test.code);
      window.history.replaceState(null, "", url.toString());
    }
    setLeft(test.minutes * 60);
    setRunning(true);
  }, [test, subject]);

  useEffect(() => {
    if (!running || left === null) return;
    if (left <= 0) return;
    const id = window.setInterval(() => setLeft((v) => (v === null ? null : Math.max(0, v - 1))), 1000);
    return () => window.clearInterval(id);
  }, [running, left]);

  const setAnswer = useCallback((k: string, v: string) => {
    setAnswers((prev) => ({ ...prev, [k]: v }));
  }, []);
  const setSelfScore = useCallback((k: string, n: number) => {
    setSelfScores((prev) => ({ ...prev, [k]: n }));
  }, []);

  const submit = useCallback(() => {
    if (!test) return;
    setRunning(false);
    setResult(scoreTest(test, answers, selfScores));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [test, answers, selfScores]);

  // Po ručním přiznání bodů u konstrukce přepočítáme výsledek.
  useEffect(() => {
    if (!test || !result) return;
    setResult(scoreTest(test, answers, selfScores));
    // Záměrně nesledujeme `answers` — po odevzdání se už nemění.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfScores]);

  const newTest = useCallback(() => {
    const s = randomSeed();
    setAnswers({});
    setSelfScores({});
    setResult(null);
    setSeed(s);
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
