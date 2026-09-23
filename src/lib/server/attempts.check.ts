/**
 * Ověření datové vrstvy proti SKUTEČNÉMU Postgresu (PGlite běží v procesu).
 * Kontroluje se tím SQL, ne jen typy — a bez sahání na produkční databázi.
 * Spouští se `npm run test:db`.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { generateTest, scoreTest } from "../cermat/build";
import { openAttempt, saveAnswers, loadAttempt, submitAttempt, history, topicBreakdown } from "./attempts";
import { recordPractice, practiceHistory, practiceSummary } from "./practice";
import { practiceTask, scoreSingleTask } from "../cermat/build";
import type { Queryable } from "./db";

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  if (ok) console.log("  ✓ " + label);
  else {
    failures++;
    console.error(`  ✗ ${label}${detail ? " — " + detail : ""}`);
  }
}

async function main() {
  const pg = new PGlite();
  const q: Queryable = {
    query: async (text, params) => {
      const r = await pg.query(text, params as unknown[]);
      return { rows: r.rows as Record<string, unknown>[] };
    },
  };

  await pg.exec(readFileSync("db/001_init.sql", "utf8"));
  console.log("Datová vrstva proti skutečnému Postgresu\n");

  const u = await pg.query<{ id: string }>(
    `INSERT INTO users (name, email) VALUES ($1,$2) RETURNING id`,
    ["Tereza", "t@example.com"],
  );
  const uid = u.rows[0].id;

  const test = generateTest("matematika", 987654);

  // otevření
  const a1 = await openAttempt(q, uid, {
    subject: test.subject, seed: test.seed, code: test.code, minutes: test.minutes,
  });
  check("otevření pokusu vrátí řádek", !!a1.id && a1.code === test.code);
  check("konec času je v budoucnosti", new Date(a1.deadlineAt).getTime() > Date.now());

  // průběžné ukládání
  const partial = { "1.": "980", "3.1": "4x" };
  check("uložení odpovědí projde", await saveAnswers(q, uid, test.code, partial, {}));

  // pokračování
  const resumed = await loadAttempt(q, uid, test.code);
  check("pokračování vrátí uložené odpovědi", JSON.stringify(resumed?.answers) === JSON.stringify(partial),
    JSON.stringify(resumed?.answers));

  // druhé otevření téhož kódu nesmí odpovědi zahodit
  const a2 = await openAttempt(q, uid, {
    subject: test.subject, seed: test.seed, code: test.code, minutes: test.minutes,
  });
  check("druhé otevření naváže na týž pokus", a2.id === a1.id);
  const afterReopen = await loadAttempt(q, uid, test.code);
  check("druhé otevření nezahodí odpovědi",
    JSON.stringify(afterReopen?.answers) === JSON.stringify(partial));

  // odeslání s plným klíčem
  const perfect: Record<string, string> = {};
  const selfScores: Record<string, number> = {};
  for (const t of test.tasks)
    for (const p of t.parts) {
      perfect[`${t.n}.${p.id}`] = p.answer;
      if (p.format === "construction") selfScores[`${t.n}.${p.id}`] = p.points;
    }
  const score = scoreTest(test, perfect, selfScores);
  check("vzorové řešení dává 50 bodů", score.earned === 50, String(score.earned));

  await submitAttempt(q, uid, test, score, perfect, selfScores);
  const done = await loadAttempt(q, uid, test.code);
  check("po odeslání je zapsán výsledek", done?.earned === 50 && done?.submittedAt !== null,
    `earned=${done?.earned}`);

  // na odeslaný pokus se už nesmí psát
  check("odeslaný pokus už nejde přepsat", !(await saveAnswers(q, uid, test.code, { "1.": "0" }, {})));
  const afterLock = await loadAttempt(q, uid, test.code);
  check("odpovědi zůstaly po pokusu o přepis nedotčené", afterLock?.answers["1."] === perfect["1."]);

  // rozpad po úlohách
  const rowsT = await pg.query<{ c: number }>(`SELECT count(*)::int AS c FROM attempt_tasks`);
  check("zapsal se rozpad po úlohách", rowsT.rows[0].c === test.tasks.length,
    `${rowsT.rows[0].c} ≠ ${test.tasks.length}`);

  // dvojí odeslání nesmí duplikovat řádky
  await submitAttempt(q, uid, test, score, perfect, selfScores);
  const rowsT2 = await pg.query<{ c: number }>(`SELECT count(*)::int AS c FROM attempt_tasks`);
  check("druhé odeslání nezdvojí rozpad", rowsT2.rows[0].c === test.tasks.length);

  // historie a přehled okruhů
  const h = await history(q, uid);
  check("historie obsahuje odeslaný pokus", h.length === 1 && h[0].earned === 50);
  const tb = await topicBreakdown(q, uid);
  check("přehled okruhů vrací data", tb.length > 0 && tb.every((x) => x.total > 0));

  // cizí uživatel nesmí na cizí pokus dosáhnout
  const u2 = await pg.query<{ id: string }>(
    `INSERT INTO users (name, email) VALUES ($1,$2) RETURNING id`, ["Jiný", "j@example.com"]);
  check("cizí uživatel nevidí cizí pokus",
    (await loadAttempt(q, u2.rows[0].id, test.code)) === null);
  check("cizí uživatel nemůže cizí pokus přepsat",
    !(await saveAnswers(q, u2.rows[0].id, test.code, { "1.": "hack" }, {})));


  /* ---------------------------- procvičování ---------------------------- */

  const cizi = u2.rows[0].id;
  const pt = practiceTask("matematika", 424242, null);
  const spatne = scoreSingleTask(pt, {}, 0);
  await recordPractice(q, uid, {
    subject: "matematika", seed: 424242, topicFilter: null, task: pt,
    earned: spatne.earned, points: spatne.points,
    correctParts: spatne.correctParts, totalParts: spatne.totalParts,
  });

  const ph = await practiceHistory(q, uid);
  check("procvičování se uloží", ph.length === 1 && ph[0].topic === pt.topic);

  // táž úloha podruhé: přepíše se, nepřibude
  const dobre = scoreSingleTask(
    pt, Object.fromEntries(pt.parts.map((x) => [`${pt.n}.${x.id}`, x.answer])),
    pt.parts.filter((x) => x.format === "construction").reduce((a, x) => a + x.points, 0),
  );
  await recordPractice(q, uid, {
    subject: "matematika", seed: 424242, topicFilter: null, task: pt,
    earned: dobre.earned, points: dobre.points,
    correctParts: dobre.correctParts, totalParts: dobre.totalParts,
  });
  const ph2 = await practiceHistory(q, uid);
  check("táž úloha podruhé řádek přepíše, nepřidá", ph2.length === 1, `${ph2.length} řádků`);
  check("počítá se poslední pokus", ph2[0].earned === dobre.earned,
    `${ph2[0].earned} ≠ ${dobre.earned}`);

  // týž seed, ale jiný zvolený okruh = jiná úloha, tedy další řádek
  await recordPractice(q, uid, {
    subject: "matematika", seed: 424242, topicFilter: pt.topic, task: pt,
    earned: 1, points: 2, correctParts: 1, totalParts: 2,
  });
  check("jiný zvolený okruh je jiná úloha", (await practiceHistory(q, uid)).length === 2);

  const ps = await practiceSummary(q, uid);
  check("souhrn sedí se součtem řádků",
    ps.count === 2 && ps.earned === dobre.earned + 1 && ps.points === dobre.points + 2,
    JSON.stringify(ps));

  // přehled okruhů musí sčítat testy I procvičování
  const tbPo = await topicBreakdown(q, uid);
  const pred = tb.find((x) => x.topic === pt.topic);
  const po = tbPo.find((x) => x.topic === pt.topic);
  check("procvičování se promítne do přehledu okruhů",
    !!po && (!pred || po.total > pred.total), `${pred?.total} → ${po?.total}`);

  // a nesmí přetéct k jinému uživateli
  check("cizí uživatel nevidí cizí procvičování", (await practiceHistory(q, cizi)).length === 0);
  check("cizí uživatel má prázdný souhrn", (await practiceSummary(q, cizi)).count === 0);
  check("cizí uživatel má prázdný přehled okruhů", (await topicBreakdown(q, cizi)).length === 0);

  console.log(failures === 0 ? "\n✓ Datová vrstva v pořádku." : `\n✗ ${failures} problémů.`);
  process.exit(failures === 0 ? 0 : 1);

}

main();
