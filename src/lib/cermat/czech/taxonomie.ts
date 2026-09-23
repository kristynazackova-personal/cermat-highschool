/**
 * Uzavřené soustavy termínů a stavba nabídky z nich.
 *
 * Proč to existuje: dosud měla každá položka v bance napevno napsané tři
 * nesprávné možnosti. Banka o dvanácti položkách pak uměla dvanáct podob
 * úlohy — a kdo si zapamatoval, že správná odpověď stála vedle „částice“
 * a „spojky“, měl vyhráno, aniž by o slově cokoli věděl.
 *
 * Termíny ale tvoří uzavřené soustavy: slovní druhů je deset, vzorů pro
 * každý rod několik. Nesprávné možnosti se proto nevypisují, ale LOSUJÍ ze
 * soustavy. Ze dvanácti položek je rázem přes tisíc různých nabídek a
 * zapamatovaná sestava možností nepomůže.
 *
 * Aby úloha nezlehčela, drží se dvě pravidla:
 *   1. v nabídce je vždy aspoň jedna možnost z těch, které se s odpovědí
 *      pletou nejčastěji (`near` — původní ručně psané trojice),
 *   2. nikdy se nelosuje termín, který by byl také obhajitelný (`never`) —
 *      jinak by úloha měla dvě správné odpovědi.
 */

import type { Rng } from "../rng";

/** Slovní druhy — plná desítka. */
export const SLOVNI_DRUHY_VSE = [
  "podstatné jméno",
  "přídavné jméno",
  "zájmeno",
  "číslovka",
  "sloveso",
  "příslovce",
  "předložka",
  "spojka",
  "částice",
  "citoslovce",
] as const;

/**
 * Větné členy. Příslovečná určení jsou vypsaná i s druhem: kdyby v nabídce
 * stálo vedle „příslovečného určení místa“ ještě holé „příslovečné určení“,
 * byly by správné obě.
 */
export const VETNE_CLENY_VSE = [
  "podmět",
  "přísudek",
  "předmět",
  "přívlastek",
  "doplněk",
  "příslovečné určení místa",
  "příslovečné určení času",
  "příslovečné určení způsobu",
  "příslovečné určení příčiny",
  "příslovečné určení míry",
] as const;

/**
 * Vzory po rodech. Losuje se jen uvnitř rodu — vzor „žena“ u mužského
 * podstatného jména by možnost vyřadil na první pohled a nabídka by se
 * zúžila na tři.
 */
export const VZORY_PODLE_RODU: Record<string, readonly string[]> = {
  muzsky: ["pán", "hrad", "muž", "stroj", "předseda", "soudce"],
  zensky: ["žena", "růže", "píseň", "kost"],
  stredni: ["město", "moře", "kuře", "stavení"],
};

/** Ke vzoru rod, pod kterým se o něm losuje. */
export function rodVzoru(vzor: string): string {
  for (const [rod, seznam] of Object.entries(VZORY_PODLE_RODU)) {
    if (seznam.includes(vzor)) return rod;
  }
  throw new Error(`neznámý vzor: ${vzor}`);
}

/**
 * Nesprávné možnosti k jedné správné.
 *
 * `near` jsou termíny, které se s odpovědí pletou nejčastěji; aspoň jeden
 * z nich se do nabídky dostane vždy, zbytek se dolosuje ze soustavy.
 * `never` jsou termíny, které by u téhle položky byly také obhajitelné.
 */
export function distractors(
  rng: Rng,
  pool: readonly string[],
  correct: string,
  n: number,
  opts: { near?: readonly string[]; never?: readonly string[] } = {},
): string[] {
  const zakazano = new Set<string>([correct, ...(opts.never ?? [])]);
  const near = (opts.near ?? []).filter((t) => !zakazano.has(t));
  const zbytek = pool.filter((t) => !zakazano.has(t) && !near.includes(t));

  // aspoň jedna matoucí možnost, pokud nějaká je; zbytek ze soustavy
  const kolikNear = near.length === 0 ? 0 : 1 + (rng.chance(0.4) ? 1 : 0);
  const vybrane = [
    ...rng.sample(near, Math.min(kolikNear, n)),
    ...rng.sample(zbytek, n),
  ].slice(0, n);

  // soustava je menší, než nabídka potřebuje — doplní se ze zbylých matoucích
  if (vybrane.length < n) {
    for (const t of near) {
      if (vybrane.length >= n) break;
      if (!vybrane.includes(t)) vybrane.push(t);
    }
  }
  if (vybrane.length < n) {
    throw new Error(`málo možností pro „${correct}“: ${vybrane.length} z ${n}`);
  }
  return vybrane;
}

/** Funkční styly. */
export const FUNKCNI_STYLY_VSE = [
  "prostěsdělovací",
  "odborný",
  "publicistický",
  "administrativní",
  "umělecký",
  "řečnický",
] as const;

/** Slohové útvary. */
export const SLOHOVE_UTVARY_VSE = [
  "životopis",
  "inzerát",
  "vypravování",
  "popis",
  "charakteristika",
  "úvaha",
  "výklad",
  "zpráva",
  "oznámení",
  "žádost",
  "pozvánka",
  "referát",
  "recenze",
  "líčení",
] as const;

/**
 * Literární žánry. Chybí tu záměrně „báje“ — je to druhé jméno pro mýtus a
 * v jedné nabídce by vedle sebe stály dvě správné odpovědi.
 */
export const ZANRY_VSE = [
  "bajka",
  "pohádka",
  "pověst",
  "povídka",
  "román",
  "novela",
  "balada",
  "romance",
  "óda",
  "elegie",
  "komedie",
  "tragédie",
  "fraška",
  "legenda",
  "mýtus",
  "epos",
  "kronika",
  "črta",
] as const;

/**
 * Dvojice, které se u téhle charakteristiky nesmí potkat v jedné nabídce:
 * druhý termín by na zadání seděl také. Vede se to podle správné odpovědi,
 * protože v každé bance je každý termín správnou odpovědí právě jednou.
 */
export const NEVER_TOGETHER: Record<string, readonly string[]> = {
  // „krátké oznámení chystané akce s místem a časem“ je zároveň pozvánka
  oznámení: ["pozvánka"],
  // novela se od povídky liší mírou sevřenosti — na základní škole neurčitě
  novela: ["povídka"],
  // i legenda se váže ke skutečné postavě a bývá pokládána za pravdivou;
  // odliší je až světec, o kterém charakteristika pověsti nemluví
  pověst: ["legenda"],
};

/** Zakázané termíny ke správné odpovědi, prázdné pole, když žádné nejsou. */
export function neverFor(correct: string): readonly string[] {
  return NEVER_TOGETHER[correct] ?? [];
}
