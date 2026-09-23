import { Rng, seedCode } from "./rng";
import type { GeneratedTask, GeneratedTest, Part } from "./types";
import {
  EXAM,
  MATH_BLUEPRINT,
  CZECH_BLUEPRINT,
  MATH_TOPICS,
  CZECH_TOPICS,
  type Subject,
} from "./spec";
import { MATH_GENERATORS, makeMathCtx } from "./math/generators";
import { CZECH_GENERATORS, makeCzechCtx } from "./czech/generators";
import { answersMatch } from "./math/helpers";

function topicLabel(subject: Subject, key: string): string {
  const list = subject === "matematika" ? MATH_TOPICS : CZECH_TOPICS;
  return list.find((t) => t.key === key)?.area ?? key;
}

/**
 * Sestaví celý test z jediného semínka.
 *
 * Funkce je čistá: stejné semínko vždy vrátí tentýž test, takže konkrétní
 * zadání jde sdílet odkazem a znovu otevřít.
 */
export function generateTest(subject: Subject, seed: number): GeneratedTest {
  const rng = new Rng(seed);
  const cfg = EXAM.subjects[subject];
  const blueprint = subject === "matematika" ? MATH_BLUEPRINT : CZECH_BLUEPRINT;

  // Výchozí text i souvětí pro skladbu vybíráme jednou za test — úlohy 1–4
  // se pak vážou k témuž textu, stejně jako ve skutečném testu.
  const ctx = subject === "cestina" ? makeCzechCtx(rng) : null;
  const mathCtx = subject === "matematika" ? makeMathCtx(rng) : null;

  const tasks: GeneratedTask[] = blueprint.map((item) => {
    const result =
      subject === "matematika"
        ? MATH_GENERATORS[item.gen](rng, item.points, mathCtx!)
        : CZECH_GENERATORS[item.gen](rng, item.points, ctx!);

    return {
      n: item.n,
      gen: result.gen ?? item.gen,
      points: item.points,
      topic: result.topic ?? item.topic,
      topicLabel: topicLabel(subject, result.topic ?? item.topic),
      format: item.format,
      prompt: result.prompt,
      parts: result.parts,
      offer: result.offer,
      scoring: item.scoring,
      solution: result.solution,
      figure: result.figure,
      stimulus: result.stimulus,
      stimulusTitle: result.stimulusTitle,
      selfGraded: result.selfGraded,
    };
  });

  return {
    subject,
    subjectLabel: cfg.label,
    intro: ctx
      ? { title: "VÝCHOZÍ TEXT", text: ctx.passages[0].text, tasks: "úlohy 2, 8, 11 a 12" }
      : undefined,
    seed,
    code: seedCode(seed),
    minutes: cfg.minutes,
    totalPoints: tasks.reduce((s, t) => s + t.points, 0),
    tasks,
  };
}

export type PartResult = {
  taskN: number;
  partId: string;
  given: string;
  correct: boolean;
  /** Úlohu hodnotí žák sám (konstrukce, zápis postupu). */
  selfGraded: boolean;
  points: number;
  earned: number;
};

export type TaskResult = {
  n: number;
  earned: number;
  points: number;
  /** Kolik podúloh je správně (u skupinových úloh se hodí do komentáře). */
  correctParts: number;
  totalParts: number;
};

export type ScoreResult = {
  earned: number;
  total: number;
  autoTotal: number;
  selfGradedPoints: number;
  percent: number;
  parts: PartResult[];
  tasks: TaskResult[];
  byTopic: Array<{ topic: string; label: string; earned: number; total: number }>;
};

function partCorrect(part: Part, given: string): boolean {
  if (!given) return false;
  if (part.format === "choice" || part.format === "truefalse" || part.format === "match") {
    return given === part.answer;
  }
  return answersMatch(given, part.answer, part.accept);
}

/**
 * Stupňovité hodnocení dichotomické úlohy A/N.
 *
 * Klíč Cermatu (úloha 11 ve všech čtyřech formách JPZ 2026) hodnotí skupinu
 * tří tvrzení takto: všechna tři správně → plný počet bodů, dvě správně →
 * polovina, jedno nebo žádné → nula. Jedna chyba tedy stojí polovinu bodů.
 */
export function steppedScore(correct: number, total: number, points: number): number {
  if (correct === total) return points;
  if (correct === total - 1) return points / 2;
  return 0;
}

/**
 * Hodnocení úlohy „vypište N slov z výchozího textu“.
 *
 * Klíč Cermatu počítá chyby, ne správné odpovědi, a za chybu považuje
 * obojí: nenalezené hledané slovo i zapsání slova, které zadání nevyhovuje.
 * Napsat něco naslepo je proto dražší než nechat pole prázdné.
 * Na pořadí zápisu nezáleží.
 *
 * Příklad z klíče C9A: hledá se {zapsanou, pravěkých}, žák napíše
 * {poutavý, zapsanou} → 1 nenalezené + 1 nevyhovující = 2 chyby → 0 bodů.
 */
export function errorScore(
  given: string[],
  expected: string[],
  points: number,
  eq: (a: string, b: string) => boolean,
): { earned: number; errors: number } {
  const written = given.map((g) => g.trim()).filter(Boolean);
  const unmatched = [...expected];
  let invalid = 0;

  for (const w of written) {
    const i = unmatched.findIndex((e) => eq(w, e));
    if (i >= 0) unmatched.splice(i, 1);
    else invalid++;
  }
  const errors = unmatched.length + invalid;
  return { earned: Math.max(0, points - errors), errors };
}

/**
 * Vyhodnotí odpovědi. `answers` je mapa "úloha.podúloha" → odpověď,
 * `selfScores` je mapa téhož klíče → body, které si žák přiznal u ručně
 * hodnocených částí.
 */
export function scoreTest(
  test: GeneratedTest,
  answers: Record<string, string>,
  selfScores: Record<string, number> = {},
): ScoreResult {
  const parts: PartResult[] = [];
  const tasks: TaskResult[] = [];
  const topicTotals = new Map<string, { label: string; earned: number; total: number }>();
  let selfGradedPoints = 0;

  for (const task of test.tasks) {
    const mode = task.scoring ?? "per-part";
    const grouped = mode !== "per-part";
    let taskEarned = 0;
    let correctParts = 0;

    for (const part of task.parts) {
      const key = `${task.n}.${part.id}`;
      const given = (answers[key] ?? "").trim();
      const isSelf = part.format === "construction";
      const correct = isSelf ? false : partCorrect(part, given);
      if (correct) correctParts++;
      if (isSelf) selfGradedPoints += part.points;

      // U skupinově hodnocené úlohy nemají podúlohy vlastní bodovou dotaci —
      // body se přidělují až za celou skupinu.
      const earned = grouped
        ? 0
        : isSelf
          ? Math.max(0, Math.min(part.points, selfScores[key] ?? 0))
          : correct
            ? part.points
            : 0;
      if (!grouped) taskEarned += earned;

      parts.push({
        taskN: task.n,
        partId: part.id,
        given,
        correct,
        selfGraded: isSelf,
        points: grouped ? 0 : part.points,
        earned,
      });
    }

    if (mode === "stepped") {
      taskEarned = steppedScore(correctParts, task.parts.length, task.points);
    } else if (mode === "all-or-nothing") {
      // seřazení částí textu: body jen za celé správné pořadí
      taskEarned = correctParts === task.parts.length ? task.points : 0;
    } else if (mode === "errors") {
      const given = task.parts.map((p) => answers[`${task.n}.${p.id}`] ?? "");
      const expected = task.parts.map((p) => p.answer);
      taskEarned = errorScore(given, expected, task.points, (a, b) =>
        answersMatch(a, b, task.parts.find((p) => p.answer === b)?.accept),
      ).earned;
    }

    tasks.push({
      n: task.n,
      earned: taskEarned,
      points: task.points,
      correctParts,
      totalParts: task.parts.length,
    });

    const t = topicTotals.get(task.topic) ?? { label: task.topicLabel, earned: 0, total: 0 };
    t.earned += taskEarned;
    t.total += task.points;
    topicTotals.set(task.topic, t);
  }

  const earned = tasks.reduce((s, t) => s + t.earned, 0);
  const total = test.tasks.reduce((s, t) => s + t.points, 0);

  return {
    earned,
    total,
    autoTotal: total - selfGradedPoints,
    selfGradedPoints,
    percent: total ? Math.round((earned / total) * 100) : 0,
    parts,
    tasks,
    byTopic: Array.from(topicTotals.entries()).map(([topic, v]) => ({ topic, ...v })),
  };
}


/**
 * Úlohy, které se v testu vážou k výchozímu textu vypsanému nad celým
 * testem. Při procvičování jedné úlohy je text nutné připojit k ní,
 * jinak by nešla vyřešit.
 */
const INTRO_DEPENDENT = new Set(["text-obsah", "text-myslenka", "vyznam-slov", "vyplyva-a"]);

/**
 * Vygeneruje jednu úlohu k procvičení, volitelně jen z daného okruhu.
 *
 * Staví na `generateTest` — úlohy tak vznikají přesně jako v ostrém testu
 * a nemůže se stát, že by procvičování zadávalo něco jiného než zkouška.
 */
export function practiceTask(
  subject: Subject,
  seed: number,
  topic?: string | null,
): GeneratedTask {
  for (let i = 0; i < 40; i++) {
    // odvozená semínka: Knuthův multiplikativní krok, ať se okruhy střídají
    const s = (seed + i * 2654435761) >>> 0;
    const test = generateTest(subject, s);
    const pool = topic ? test.tasks.filter((t) => t.topic === topic) : test.tasks;
    if (pool.length === 0) continue;

    const task = pool[(s >>> 9) % pool.length];
    if (!task.stimulus && test.intro && INTRO_DEPENDENT.has(task.gen)) {
      return { ...task, stimulus: test.intro.text, stimulusTitle: test.intro.title };
    }
    return task;
  }
  return generateTest(subject, seed).tasks[0];
}

/** Vyhodnotí jednu úlohu při procvičování. */
export function scoreSingleTask(
  task: GeneratedTask,
  answers: Record<string, string>,
  selfScore = 0,
): { earned: number; points: number; correctParts: number; totalParts: number } {
  const fake: GeneratedTest = {
    subject: "matematika",
    subjectLabel: "",
    seed: 0,
    code: "",
    minutes: 0,
    totalPoints: task.points,
    tasks: [task],
  };
  const keyed: Record<string, number> = {};
  for (const p of task.parts) if (p.format === "construction") keyed[`${task.n}.${p.id}`] = selfScore;
  const r = scoreTest(fake, answers, keyed);
  const t = r.tasks[0];
  return { earned: t.earned, points: t.points, correctParts: t.correctParts, totalParts: t.totalParts };
}
