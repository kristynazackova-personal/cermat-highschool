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
import { MATH_GENERATORS } from "./math/generators";
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

  const tasks: GeneratedTask[] = blueprint.map((item) => {
    const result =
      subject === "matematika"
        ? MATH_GENERATORS[item.gen](rng, item.points)
        : CZECH_GENERATORS[item.gen](rng, item.points, ctx!);

    return {
      n: item.n,
      points: item.points,
      topic: item.topic,
      topicLabel: topicLabel(subject, item.topic),
      format: item.format,
      prompt: result.prompt,
      parts: result.parts,
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

export type ScoreResult = {
  earned: number;
  total: number;
  autoTotal: number;
  selfGradedPoints: number;
  percent: number;
  parts: PartResult[];
  byTopic: Array<{ topic: string; label: string; earned: number; total: number }>;
};

function partCorrect(part: Part, given: string): boolean {
  if (!given) return false;
  if (part.format === "choice" || part.format === "truefalse") {
    return given === part.answer;
  }
  return answersMatch(given, part.answer, part.accept);
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
  const topicTotals = new Map<string, { label: string; earned: number; total: number }>();

  for (const task of test.tasks) {
    for (const part of task.parts) {
      const key = `${task.n}.${part.id}`;
      const given = (answers[key] ?? "").trim();
      const isSelf = part.format === "construction";
      const correct = isSelf ? false : partCorrect(part, given);
      const earned = isSelf
        ? Math.max(0, Math.min(part.points, selfScores[key] ?? 0))
        : correct
          ? part.points
          : 0;

      parts.push({
        taskN: task.n,
        partId: part.id,
        given,
        correct,
        selfGraded: isSelf,
        points: part.points,
        earned,
      });

      const t = topicTotals.get(task.topic) ?? { label: task.topicLabel, earned: 0, total: 0 };
      t.earned += earned;
      t.total += part.points;
      topicTotals.set(task.topic, t);
    }
  }

  const earned = parts.reduce((s, p) => s + p.earned, 0);
  const total = parts.reduce((s, p) => s + p.points, 0);
  const selfGradedPoints = parts.filter((p) => p.selfGraded).reduce((s, p) => s + p.points, 0);

  return {
    earned,
    total,
    autoTotal: total - selfGradedPoints,
    selfGradedPoints,
    percent: total ? Math.round((earned / total) * 100) : 0,
    parts,
    byTopic: Array.from(topicTotals.entries()).map(([topic, v]) => ({ topic, ...v })),
  };
}
