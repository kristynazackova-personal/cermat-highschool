import type { Queryable } from "./db";
import type { GeneratedTask } from "../cermat/types";

/**
 * Ukládání a načítání procvičování.
 *
 * Procvičování není zkrácený test: úlohy chodí po jedné, bez časového limitu
 * a bez celkového výsledku. Ukládá se proto po jednotlivých úlohách — zato
 * stejnými sloupci jako u testů, aby šel přehled „kde ztrácím body“ sečíst
 * z obou zdrojů najednou.
 */

export type PracticeRow = {
  subject: string;
  seed: number;
  topicFilter: string | null;
  topic: string;
  gen: string;
  points: number;
  earned: number;
  correctParts: number;
  totalParts: number;
  answeredAt: string;
};

function toRow(r: Record<string, unknown>): PracticeRow {
  return {
    subject: String(r.subject),
    seed: Number(r.seed),
    topicFilter: r.topic_filter === null || r.topic_filter === undefined ? null : String(r.topic_filter),
    topic: String(r.topic),
    gen: String(r.gen),
    points: Number(r.points),
    earned: Number(r.earned),
    correctParts: Number(r.correct_parts),
    totalParts: Number(r.total_parts),
    answeredAt: new Date(r.answered_at as string).toISOString(),
  };
}

/**
 * Zapíše zkontrolovanou úlohu. Táž úloha u téhož žáka přepíše sama sebe —
 * dvojí odeslání nenafoukne statistiku a opakované projití téže úlohy se
 * počítá podle posledního pokusu.
 */
export async function recordPractice(
  q: Queryable,
  userId: string,
  input: {
    subject: string;
    seed: number;
    topicFilter: string | null;
    task: GeneratedTask;
    earned: number;
    points: number;
    correctParts: number;
    totalParts: number;
  },
): Promise<void> {
  await q.query(
    `INSERT INTO practice_answers
       (user_id, subject, seed, topic_filter, task_n, gen, topic, scoring,
        points, earned, correct_parts, total_parts)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (user_id, subject, seed, COALESCE(topic_filter, ''))
     DO UPDATE SET earned = EXCLUDED.earned,
                   correct_parts = EXCLUDED.correct_parts,
                   total_parts = EXCLUDED.total_parts,
                   answered_at = now()`,
    [
      userId,
      input.subject,
      input.seed,
      input.topicFilter,
      input.task.n,
      input.task.gen,
      input.task.topic,
      input.task.scoring ?? "per-part",
      input.points,
      input.earned,
      input.correctParts,
      input.totalParts,
    ],
  );
}

export async function practiceHistory(
  q: Queryable,
  userId: string,
  limit = 50,
): Promise<PracticeRow[]> {
  const { rows } = await q.query(
    `SELECT * FROM practice_answers
      WHERE user_id = $1
      ORDER BY answered_at DESC
      LIMIT $2`,
    [userId, limit],
  );
  return rows.map(toRow);
}

/** Kolik úloh a s jakou úspěšností — hlavička sekce. */
export async function practiceSummary(
  q: Queryable,
  userId: string,
): Promise<{ count: number; earned: number; points: number }> {
  const { rows } = await q.query(
    `SELECT count(*)::int AS n,
            COALESCE(SUM(earned), 0)::float AS earned,
            COALESCE(SUM(points), 0)::float AS points
       FROM practice_answers WHERE user_id = $1`,
    [userId],
  );
  const r = rows[0] ?? {};
  return { count: Number(r.n ?? 0), earned: Number(r.earned ?? 0), points: Number(r.points ?? 0) };
}
