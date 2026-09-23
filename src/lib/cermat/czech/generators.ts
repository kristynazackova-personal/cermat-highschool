import type { Rng } from "../rng";
import type { Choice, Part } from "../types";
import type { GenResult } from "../math/generators";
import { PASSAGES, type Passage } from "./texts";
import {
  PRAVOPIS_SKUPINY,
  SYNONYMA,
  ANTONYMA,
  TVORENI_SLOV,
  RCENI,
  SLOVNI_DRUHY,
  VZORY,
  ZAKLADNI_DVOJICE,
  VETNE_CLENY,
  SOUVETI,
  type PickItem,
  type OneOfItem,
} from "./lexicon";
import { LIT_DRUHY, ZANRY, RYMY, STYLY, UTVARY } from "./literature";
import {
  NEDOKONAVA,
  DOKONAVA,
  INTERPUNKCE_VETY,
  VETY_SPISOVNE,
  VETY_NESPISOVNE,
  TVAR_SLOVA,
  GRAMATICKE_DOPLNENI,
  PROSTREDKY,
  UKAZKY_PROSTREDKU,
  UKAZKY_BEZ_PROSTREDKU,
} from "./banks2";
import { TEXTY_S_CHYBAMI, TEXTY_S_NESPISOVNYMI, SERAZENI_TEXTY } from "./texty2";

/**
 * Sdílený kontext testu. Vybírá se jednou při sestavování testu:
 * tři různé výchozí texty (každá dichotomická skupina A/N se váže
 * k jinému) a tři různá souvětí pro úlohy na skladbu.
 */
export type CzechCtx = {
  passages: [Passage, Passage, Passage];
  souveti: [SouvetiItem, SouvetiItem, SouvetiItem];
};

type SouvetiItem = (typeof SOUVETI)[number];

export function makeCzechCtx(rng: Rng): CzechCtx {
  const p = rng.sample(PASSAGES, 3) as [Passage, Passage, Passage];
  const withVv = SOUVETI.filter((s) => s.vedlejsi !== null);
  const vv = rng.pick(withVv);
  const rest = rng.shuffle(SOUVETI.filter((s) => s !== vv));
  return { passages: p, souveti: [rest[0], rest[1], vv] };
}

export type CzechGen = (rng: Rng, points: number, ctx: CzechCtx) => GenResult;

const KEYS = ["A", "B", "C", "D", "E", "F"];

/* --------------------------- pomocné stavby --------------------------- */

/** Uzavřená úloha s nabídkou A–D; pořadí se vždy zamíchá. */
function pick4(rng: Rng, prompt: string, correct: string, wrong: string[], points: number, id = ""): Part {
  const mixed = rng.shuffle([{ text: correct, ok: true }, ...wrong.map((t) => ({ text: t, ok: false }))]);
  return {
    id,
    prompt,
    format: "choice",
    choices: mixed.map((o, i) => ({ key: KEYS[i], text: o.text })),
    answer: KEYS[mixed.findIndex((o) => o.ok)],
    points,
  };
}

function fromPick(rng: Rng, item: PickItem, prompt: string, points: number): Part {
  return pick4(rng, prompt, item.options[item.correct], item.options.filter((_, i) => i !== item.correct), points);
}

function oneOf(rng: Rng, item: OneOfItem, prompt: string, points: number): GenResult {
  return {
    prompt,
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
}

/** Dichotomická skupina A/N — vždy čtyři tvrzení, hodnocená stupňovitě. */
function anoNeGroup(
  claims: Array<{ text: string; truth: boolean; why: string }>,
  points: number,
): Part[] {
  return claims.map((c, i) => ({
    id: String(i + 1),
    prompt: c.text,
    format: "truefalse" as const,
    choices: [
      { key: "A", text: "A" },
      { key: "N", text: "N" },
    ],
    answer: c.truth ? "A" : "N",
    points: 0, // body se přidělují za celou skupinu
  }));
}

/** Úloha „vypište N slov“ — pořadí zápisu nerozhoduje, hodnotí se počet chyb. */
function wordlist(expected: string[], accept: string[][] = []): Part[] {
  return expected.map((w, i) => ({
    id: String(i + 1),
    prompt: "",
    format: "wordlist" as const,
    answer: w,
    accept: accept[i] ?? [],
    points: 0, // body se přidělují za celou úlohu podle počtu chyb
  }));
}

/* ================================================================== */
/* Úlohy vázané k výchozímu textu                                      */
/* ================================================================== */

export const textObsah: CzechGen = (rng, points, ctx) => {
  const p = ctx.passages[0];
  return {
    prompt: p.obsah.q,
    parts: [pick4(rng, "", p.obsah.correct, [...p.obsah.wrong], points)],
    solution: "Odpověď je ve výchozím textu uvedena přímo; ostatní možnosti text neuvádí, nebo jim odporuje.",
  };
};

export const textMyslenka: CzechGen = (rng, points, ctx) => {
  const p = ctx.passages[0];
  return {
    prompt: "Která z možností nejlépe vystihuje hlavní myšlenku výchozího textu?",
    parts: [pick4(rng, "", p.myslenka.correct, [...p.myslenka.wrong], points)],
    solution:
      "Hlavní myšlenka shrnuje, k čemu text jako celek směřuje — ne jen jednu dílčí informaci z něj.",
  };
};

export const vyznamSlov: CzechGen = (rng, points, ctx) => {
  const p = ctx.passages[0];
  return {
    prompt: `Co ve výchozím textu znamená výraz „${p.vyznam.word}“?`,
    parts: [pick4(rng, "", p.vyznam.correct, [...p.vyznam.wrong], points)],
    solution: `Význam určíme z kontextu věty, ve které je výraz „${p.vyznam.word}“ užit.`,
  };
};

/** Tři dichotomické skupiny — každá k jinému výchozímu textu. */
function vyplyva(idx: 0 | 1 | 2): CzechGen {
  return (rng, points, ctx) => {
    const p = ctx.passages[idx];
    const claims = rng.sample(p.tvrzeni, 4);
    return {
      // první text je vypsaný nad celým testem, další dva nese úloha sama
      stimulusTitle: idx === 0 ? undefined : "VÝCHOZÍ TEXT K ÚLOZE",
      stimulus: idx === 0 ? undefined : p.text,
      prompt:
        "Rozhodněte o každém z následujících tvrzení, zda jednoznačně vyplývá " +
        (idx === 0 ? "z výchozího textu" : "z výchozího textu k této úloze") +
        " (A), nebo ne (N).",
      parts: anoNeGroup(claims, points),
      solution:
        claims.map((c, i) => `${i + 1}) ${c.truth ? "A" : "N"} — ${c.why}`).join("\n") +
        `\n\nHodnocení není lineární: 4 správně → ${points} b, 3 správně → ${points / 2} b, ` +
        `2 a méně → 0 b.`,
    };
  };
}

export const vyplyvaA = vyplyva(0);
export const vyplyvaB = vyplyva(1);
export const vyplyvaC = vyplyva(2);

/* ================================================================== */
/* Pravopis                                                            */
/* ================================================================== */

export const pravopisVeta: CzechGen = (rng, points) => {
  const t = rng.pick(TEXTY_S_NESPISOVNYMI);
  void t;
  // vybereme jednu skupinu s chybou a tři bezchybné z jiných skupin
  const groups = rng.sample(PRAVOPIS_SKUPINY, 4);
  const bad = groups[0];
  const badOption = bad.options[rng.pick([1, 2, 3])];
  const good = groups.slice(1).map((g) => g.options[g.correct]);
  return {
    prompt: "Ve které z následujících možností je slovo zapsané s pravopisnou chybou?",
    parts: [pick4(rng, "", badOption, good, points)],
    solution: `Chybný zápis je v možnosti „${badOption}“. ${bad.why}`,
  };
};

export const pravopisSkupina: CzechGen = (rng, points) => {
  const g = rng.pick(PRAVOPIS_SKUPINY);
  return {
    prompt: "Ve které z následujících možností jsou všechna slova zapsána pravopisně správně?",
    parts: [fromPick(rng, g, "", points)],
    solution: g.why,
  };
};

export const interpunkceAn: CzechGen = (rng, points) => {
  const chosen = rng.sample(INTERPUNKCE_VETY, 4);
  return {
    prompt:
      "Rozhodněte o každém z následujících větných celků, zda je v něm správně " +
      "zapsána interpunkce (A), nebo ne (N).",
    parts: anoNeGroup(
      chosen.map((c) => ({ text: c.text, truth: c.ok, why: c.why })),
      points,
    ),
    solution:
      chosen.map((c, i) => `${i + 1}) ${c.ok ? "A" : "N"} — ${c.why}`).join("\n") +
      `\n\n4 správně → ${points} b, 3 správně → ${points / 2} b, 2 a méně → 0 b.`,
  };
};

export const chybyVTextu: CzechGen = (rng, points, ctx) => {
  void ctx;
  const t = rng.pick(TEXTY_S_CHYBAMI);
  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus: t.text,
    prompt:
      `Najděte ve výchozím textu ${t.spravne.length} slova, která jsou v něm zapsána ` +
      `s pravopisnou chybou, a napište je pravopisně správně.\n` +
      `(Ohebná slova zapište ve stejném tvaru, v němž jsou užita v textu. Za chybu se považuje ` +
      `jak neuvedení hledaného slova, tak zapsání slova, které zadání neodpovídá.)`,
    parts: wordlist(t.spravne),
    solution:
      t.why.map((w, i) => `${i + 1}) ${w}`).join("\n") +
      `\n\nBody = ${points} − počet chyb. Chybou je i zapsání slova, které zadání nevyhovuje, ` +
      `takže tipovat naslepo se nevyplácí.`,
  };
};

/* ================================================================== */
/* Tvarosloví                                                          */
/* ================================================================== */

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

export const vzory: CzechGen = (rng, points) => {
  const item = rng.pick(VZORY);
  return oneOf(rng, item, `Podle kterého vzoru se skloňuje podstatné jméno „${item.q}“?`, points);
};

/** Přiřazování trojic sloves podle vidu — v sešitu úloha 6. */
export const vid: CzechGen = (rng, points) => {
  const per = points / 3;
  const n = () => rng.shuffle(NEDOKONAVA);
  const d = () => rng.shuffle(DOKONAVA);
  const nn = n(), dd = d();

  // tři trojice, které odpovídají tvrzením, a dvě, které neodpovídají žádnému
  const trojice = [
    { pattern: "NNN", words: [nn[0], nn[1], nn[2]] },
    { pattern: "DDN", words: [dd[0], dd[1], nn[3]] },
    { pattern: "NND", words: [nn[4], nn[5], dd[2]] },
    { pattern: "DNN", words: [dd[3], nn[6], nn[7]] },
    { pattern: "NDN", words: [nn[8], dd[4], nn[9]] },
  ];
  const offerItems = rng.shuffle(trojice);
  const offer: Choice[] = offerItems.map((t, i) => ({ key: KEYS[i], text: t.words.join(" – ") }));
  const keyOf = (pattern: string) => offer[offerItems.findIndex((t) => t.pattern === pattern)].key;

  const statements = [
    { text: "V této trojici jsou všechna slovesa nedokonavá.", pattern: "NNN" },
    { text: "V této trojici jsou první dvě slovesa dokonavá a třetí je nedokonavé.", pattern: "DDN" },
    { text: "V této trojici jsou první dvě slovesa nedokonavá a třetí je dokonavé.", pattern: "NND" },
  ];
  const ordered = rng.shuffle(statements);

  return {
    prompt:
      "Přiřaďte k jednotlivým tvrzením odpovídající trojici sloves (A–E).\n" +
      "(Žádná možnost z nabídky nesmí být přiřazena víckrát než jednou.)",
    offer,
    parts: ordered.map((s, i) => ({
      id: String(i + 1),
      prompt: s.text,
      format: "match" as const,
      answer: keyOf(s.pattern),
      points: per,
    })),
    solution:
      "Dokonavá slovesa vyjadřují děj jako ukončený celek (nelze u nich tvořit přítomný čas), " +
      "nedokonavá vyjadřují děj probíhající.\n" +
      ordered
        .map((s, i) => `${i + 1}) ${keyOf(s.pattern)} — ${offer[offerItems.findIndex((t) => t.pattern === s.pattern)].text}`)
        .join("\n") +
      "\nZbylé dvě trojice žádnému z tvrzení neodpovídají.",
  };
};

export const tvarSlova: CzechGen = (rng, points) => {
  const [a, b] = rng.sample(TVAR_SLOVA, 2);
  const per = points / 2;
  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus: `${a.text}\n${b.text}`,
    prompt:
      "Napište náležitý spisovný tvar uvedeného slova, který patří na vynechané místo.\n" +
      "(Po doplnění musí být větný celek smysluplný a gramaticky i pravopisně správný.)",
    parts: [
      { id: "1", prompt: `slovo „${a.base}“ do první věty`, format: "open-result", answer: a.answer, accept: a.accept ?? [], points: per },
      { id: "2", prompt: `slovo „${b.base}“ do druhé věty`, format: "open-result", answer: b.answer, accept: b.accept ?? [], points: per },
    ],
    solution: `1) ${a.answer} — ${a.why}\n2) ${b.answer} — ${b.why}`,
  };
};

/** Dvanáct vět, ve třech je nespisovný tvar slovesa — v sešitu úloha 25. */
export const nespisovneTvary: CzechGen = (rng, points) => {
  const bad = rng.sample(VETY_NESPISOVNE, 3);
  const good = rng.sample(VETY_SPISOVNE, 9);
  const all = rng.shuffle([
    ...bad.map((b) => ({ text: b.text, bad: true, why: b.why })),
    ...good.map((g) => ({ text: g, bad: false, why: "" })),
  ]);
  const numbered = all.map((s, i) => ({ ...s, n: i + 1 }));
  const wanted = numbered.filter((s) => s.bad);

  const lines = numbered.map((s) => `${s.n}. ${s.text}`);
  const half = Math.ceil(lines.length / 2);
  const stimulus = lines.slice(0, half).join("\n") + "\n" + lines.slice(half).join("\n");

  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus,
    prompt:
      "Ve výchozím textu je uvedeno dvanáct vět: ve třech z nich se vyskytuje nespisovný " +
      "tvar slovesa. Najděte tyto tři věty a napište jejich čísla.\n" +
      "(Za chybu se považuje jak neuvedení hledaného čísla, tak zapsání čísla, které zadání neodpovídá.)",
    parts: wordlist(wanted.map((w) => String(w.n))),
    solution:
      wanted.map((w) => `věta ${w.n}: „${w.text}“ — ${w.why}`).join("\n") +
      `\n\nBody = ${points} − počet chyb.`,
  };
};

/* ================================================================== */
/* Skladba                                                             */
/* ================================================================== */

export const zakladniDvojice: CzechGen = (rng, points) => {
  const [a, b] = rng.sample(ZAKLADNI_DVOJICE, 2);
  const per = points / 2;
  const mk = (item: (typeof ZAKLADNI_DVOJICE)[number], id: string): Part => ({
    id,
    prompt: item.sentence,
    format: "open-result",
    answer: `${item.podmet} ${item.prisudek}`,
    accept: [
      `podmět: ${item.podmet}; přísudek: ${item.prisudek}`,
      `${item.podmet}, ${item.prisudek}`,
      `${item.podmet} – ${item.prisudek}`,
      ...item.podmetAccept.flatMap((p) =>
        [item.prisudek, ...item.prisudekAccept].map((q) => `${p} ${q}`),
      ),
      ...item.prisudekAccept.map((q) => `${item.podmet} ${q}`),
    ],
    points: per,
  });
  return {
    prompt:
      "Vypište z každé z následujících vět základní skladební dvojici.\n" +
      "(Zapište podmět a přísudek, pravopisně správně.)",
    parts: [mk(a, "1"), mk(b, "2")],
    solution:
      `1) podmět: ${a.podmet}, přísudek: ${a.prisudek} — ${a.why}\n` +
      `2) podmět: ${b.podmet}, přísudek: ${b.prisudek} — ${b.why}`,
  };
};

export const vetneCleny: CzechGen = (rng, points) => {
  const [a, b] = rng.sample(VETNE_CLENY, 2);
  const per = points / 2;
  return {
    stimulusTitle: "VÝCHOZÍ VĚTY K ÚLOZE",
    stimulus: `1) ${a.sentence}\n2) ${b.sentence}`,
    prompt:
      "Napište druh vyznačeného větného členu.\n" +
      "(Odpovědi zapište slovem, nepoužívejte zkratky. Druh příslovečného určení konkretizujte.)",
    parts: [
      { id: "1", prompt: `výraz „${a.word}“ v první větě`, format: "open-result", answer: a.correct, points: per },
      { id: "2", prompt: `výraz „${b.word}“ v druhé větě`, format: "open-result", answer: b.correct, points: per },
    ],
    solution: `1) ${a.correct} — ${a.why}\n2) ${b.correct} — ${b.why}`,
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

/* ================================================================== */
/* Slovní zásoba                                                       */
/* ================================================================== */

export const antonyma: CzechGen = (rng, points) => {
  const item = rng.pick(ANTONYMA);
  return oneOf(rng, item, `Které z uvedených slov je antonymem (opakem) ke slovu „${item.q}“?`, points);
};

export const tvoreniSlov: CzechGen = (rng, points) => oneOf(rng, rng.pick(TVORENI_SLOV), rng.pick(TVORENI_SLOV).q, points);

export const rceni: CzechGen = (rng, points) => {
  const item = rng.pick(RCENI);
  return oneOf(rng, item, `Co znamená rčení „${item.q}“?`, points);
};

/** Vypsání dvou nespisovných slov z výchozího textu — v sešitu úloha 9. */
export const vypisNespisovna: CzechGen = (rng, points) => {
  const t = rng.pick(TEXTY_S_NESPISOVNYMI);
  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus: t.text,
    prompt:
      `Vypište z výchozího textu ${t.spravne.length} slova, která jsou nespisovná.\n` +
      `(Slova zapište ve stejném tvaru, v němž jsou užita v textu. Za chybu se považuje jak ` +
      `neuvedení hledaného slova, tak zapsání slova, které zadání neodpovídá.)`,
    parts: wordlist(t.spravne),
    solution: t.why.map((w, i) => `${i + 1}) ${w}`).join("\n") + `\n\nBody = ${points} − počet chyb.`,
  };
};

/* ================================================================== */
/* Komunikační a slohová výchova                                       */
/* ================================================================== */

export const serazeni: CzechGen = (rng, points) => {
  const src = rng.pick(SERAZENI_TEXTY);
  const shuffled = rng.shuffle(src.parts.map((s, i) => ({ s, i })));
  const listed = shuffled.map((o, j) => `${KEYS[j]}) ${o.s}`).join("\n\n");
  const correct = shuffled
    .map((o, j) => ({ key: KEYS[j], i: o.i }))
    .sort((a, b) => a.i - b.i)
    .map((o) => o.key);

  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus: listed,
    prompt:
      "Seřaďte jednotlivé části textu (A–F) tak, aby byla dodržena textová návaznost.\n" +
      "(Body lze získat pouze tehdy, je-li celé pořadí správné.)",
    parts: correct.map((k, i) => ({
      id: String(i + 1),
      prompt: `${i + 1}. v pořadí`,
      format: "order" as const,
      answer: k,
      points: 0, // hodnotí se celá úloha najednou
    })),
    solution:
      `Správné pořadí: ${correct.join(" – ")}\n\n` +
      src.parts.map((s, i) => `${i + 1}. ${s}`).join("\n") +
      `\n\nVodítkem jsou odkazy mezi částmi (zájmena, spojky, opakovaná slova) a časová ` +
      `či příčinná posloupnost. Za částečně správné pořadí se body neudělují.`,
  };
};

export const gramatickeDoplneni: CzechGen = (rng, points) => {
  const item = rng.pick(GRAMATICKE_DOPLNENI);
  return {
    stimulusTitle: "VÝCHOZÍ VĚTNÝ CELEK K ÚLOZE",
    stimulus: item.sentence,
    prompt:
      "Kterou z následujících možností je nutné doplnit na vynechané místo, " +
      "aby byl větný celek gramaticky správný?",
    parts: [pick4(rng, "", item.correct, [...item.wrong], points)],
    solution: `Správně: ${item.correct} — ${item.why}`,
  };
};

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

/* ================================================================== */
/* Literární výchova                                                   */
/* ================================================================== */

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

/** Přiřazení úryvků k definicím básnických prostředků — v sešitu úloha 30. */
export const literarniProstredky: CzechGen = (rng, points) => {
  const per = points / 4;
  const defs = rng.shuffle(PROSTREDKY).slice(0, 4);

  // ke každému prostředku jeden úryvek, v němž prokazatelně je
  const chosen = defs.map((d) => {
    const cands = UKAZKY_PROSTREDKU.filter((u) => u.prostredek === d.key);
    return { def: d, ukazka: rng.pick(cands).text };
  });
  const fillers = rng.sample(UKAZKY_BEZ_PROSTREDKU, 2);
  const offerItems = rng.shuffle([
    ...chosen.map((c) => ({ text: c.ukazka, def: c.def.key })),
    ...fillers.map((t) => ({ text: t, def: null as string | null })),
  ]);
  const offer: Choice[] = offerItems.map((o, i) => ({ key: KEYS[i], text: o.text }));

  return {
    prompt:
      "Přiřaďte k jednotlivým definicím úryvek (A–F), v němž se popsaný básnický prostředek vyskytuje.\n" +
      "(Žádná možnost z nabídky nesmí být přiřazena víckrát než jednou.)",
    offer,
    parts: chosen.map((c, i) => ({
      id: String(i + 1),
      prompt: `${c.def.nazev}: ${c.def.definice}`,
      format: "match" as const,
      answer: offer[offerItems.findIndex((o) => o.def === c.def.key)].key,
      points: per,
    })),
    solution:
      chosen
        .map((c, i) => {
          const k = offer[offerItems.findIndex((o) => o.def === c.def.key)].key;
          return `${i + 1}) ${k} — ${c.def.nazev}: ${c.def.definice}`;
        })
        .join("\n") + "\nZbylé dva úryvky žádný z těchto prostředků neobsahují.",
  };
};

/** Rejstřík generátorů — klíč odpovídá poli `gen` v plánu testu. */
export const CZECH_GENERATORS: Record<string, CzechGen> = {
  "pravopis-veta": pravopisVeta,
  "text-obsah": textObsah,
  "slovni-druhy": slovniDruhy,
  rym,
  "zakladni-dvojice": zakladniDvojice,
  vid,
  "tvar-slova": tvarSlova,
  "vyplyva-a": vyplyvaA,
  "vypis-predpony": vypisNespisovna,
  "tvoreni-slov": tvoreniSlov,
  "text-myslenka": textMyslenka,
  "vyznam-slov": vyznamSlov,
  rceni,
  "interpunkce-an": interpunkceAn,
  serazeni,
  "gramaticke-doplneni": gramatickeDoplneni,
  "funkcni-styl": funkcniStyl,
  "chyby-v-textu": chybyVTextu,
  "vyplyva-b": vyplyvaB,
  "vetne-cleny": vetneCleny,
  "literarni-druh": literarniDruh,
  "druh-souveti": druhSouveti,
  zanr,
  "pravopis-skupina": pravopisSkupina,
  "nespisovne-tvary": nespisovneTvary,
  "vyplyva-c": vyplyvaC,
  antonyma,
  "slohovy-utvar": slohovyUtvar,
  vzory,
  "literarni-prostredky": literarniProstredky,
};

export { SYNONYMA };
