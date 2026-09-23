import type { ScoringMode, TaskFormat } from "./spec";

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
  /** Klíč generátoru z plánu testu — kdo úlohu vyrobil. */
  gen: string;
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
  /** Společná nabídka u přiřazovací úlohy (A–F). */
  offer?: Choice[];
  /** Nelineární hodnocení skupiny — viz ScoringMode ve spec.ts. */
  scoring?: ScoringMode;
  /** Komentovaný postup řešení. */
  solution: string;
  /** Úloha se hodnotí ručně (konstrukce, postup). */
  selfGraded?: boolean;
};

export type GeneratedTest = {
  subject: "matematika" | "cestina";
  /** Výchozí text, ke kterému se váže první blok úloh (čeština). */
  intro?: { title: string; text: string; tasks: string };
  subjectLabel: string;
  seed: number;
  code: string;
  minutes: number;
  totalPoints: number;
  tasks: GeneratedTask[];
};
