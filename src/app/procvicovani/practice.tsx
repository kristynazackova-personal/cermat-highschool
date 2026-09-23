"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { practiceTask, scoreSingleTask } from "@/lib/cermat/build";
import { TaskView } from "@/components/task-view";
import { MATH_TOPICS, CZECH_TOPICS, EXAM, type Subject } from "@/lib/cermat/spec";

function randomSeed() {
  return Math.floor(Math.random() * 2 ** 30);
}

type Checked = { earned: number; points: number; correctParts: number; totalParts: number };

export default function Practice() {
  const [subject, setSubject] = useState<Subject>("matematika");
  const [topic, setTopic] = useState<string | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selfScore, setSelfScore] = useState(0);
  const [checked, setChecked] = useState<Checked | null>(null);
  const [tally, setTally] = useState({ done: 0, earned: 0, points: 0 });

  const task = useMemo(
    () => (seed === null ? null : practiceTask(subject, seed, topic)),
    [subject, seed, topic],
  );

  const topics = subject === "matematika" ? MATH_TOPICS : CZECH_TOPICS;

  const start = useCallback(
    (s: Subject, t: string | null) => {
      setSubject(s);
      setTopic(t);
      setAnswers({});
      setSelfScore(0);
      setChecked(null);
      setSeed(randomSeed());
    },
    [],
  );

  const check = useCallback(() => {
    if (!task) return;
    const r = scoreSingleTask(task, answers, selfScore);
    setChecked(r);
    setTally((prev) => ({
      done: prev.done + 1,
      earned: prev.earned + r.earned,
      points: prev.points + r.points,
    }));
  }, [task, answers, selfScore]);

  const next = useCallback(() => {
    setAnswers({});
    setSelfScore(0);
    setChecked(null);
    setSeed(randomSeed());
  }, []);

  /* ------------------------------ výběr ------------------------------ */

  if (seed === null || task === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Procvičování</h1>
        <p className="mt-3 leading-relaxed text-pretty" style={{ color: "var(--muted)" }}>
          Úlohy po jedné, bez časového limitu. Po každé odpovědi hned uvidíte,
          jestli je správně, jaké je správné řešení a proč. Úlohy vznikají
          stejným generátorem jako v ostrém testu.
        </p>

        <div className="mt-8 grid gap-3">
          {(["matematika", "cestina"] as Subject[]).map((s) => (
            <div key={s}>
              <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                {EXAM.subjects[s].label}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => start(s, null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{ background: "var(--accent)", color: "var(--bg)" }}
                >
                  Všechny okruhy
                </button>
                {(s === "matematika" ? MATH_TOPICS : CZECH_TOPICS).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => start(s, t.key)}
                    className="rounded-xl border px-4 py-2 text-sm"
                    style={{ borderColor: "var(--line)", background: "var(--surface)" }}
                  >
                    {t.area}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ------------------------------ úloha ------------------------------ */

  const pct = tally.points ? Math.round((tally.earned / tally.points) * 100) : 0;
  const isSelfGraded = task.parts.some((p) => p.format === "construction");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Procvičování</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {EXAM.subjects[subject].label}
            {topic ? ` · ${topics.find((t) => t.key === topic)?.area}` : " · všechny okruhy"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tally.done > 0 && (
            <div className="rounded-xl border px-3 py-2 text-right" style={{ borderColor: "var(--line)" }}>
              <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                úspěšnost
              </div>
              <div className="font-semibold tabular-nums">
                {tally.earned}/{tally.points} <span className="font-normal">({pct} %)</span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSeed(null)}
            className="rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--line)" }}
          >
            Změnit okruh
          </button>
        </div>
      </div>

      <TaskView
        task={task}
        label="Úloha"
        answers={answers}
        setAnswer={(k, v) => setAnswers((prev) => ({ ...prev, [k]: v }))}
        selfScores={Object.fromEntries(task.parts.map((p) => [`${task.n}.${p.id}`, selfScore]))}
        setSelfScore={(_, n) => setSelfScore(n)}
        result={null}
        showAnswers={!!checked}
      />

      {checked && (
        <div
          className="mt-4 rounded-2xl border p-5"
          style={{
            borderColor: checked.earned === checked.points ? "var(--good)" : "var(--bad)",
            background: checked.earned === checked.points ? "var(--good-soft)" : "var(--bad-soft)",
          }}
        >
          <p
            className="font-semibold"
            style={{ color: checked.earned === checked.points ? "var(--good)" : "var(--bad)" }}
          >
            {checked.earned === checked.points
              ? "Správně"
              : checked.earned > 0
                ? "Částečně správně"
                : "Chybně"}{" "}
            — {checked.earned} z {checked.points}{" "}
            {checked.points === 1 ? "bodu" : checked.points < 5 ? "bodů" : "bodů"}
            {isSelfGraded && " (konstrukci si hodnotíte sami)"}
          </p>
          <div className="pre-wrap mt-3 text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
            {task.solution}
          </div>
        </div>
      )}

      <div
        className="sticky bottom-0 mt-6 -mx-4 border-t px-4 py-3 backdrop-blur"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
      >
        {!checked ? (
          <button
            type="button"
            onClick={check}
            className="w-full rounded-xl px-5 py-3 text-sm font-semibold sm:w-auto"
            style={{ background: "var(--accent)", color: "var(--bg)" }}
          >
            Zkontrolovat
          </button>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={next}
              className="rounded-xl px-5 py-3 text-sm font-semibold"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              Další úloha
            </button>
            <Link
              href="/test"
              className="rounded-xl border px-5 py-3 text-sm font-semibold"
              style={{ borderColor: "var(--line)" }}
            >
              Přejít na celý test
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
