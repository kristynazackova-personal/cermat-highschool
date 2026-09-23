import type { Rng } from "../rng";
import type { Part } from "../types";
import type { GenResult } from "../math/generators";
import { PASSAGES, ORDERED_TEXTS, type Passage } from "./texts";
import {
  PRAVOPIS_SKUPINY,
  PRAVOPIS_CHYBA,
  SHODA,
  MNE,
  INTERPUNKCE,
  SYNONYMA,
  ANTONYMA,
  TVORENI_SLOV,
  RCENI,
  SLOVNI_DRUHY,
  KATEGORIE,
  VZORY,
  TVARY_CHYBA,
  ZAKLADNI_DVOJICE,
  VETNE_CLENY,
  SOUVETI,
  type PickItem,
  type FillItem,
  type OneOfItem,
} from "./lexicon";
import { LIT_DRUHY, ZANRY, TROPY, RYMY, LIT_POJMY, STYLY, UTVARY } from "./literature";

/**
 * Sdílený kontext testu. Vybírá se jednou při sestavování testu, aby se
 * úlohy 1–4 vázaly k témuž výchozímu textu a aby tři úlohy na skladbu
 * nepracovaly se stejným souvětím.
 */
export type CzechCtx = {
  passage: Passage;
  /** Tři různá souvětí — pro počet vět, druh souvětí a druh vedlejší věty. */
  souveti: [SouvetiItem, SouvetiItem, SouvetiItem];
};

type SouvetiItem = (typeof SOUVETI)[number];

/** Sestaví kontext: výchozí text a tři různá souvětí. */
export function makeCzechCtx(rng: Rng): CzechCtx {
  const withVv = SOUVETI.filter((s) => s.vedlejsi !== null);
  const vv = rng.pick(withVv);
  const rest = rng.shuffle(SOUVETI.filter((s) => s !== vv));
  return { passage: rng.pick(PASSAGES), souveti: [rest[0], rest[1], vv] };
}

export type CzechGen = (rng: Rng, points: number, ctx: CzechCtx) => GenResult;

const KEYS = ["A", "B", "C", "D", "E"];

/** Uzavřená úloha — nabídka se vždy zamíchá, aby správná odpověď nebyla na stejném místě. */
function pick4(
  rng: Rng,
  prompt: string,
  correct: string,
  wrong: string[],
  points: number,
  id = "",
): Part {
  const tagged = [{ text: correct, ok: true }, ...wrong.map((t) => ({ text: t, ok: false }))];
  const mixed = rng.shuffle(tagged);
  return {
    id,
    prompt,
    format: "choice",
    choices: mixed.map((o, i) => ({ key: KEYS[i], text: o.text })),
    answer: KEYS[mixed.findIndex((o) => o.ok)],
    points,
  };
}

/** Úloha typu „ve které možnosti…“ — nabídka je celá daná, míchá se pořadí. */
function fromPick(rng: Rng, item: PickItem, prompt: string, points: number): Part {
  return pick4(
    rng,
    prompt,
    item.options[item.correct],
    item.options.filter((_, i) => i !== item.correct),
    points,
  );
}

function splitPoints(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  const out = Array(count).fill(base);
  let rest = total - base * count;
  for (let i = 0; rest > 0; i++, rest--) out[i] += 1;
  return out;
}

/* ------------------------------------------------------------------ */
/* 1.–4. Porozumění výchozímu textu                                    */
/* ------------------------------------------------------------------ */

export const porozumeniObsah: CzechGen = (rng, points, { passage }) => ({
  prompt: passage.obsah.q,
  parts: [pick4(rng, "", passage.obsah.correct, [...passage.obsah.wrong], points)],
  solution: `Odpověď je uvedena ve výchozím textu přímo. Ostatní možnosti text buď neuvádí, nebo jim odporuje.`,
});

export const porozumeniTvrzeni: CzechGen = (rng, points, { passage }) => {
  const chosen = rng.sample(passage.tvrzeni, 3);
  const pts = splitPoints(points, 3);
  return {
    prompt: "Rozhodněte o každém z následujících tvrzení, zda odpovídá výchozímu textu (ANO), či nikoli (NE).",
    parts: chosen.map((t, i) => ({
      id: ["a", "b", "c"][i],
      prompt: t.text,
      format: "truefalse" as const,
      choices: [
        { key: "ANO", text: "ANO" },
        { key: "NE", text: "NE" },
      ],
      answer: t.truth ? "ANO" : "NE",
      points: pts[i],
    })),
    solution: chosen
      .map((t, i) => `${["a", "b", "c"][i]}) ${t.truth ? "ANO" : "NE"} — ${t.why}`)
      .join("\n"),
  };
};

export const porozumeniMyslenka: CzechGen = (rng, points, { passage }) => ({
  prompt: "Která z možností nejlépe vystihuje hlavní myšlenku výchozího textu?",
  parts: [pick4(rng, "", passage.myslenka.correct, [...passage.myslenka.wrong], points)],
  solution:
    "Hlavní myšlenka shrnuje, k čemu text jako celek směřuje — ne jen jednu dílčí informaci z něj. " +
    "Ostatní možnosti buď text nezmiňuje, nebo rozvádějí jen podružný detail.",
});

export const porozumeniVyznam: CzechGen = (rng, points, { passage }) => ({
  prompt: `Co ve výchozím textu znamená výraz „${passage.vyznam.word}“?`,
  parts: [pick4(rng, "", passage.vyznam.correct, [...passage.vyznam.wrong], points)],
  solution: `Význam určíme z kontextu věty, ve které je výraz „${passage.vyznam.word}“ užit.`,
});

/* ------------------------------------------------------------------ */
/* 5. Seřazení vět                                                     */
/* ------------------------------------------------------------------ */

export const serazeni: CzechGen = (rng, points) => {
  const src = rng.pick(ORDERED_TEXTS);
  const order = rng.shuffle(src.sentences.map((s, i) => ({ s, i })));
  const listed = order.map((o, j) => `(${KEYS[j]}) ${o.s}`).join("\n");
  // správné pořadí = písmena seřazená podle původního indexu
  const correct = order
    .map((o, j) => ({ key: KEYS[j], i: o.i }))
    .sort((a, b) => a.i - b.i)
    .map((o) => o.key);
  const answer = correct.join("");

  return {
    stimulusTitle: "VÝCHOZÍ TEXT",
    stimulus: listed,
    prompt:
      "Seřaďte uvedené věty tak, aby na sebe navazovaly a tvořily souvislý text.\n" +
      "Odpověď zapište jako posloupnost písmen (například ADBEC).",
    parts: [
      {
        id: "",
        prompt: "",
        format: "open-result",
        answer,
        accept: [correct.join(", "), correct.join(" "), correct.join("-")],
        points,
      },
    ],
    solution:
      `Správné pořadí: ${correct.join(" – ")}\n\n` +
      src.sentences.map((s, i) => `${i + 1}. ${s}`).join("\n") +
      `\n\nVodítkem jsou odkazy mezi větami (zájmena, spojky, opakovaná slova) a časová či příčinná posloupnost děje.`,
  };
};

/* ------------------------------------------------------------------ */
/* 6.–7. Funkční styl a slohový útvar                                  */
/* ------------------------------------------------------------------ */

export const funkcniStyl: CzechGen = (rng, points) => {
  const item = rng.pick(STYLY);
  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus: item.ukazka,
    prompt: "Ke kterému funkčnímu stylu patří výchozí text k této úloze?",
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
};

export const slohovyUtvar: CzechGen = (rng, points) => {
  const item = rng.pick(UTVARY);
  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus: item.ukazka,
    prompt: "O jaký slohový útvar jde?",
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
};

/* ------------------------------------------------------------------ */
/* 8.–12. Pravopis                                                     */
/* ------------------------------------------------------------------ */

export const pravopisDoplnovani: CzechGen = (rng, points) => {
  const item = rng.pick(PRAVOPIS_SKUPINY);
  return {
    prompt: "Ve které z možností jsou všechna slova zapsána pravopisně správně?",
    parts: [fromPick(rng, item, "", points)],
    solution: item.why,
  };
};

export const pravopisChyba: CzechGen = (rng, points) => {
  const item = rng.pick(PRAVOPIS_CHYBA);
  // zde je „správnou odpovědí“ ta věta, která chybu OBSAHUJE
  return {
    prompt: "Ve které z možností je pravopisná chyba?",
    parts: [
      pick4(
        rng,
        "",
        item.options[item.correct],
        item.options.filter((_, i) => i !== item.correct),
        points,
      ),
    ],
    solution: item.why,
  };
};

function fillPart(rng: Rng, item: FillItem, points: number): Part {
  const mixed = rng.shuffle(item.options);
  return {
    id: "",
    prompt: item.text,
    format: "choice",
    choices: mixed.map((t, i) => ({ key: KEYS[i], text: t })),
    answer: KEYS[mixed.indexOf(item.correct)],
    points,
  };
}

export const pravopisShoda: CzechGen = (rng, points) => {
  const item = rng.pick(SHODA);
  return {
    prompt: "Doplňte do vynechaného místa správnou koncovku:",
    parts: [fillPart(rng, item, points)],
    solution: item.why,
  };
};

export const pravopisMne: CzechGen = (rng, points) => {
  const item = rng.pick(MNE);
  return {
    prompt: "Doplňte do vynechaného místa správnou skupinu hlásek:",
    parts: [fillPart(rng, item, points)],
    solution: item.why,
  };
};

export const pravopisInterpunkce: CzechGen = (rng, points) => {
  const item = rng.pick(INTERPUNKCE);
  return {
    prompt: "Ve které z možností je interpunkce doplněna správně?",
    parts: [fromPick(rng, item, "", points)],
    solution: item.why,
  };
};

/* ------------------------------------------------------------------ */
/* 13.–16. Slovní zásoba                                               */
/* ------------------------------------------------------------------ */

function oneOf(rng: Rng, item: OneOfItem, prompt: string, points: number): GenResult {
  return {
    prompt,
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
}

export const synonyma: CzechGen = (rng, points) => {
  const item = rng.pick(SYNONYMA);
  return oneOf(rng, item, `Které z uvedených slov je synonymem ke slovu „${item.q}“?`, points);
};

export const antonyma: CzechGen = (rng, points) => {
  const item = rng.pick(ANTONYMA);
  return oneOf(rng, item, `Které z uvedených slov je antonymem (opakem) ke slovu „${item.q}“?`, points);
};

export const tvoreniSlov: CzechGen = (rng, points) => {
  const item = rng.pick(TVORENI_SLOV);
  return oneOf(rng, item, item.q, points);
};

export const rceni: CzechGen = (rng, points) => {
  const item = rng.pick(RCENI);
  return oneOf(rng, item, `Co znamená rčení „${item.q}“?`, points);
};

/* ------------------------------------------------------------------ */
/* 17.–20. Tvarosloví                                                  */
/* ------------------------------------------------------------------ */

export const slovniDruhy: CzechGen = (rng, points) => {
  const item = rng.pick(SLOVNI_DRUHY);
  return {
    stimulusTitle: "VÝCHOZÍ VĚTA K ÚLOZE",
    stimulus: item.sentence,
    prompt: `Jakým slovním druhem je ve výchozí větě slovo „${item.word}“?`,
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
};

export const mluvnickeKategorie: CzechGen = (rng, points) => {
  const item = rng.pick(KATEGORIE);
  return {
    stimulusTitle: "VÝCHOZÍ VĚTA K ÚLOZE",
    stimulus: item.sentence,
    prompt: `Určete mluvnické kategorie výrazu „${item.word}“ ve výchozí větě.`,
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
};

export const vzory: CzechGen = (rng, points) => {
  const item = rng.pick(VZORY);
  return oneOf(rng, item, `Podle kterého vzoru se skloňuje podstatné jméno „${item.q}“?`, points);
};

export const tvaryChyba: CzechGen = (rng, points) => {
  const item = rng.pick(TVARY_CHYBA);
  return {
    prompt: "Ve které z možností je tvar utvořen nesprávně?",
    parts: [fromPick(rng, item, "", points)],
    solution: item.why,
  };
};

/* ------------------------------------------------------------------ */
/* 21.–25. Skladba                                                     */
/* ------------------------------------------------------------------ */

export const zakladniDvojice: CzechGen = (rng, points) => {
  const item = rng.pick(ZAKLADNI_DVOJICE);
  const pts = splitPoints(points, 2);
  return {
    stimulusTitle: "VÝCHOZÍ VĚTA K ÚLOZE",
    stimulus: item.sentence,
    prompt: "Vypište ze základní skladební dvojice výchozí věty:",
    parts: [
      {
        id: "a",
        prompt: "podmět",
        format: "open-result",
        answer: item.podmet,
        accept: item.podmetAccept,
        points: pts[0],
      },
      {
        id: "b",
        prompt: "přísudek",
        format: "open-result",
        answer: item.prisudek,
        accept: item.prisudekAccept,
        points: pts[1],
      },
    ],
    solution: `Podmět: ${item.podmet}, přísudek: ${item.prisudek}. ${item.why}`,
  };
};

export const vetneCleny: CzechGen = (rng, points) => {
  const item = rng.pick(VETNE_CLENY);
  return {
    stimulusTitle: "VÝCHOZÍ VĚTA K ÚLOZE",
    stimulus: item.sentence,
    prompt: `Jakým větným členem je ve výchozí větě výraz „${item.word}“?`,
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
};

export const pocetVet: CzechGen = (rng, points, ctx) => {
  const item = ctx.souveti[0];
  return {
    stimulusTitle: "VÝCHOZÍ SOUVĚTÍ K ÚLOZE",
    stimulus: item.sentence,
    prompt: "Z kolika vět se výchozí souvětí skládá? Zapište číslicí.",
    parts: [
      {
        id: "",
        prompt: "",
        format: "open-result",
        answer: String(item.pocet),
        points,
      },
    ],
    solution: `Souvětí má ${item.pocet} věty. Počet vět určíme podle počtu přísudků. ${item.why}`,
  };
};

export const druhSouveti: CzechGen = (rng, points, ctx) => {
  const item = ctx.souveti[1];
  const correct = item.druh === "podřadné" ? "souvětí podřadné" : "souvětí souřadné";
  const wrong: [string, string, string] =
    item.druh === "podřadné"
      ? ["souvětí souřadné", "věta jednoduchá", "věta jednoduchá s několikanásobným podmětem"]
      : ["souvětí podřadné", "věta jednoduchá", "věta jednoduchá s několikanásobným přísudkem"];
  return {
    stimulusTitle: "VÝCHOZÍ SOUVĚTÍ K ÚLOZE",
    stimulus: item.sentence,
    prompt: "O jaký typ souvětí jde?",
    parts: [pick4(rng, "", correct, wrong, points)],
    solution: `Správně: ${correct} — ${item.why}`,
  };
};

export const vedlejsiVeta: CzechGen = (rng, points, ctx) => {
  const item = ctx.souveti[2];
  const all = [
    "podmětná",
    "předmětná",
    "přívlastková",
    "příslovečná časová",
    "příslovečná příčinná",
    "příslovečná místní",
  ];
  const wrong = rng.sample(all.filter((a) => a !== item.vedlejsi), 3) as [string, string, string];
  return {
    stimulusTitle: "VÝCHOZÍ SOUVĚTÍ K ÚLOZE",
    stimulus: item.sentence,
    prompt: "Jaký druh vedlejší věty je ve výchozím souvětí obsažen?",
    parts: [pick4(rng, "", item.vedlejsi!, wrong, points)],
    solution: `Správně: věta vedlejší ${item.vedlejsi} — ${item.why}`,
  };
};

/* ------------------------------------------------------------------ */
/* 26.–30. Literární výchova                                           */
/* ------------------------------------------------------------------ */

export const literarniDruh: CzechGen = (rng, points) => {
  const item = rng.pick(LIT_DRUHY);
  return {
    stimulusTitle: "UKÁZKA",
    stimulus: item.ukazka,
    prompt: "Ke kterému literárnímu druhu ukázka patří?",
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
};

export const zanr: CzechGen = (rng, points) => {
  const item = rng.pick(ZANRY);
  return {
    prompt: `Který literární žánr odpovídá této charakteristice?\n\n„${item.q}“`,
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
};

export const trop: CzechGen = (rng, points) => {
  const item = rng.pick(TROPY);
  return {
    stimulusTitle: "UKÁZKA",
    stimulus: item.ukazka,
    prompt: "Který jazykový prostředek je v ukázce užit?",
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
};

export const rym: CzechGen = (rng, points) => {
  const item = rng.pick(RYMY);
  return {
    stimulusTitle: "UKÁZKA",
    stimulus: item.ukazka,
    prompt: "Jaké je v ukázce uspořádání rýmů?",
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: rým ${item.correct} — ${item.why}`,
  };
};

export const literarniPojem: CzechGen = (rng, points) => {
  const item = rng.pick(LIT_POJMY);
  return {
    prompt: `Co označuje literární pojem „${item.q}“?`,
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
};

/** Rejstřík generátorů — klíč odpovídá poli `gen` v plánu testu. */
export const CZECH_GENERATORS: Record<string, CzechGen> = {
  "porozumeni-obsah": porozumeniObsah,
  "porozumeni-tvrzeni": porozumeniTvrzeni,
  "porozumeni-myslenka": porozumeniMyslenka,
  "porozumeni-vyznam": porozumeniVyznam,
  serazeni,
  "funkcni-styl": funkcniStyl,
  "slohovy-utvar": slohovyUtvar,
  "pravopis-doplnovani": pravopisDoplnovani,
  "pravopis-chyba": pravopisChyba,
  "pravopis-shoda": pravopisShoda,
  "pravopis-mne": pravopisMne,
  "pravopis-interpunkce": pravopisInterpunkce,
  synonyma,
  antonyma,
  "tvoreni-slov": tvoreniSlov,
  rceni,
  "slovni-druhy": slovniDruhy,
  "mluvnicke-kategorie": mluvnickeKategorie,
  vzory,
  "tvary-chyba": tvaryChyba,
  "zakladni-dvojice": zakladniDvojice,
  "vetne-cleny": vetneCleny,
  "pocet-vet": pocetVet,
  "druh-souveti": druhSouveti,
  "vedlejsi-veta": vedlejsiVeta,
  "literarni-druh": literarniDruh,
  zanr,
  trop,
  rym,
  "literarni-pojem": literarniPojem,
};

export { PASSAGES };
