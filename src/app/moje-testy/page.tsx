import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/server/db";
import { history, topicBreakdown } from "@/lib/server/attempts";
import { EXAM, MATH_TOPICS, CZECH_TOPICS } from "@/lib/cermat/spec";

export const metadata: Metadata = { title: "Moje testy" };
// Stránka závisí na přihlášeném uživateli, proto se nepředgeneruje.
export const dynamic = "force-dynamic";

function topicLabel(key: string) {
  return [...MATH_TOPICS, ...CZECH_TOPICS].find((t) => t.key === key)?.area ?? key;
}

export default async function Page() {
  if (!dbConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center" style={{ color: "var(--muted)" }}>
        Ukládání výsledků zatím není na tomto nasazení zapnuté.
      </div>
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Moje testy</h1>
        <p className="mt-3" style={{ color: "var(--muted)" }}>
          Po přihlášení se sem ukládají odevzdané testy a uvidíte, jak si vedete
          v jednotlivých okruzích.
        </p>
      </div>
    );
  }

  const [rows, topics] = await Promise.all([
    history(db(), session.user.id),
    topicBreakdown(db(), session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Moje testy</h1>

      {rows.length === 0 ? (
        <p className="mt-4" style={{ color: "var(--muted)" }}>
          Zatím tu nic není. Jakmile odevzdáte první test, objeví se tady.
        </p>
      ) : (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Kde ztrácíte body
          </h2>
          <ul className="mt-3 grid gap-2">
            {topics.map((t) => {
              const pct = t.total ? Math.round((t.earned / t.total) * 100) : 0;
              return (
                <li key={t.topic} className="text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span>{topicLabel(t.topic)}</span>
                    <span className="shrink-0 tabular-nums" style={{ color: "var(--muted)" }}>
                      {t.earned} / {t.total} b
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
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

          <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Odevzdané testy
          </h2>
          <ul className="mt-3 divide-y" style={{ borderColor: "var(--line)" }}>
            {rows.map((r) => (
              <li key={r.code} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <div>
                  <Link
                    href={`/test?predmet=${r.subject}&kod=${r.code}`}
                    className="font-medium underline underline-offset-4"
                    style={{ color: "var(--accent)" }}
                  >
                    {EXAM.subjects[r.subject as "matematika" | "cestina"].label}
                  </Link>
                  <span className="ml-2 font-mono text-xs" style={{ color: "var(--muted)" }}>
                    {r.code}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 text-sm">
                  <time style={{ color: "var(--muted)" }}>
                    {new Date(r.submittedAt).toLocaleDateString("cs-CZ")}
                  </time>
                  <span className="font-semibold tabular-nums">
                    {r.earned} / {r.total} b
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
