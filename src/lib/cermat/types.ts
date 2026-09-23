import type { TaskFormat } from "./spec";

export type Choice = { key: string; text: string };

/** Jedna otázka (podúloha). Úloha jich může mít víc — např. a), b), c). */
export type Part = {
  id: string;
  /** Zadání podúlohy. Prázdné, má-li úloha jedinou část. */
  prompt: string;
  format: TaskFormat;
  /** Nabídka u uzavřených úloh. */
  choices?: Choice[];
  /** Správná odpověď — klíč volby, nebo text u otevřených úloh. */
  answer: string;
  /** Další tvary odpovědi, které se uznávají (např. "0,5" i "1/2"). */
  accept?: string[];
  /** Jednotka dopisovaná za odpověď. */
  unit?: string;
  /** Body za tuto podúlohu. */
  points: number;
};

export type GeneratedTask = {
  n: number;
  points: number;
  topic: string;
  topicLabel: string;
  format: TaskFormat;
  /** Výchozí text nebo tabulka, ke které se úloha váže. */
  stimulus?: string;
  stimulusTitle?: string;
  /** Obrázek k úloze jako inline SVG. */
  figure?: string;
  prompt: string;
  parts: Part[];
  /** Komentovaný postup řešení. */
  solution: string;
  /** Úloha se hodnotí ručně (konstrukce, postup). */
  selfGraded?: boolean;
};

export type GeneratedTest = {
  subject: "matematika" | "cestina";
  subjectLabel: string;
  seed: number;
  code: string;
  minutes: number;
  totalPoints: number;
  tasks: GeneratedTask[];
};
