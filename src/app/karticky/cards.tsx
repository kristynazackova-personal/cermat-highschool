"use client";

import { useCallback, useMemo, useState } from "react";
import { deck, deckTopics, type Card } from "@/lib/cermat/flashcards";
import { EXAM, type Subject } from "@/lib/cermat/spec";

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Cards() {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [queue, setQueue] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [total, setTotal] = useState(0);

  const start = useCallback((s: Subject, t: string | null) => {
    const d = shuffle(deck(s, t));
    setSubject(s);
    setTopic(t);
    setQueue(d);
    setFlipped(false);
    setKnown(0);
    setTotal(d.length);
  }, []);

  const current = queue[0] ?? null;

  // „Umím“ kartičku odebere, „Ještě ne“ ji vrátí dál do fronty,
  // takže se za chvíli objeví znovu.
  const answer = useCallback(
    (ok: boolean) => {
      setQueue((q) => {
        const [head, ...rest] = q;
        if (!head) return q;
        if (ok) return rest;
        const at = Math.min(rest.length, 4);
        return [...rest.slice(0, at), head, ...rest.slice(at)];
      });
      if (ok) setKnown((k) => k + 1);
      setFlipped(false);
    },
    [],
  );

  /* ------------------------------ výběr ------------------------------ */

  if (!subject) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Kartičky</h1>
        <p className="mt-3 leading-relaxed text-pretty" style={{ color: "var(--muted)" }}>
          Pravidla, pojmy a vzorce, které se u zkoušky hodí umět zpaměti. Na líci
          otázka, na rubu odpověď i s vysvětlením, proč to tak je. Co si nejste
          jistí, se za chvíli vrátí zpátky.
        </p>

        <div className="mt-8 grid gap-6">
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
                  Vše ({deck(s).length})
                </button>
                {deckTopics(s).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => start(s, t.key)}
                    className="rounded-xl border px-4 py-2 text-sm"
                    style={{ borderColor: "var(--line)", background: "var(--surface)" }}
                  >
                    {t.label} <span style={{ color: "var(--muted)" }}>({t.count})</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ------------------------------ hotovo ------------------------------ */

  if (!current) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Hotovo</h1>
        <p className="mt-3" style={{ color: "var(--muted)" }}>
          Prošli jste všech {total} {total === 1 ? "kartičku" : total < 5 ? "kartičky" : "kartiček"}.
        </p>
        <button
          type="button"
          onClick={() => setSubject(null)}
          className="mt-6 rounded-xl px-5 py-3 text-sm font-semibold"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          Vybrat další sadu
        </button>
      </div>
    );
  }

  /* ------------------------------ kartička ------------------------------ */

  const done = total - queue.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Kartičky</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
            {current.topicLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm tabular-nums" style={{ color: "var(--muted)" }}>
            umím {known} · zbývá {queue.length}
          </span>
          <button
            type="button"
            onClick={() => setSubject(null)}
            className="rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--line)" }}
          >
            Změnit sadu
          </button>
        </div>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${total ? (done / total) * 100 : 0}%`, background: "var(--accent)" }}
        />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Otočit zpět na otázku" : "Otočit a zobrazit odpověď"}
        className="w-full rounded-2xl border p-6 text-left sm:p-8"
        style={{ borderColor: "var(--line)", background: "var(--surface)", minHeight: 260 }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          {flipped ? "Odpověď" : "Otázka"}
        </p>

        {!flipped ? (
          <p className="pre-wrap mt-4 text-lg leading-relaxed">{current.front}</p>
        ) : (
          <>
            <p className="pre-wrap mt-4 text-lg font-medium leading-relaxed">{current.back}</p>
            {current.why && (
              <p
                className="pre-wrap mt-4 border-t pt-4 text-[15px] leading-relaxed"
                style={{ borderColor: "var(--line)", color: "var(--muted)" }}
              >
                {current.why}
              </p>
            )}
          </>
        )}

        <p className="mt-6 text-sm" style={{ color: "var(--accent)" }}>
          {flipped ? "Klepnutím zpět na otázku" : "Klepnutím zobrazíte odpověď"}
        </p>
      </button>

      {flipped && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => answer(false)}
            className="flex-1 rounded-xl border px-5 py-3 text-sm font-semibold"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            Ještě ne
          </button>
          <button
            type="button"
            onClick={() => answer(true)}
            className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold"
            style={{ background: "var(--accent)", color: "var(--bg)" }}
          >
            Umím
          </button>
        </div>
      )}
    </div>
  );
}
