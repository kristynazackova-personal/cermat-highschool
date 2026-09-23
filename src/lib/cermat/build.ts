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
      points: item.points,
      topic: item.topic,
      topicLabel: topicLabel(subject, item.topic),
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
      ? { title: "VÝCHOZÍ TEXT", text: ctx.passage.text, tasks: "úlohy 1–4" }
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
    const stepped = task.scoring === "stepped";
    let taskEarned = 0;
    let correctParts = 0;

    for (const part of task.parts) {
      const key = `${task.n}.${part.id}`;
      const given = (answers[key] ?? "").trim();
      const isSelf = part.format === "construction";
      const correct = isSelf ? false : partCorrect(part, given);
      if (correct) correctParts++;
      if (isSelf) selfGradedPoints += part.points;

      // U stupňovitě hodnocené úlohy nemají podúlohy vlastní bodovou dotaci —
      // body se přidělují až za celou skupinu.
      const earned = stepped
        ? 0
        : isSelf
          ? Math.max(0, Math.min(part.points, selfScores[key] ?? 0))
          : correct
            ? part.points
            : 0;
      if (!stepped) taskEarned += earned;

      parts.push({
        taskN: task.n,
        partId: part.id,
        given,
        correct,
        selfGraded: isSelf,
        points: stepped ? 0 : part.points,
        earned,
      });
    }

    if (stepped) taskEarned = steppedScore(correctParts, task.parts.length, task.points);

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
