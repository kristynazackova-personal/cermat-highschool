"use client";

/**
 * Vykreslení jedné úlohy i s odpověďmi. Sdílené mezi ostrým testem
 * (`/test`) a procvičováním (`/procvicovani`), aby se formáty odpovědí
 * — výběr z nabídky, A/N, přiřazování, seřazení, vypisování slov,
 * otevřená odpověď i konstrukce — psaly a opravovaly jen na jednom místě.
 */

import type { ScoreResult } from "@/lib/cermat/build";
import type { Choice, GeneratedTask, Part } from "@/lib/cermat/types";

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

export function PartView({
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

      {/* seřazení částí textu — na každou pozici jedno písmeno */}
      {part.format === "order" && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {Array.from({ length: task.parts.length }, (_, i) => String.fromCharCode(65 + i)).map((k) => {
            const picked = value === k;
            const isRight = showAnswers && k === part.answer;
            const isWrongPick = showAnswers && picked && k !== part.answer;
            return (
              <button
                key={k}
                type="button"
                disabled={locked}
                onClick={() => onChange(k)}
                aria-pressed={picked}
                aria-label={`Na ${part.id}. místo část ${k}`}
                className="h-9 w-9 rounded-lg border text-sm font-semibold tabular-nums"
                style={{
                  borderColor: isRight ? "var(--good)" : isWrongPick ? "var(--bad)" : picked ? "var(--accent)" : "var(--line)",
                  background: isRight ? "var(--good-soft)" : isWrongPick ? "var(--bad-soft)" : picked ? "var(--accent-soft)" : "var(--surface)",
                  color: "var(--ink)",
                }}
              >
                {k}
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

      {/* vypsání slova nalezeného ve výchozím textu */}
      {part.format === "wordlist" && (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={value}
            disabled={locked}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${part.id}.`}
            aria-label={`Úloha ${task.n}, ${part.id}. hledané slovo`}
            className="w-52 rounded-lg border px-3 py-2 text-[15px] outline-none focus:ring-2"
            style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--ink)" }}
          />
          {showAnswers && (
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              hledalo se mj. <strong style={{ color: "var(--good)" }}>{part.answer}</strong>
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

export function TaskView({
  task,
  label,
  answers,
  setAnswer,
  selfScores,
  setSelfScore,
  result,
  showAnswers,
}: {
  task: GeneratedTask;
  /** Nadpis místo „Úloha N“ — při procvičování je číslo z testu bezvýznamné. */
  label?: string;
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
          {label ?? `Úloha ${task.n}`}
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

      {task.scoring === "errors" && (
        <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
          Hodnotí se počet chyb, ne pořadí zápisu. Chybou je i slovo, které zadání
          nevyhovuje — tipovat naslepo se proto nevyplácí.
        </p>
      )}
      {task.scoring === "all-or-nothing" && (
        <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
          Body se udělují pouze za celé správné pořadí.
        </p>
      )}
      {task.scoring === "stepped" && (
        <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
          Vše správně → {task.points} b, jedna chyba → {task.points / 2} b, dvě a více chyb → 0 b.
        </p>
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

