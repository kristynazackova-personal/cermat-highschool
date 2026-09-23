import type { Queryable } from "./db";
import type { GeneratedTest } from "../cermat/types";
import type { ScoreResult } from "../cermat/build";

/**
 * Ukládání a načítání pokusů. Funkce dostávají `Queryable`, takže je jde
 * pustit proti Neonu i proti testovací databázi — SQL se tím dá ověřit.
 */

export type StoredAttempt = {
  id: string;
  subject: string;
  seed: number;
  code: string;
  deadlineAt: string;
  submittedAt: string | null;
  earned: number | null;
  total: number | null;
  answers: Record<string, string>;
  selfScores: Record<string, number>;
};

function toAttempt(r: Record<string, unknown>): StoredAttempt {
  return {
    id: String(r.id),
    subject: String(r.subject),
    seed: Number(r.seed),
    code: String(r.code),
    deadlineAt: new Date(r.deadline_at as string).toISOString(),
    submittedAt: r.submitted_at ? new Date(r.submitted_at as string).toISOString() : null,
    earned: r.earned === null || r.earned === undefined ? null : Number(r.earned),
    total: r.total === null || r.total === undefined ? null : Number(r.total),
    answers: (r.answers ?? {}) as Record<string, string>,
    selfScores: (r.self_scores ?? {}) as Record<string, number>,
  };
}

/**
 * Otevření testu. Týž kód u téhož žáka je týž pokus, takže druhé otevření
 * sdíleného odkazu naváže tam, kde se přestalo — ani nezaloží duplicitu,
 * ani nepřepíše už odeslaný pokus (ON CONFLICT nechává řádek být).
 */
export async function openAttempt(
  q: Queryable,
  userId: string,
  input: { subject: string; seed: number; code: string; minutes: number },
): Promise<StoredAttempt> {
  const { rows } = await q.query(
    `INSERT INTO attempts (user_id, subject, seed, code, deadline_at)
     VALUES ($1, $2, $3, $4, now() + ($5 || ' minutes')::interval)
     ON CONFLICT (user_id, code) DO UPDATE SET updated_at = now()
     RETURNING *`,
    [userId, input.subject, input.seed, input.code, String(input.minutes)],
  );
  return toAttempt(rows[0]);
}

/** Průběžné uložení odpovědí. Na odeslaný pokus se už nesahá. */
export async function saveAnswers(
  q: Queryable,
  userId: string,
  code: string,
  answers: Record<string, string>,
  selfScores: Record<string, number>,
): Promise<boolean> {
  const { rows } = await q.query(
    `UPDATE attempts
        SET answers = $3::jsonb, self_scores = $4::jsonb, updated_at = now()
      WHERE user_id = $1 AND code = $2 AND submitted_at IS NULL
      RETURNING id`,
    [userId, code, JSON.stringify(answers), JSON.stringify(selfScores)],
  );
  return rows.length > 0;
}

export async function loadAttempt(
  q: Queryable,
  userId: string,
  code: string,
): Promise<StoredAttempt | null> {
  const { rows } = await q.query(
    `SELECT * FROM attempts WHERE user_id = $1 AND code = $2`,
    [userId, code],
  );
  return rows.length ? toAttempt(rows[0]) : null;
}

/**
 * Odeslání. Zapíše celkový výsledek a rozpad po úlohách — ten je zrnem
 * pro přehled „které okruhy dělají potíže“.
 */
export async function submitAttempt(
  q: Queryable,
  userId: string,
  test: GeneratedTest,
  score: ScoreResult,
  answers: Record<string, string>,
  selfScores: Record<string, number>,
): Promise<void> {
  const { rows } = await q.query(
    `UPDATE attempts
        SET submitted_at = now(), earned = $3, total = $4,
            answers = $5::jsonb, self_scores = $6::jsonb, updated_at = now()
      WHERE user_id = $1 AND code = $2 AND submitted_at IS NULL
      RETURNING id`,
    [userId, test.code, score.earned, score.total, JSON.stringify(answers), JSON.stringify(selfScores)],
  );
  if (!rows.length) return; // už odesláno, druhé odeslání nic nemění
  const attemptId = String(rows[0].id);

  await q.query(`DELETE FROM attempt_tasks WHERE attempt_id = $1`, [attemptId]);
  for (const t of score.tasks) {
    const task = test.tasks.find((x) => x.n === t.n);
    if (!task) continue;
    await q.query(
      `INSERT INTO attempt_tasks
         (attempt_id, task_n, gen, topic, scoring, points, earned, correct_parts, total_parts)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        attemptId,
        t.n,
        task.gen,
        task.topic,
        task.scoring ?? "per-part",
        t.points,
        t.earned,
        t.correctParts,
        t.totalParts,
      ],
    );
  }
}

export type HistoryRow = {
  code: string;
  subject: string;
  submittedAt: string;
  earned: number;
  total: number;
};

export async function history(q: Queryable, userId: string, limit = 30): Promise<HistoryRow[]> {
  const { rows } = await q.query(
    `SELECT code, subject, submitted_at, earned, total
       FROM attempts
      WHERE user_id = $1 AND submitted_at IS NOT NULL
      ORDER BY submitted_at DESC
      LIMIT $2`,
    [userId, limit],
  );
  return rows.map((r) => ({
    code: String(r.code),
    subject: String(r.subject),
    submittedAt: new Date(r.submitted_at as string).toISOString(),
    earned: Number(r.earned),
    total: Number(r.total),
  }));
}

/**
 * Úspěšnost po okruzích — přehled pokroku.
 *
 * Počítá se z ODEVZDANÝCH TESTŮ I Z PROCVIČOVÁNÍ. Kdo procvičuje a testy
 * skoro nepíše, by jinak viděl prázdno, přestože úloh vyřešil spoustu; a
 * okruh, který dělá potíže, dělá potíže bez ohledu na to, kde se na něj
 * narazilo. Obě tabulky mají proto stejné sloupce `topic`, `earned`
 * a `points`.
 */
export async function topicBreakdown(
  q: Queryable,
  userId: string,
): Promise<Array<{ topic: string; earned: number; total: number }>> {
  const { rows } = await q.query(
    `WITH vse AS (
       SELECT t.topic, t.earned, t.points
         FROM attempt_tasks t
         JOIN attempts a ON a.id = t.attempt_id
        WHERE a.user_id = $1 AND a.submitted_at IS NOT NULL
       UNION ALL
       SELECT p.topic, p.earned, p.points
         FROM practice_answers p
        WHERE p.user_id = $1
     )
     SELECT topic, SUM(earned)::float AS earned, SUM(points)::float AS total
       FROM vse
      GROUP BY topic
      ORDER BY (SUM(earned) / NULLIF(SUM(points), 0)) ASC`,
    [userId],
  );
  return rows.map((r) => ({
    topic: String(r.topic),
    earned: Number(r.earned),
    total: Number(r.total),
  }));
}
