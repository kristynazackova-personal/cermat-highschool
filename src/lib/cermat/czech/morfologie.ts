/**
 * Morfologicky otagovaná slovní zásoba.
 *
 * Tohle je odpověď na otázku, jak v češtině něco SKUTEČNĚ generovat.
 * Šablona, která by tvary odvozovala, dřív nebo později vyrobí slovo,
 * které neexistuje. Proto se tvary neodvozují — jsou uložené. Generátor
 * pak nesestavuje slova, ale ZADÁNÍ: vybere slovo a popíše ho vlastnostmi,
 * které ho v téhle zásobě jednoznačně určují.
 *
 * Počet slabik je u každého slova vypsaný ručně, ne počítaný. Automatický
 * počet by musel řešit slabikotvorné r a l (vlk, smrt, prst) a mýlil by se.
 */

export type LexWord = {
  /** Tvar v 1. pádě čísla jednotného. */
  w: string;
  pos: "podstatné jméno" | "přídavné jméno";
  /** Počet slabik v 1. pádě j. č. — ručně ověřený. */
  syll: number;
  /** Slovo, se kterým je příbuzné (zadání ho uvádí VELKÝMI PÍSMENY). */
  root: string;
  /** Vzor, podle kterého se skloňuje. */
  vzor: string;
  /** Obsahuje předponu? */
  prefix: boolean;
};

export const LEXICON: LexWord[] = [
  /* --- podstatná jména, vzor hrad --- */
  { w: "plot", pos: "podstatné jméno", syll: 1, root: "PLOT", vzor: "hrad", prefix: false },
  { w: "východ", pos: "podstatné jméno", syll: 2, root: "CHODIT", vzor: "hrad", prefix: true },
  { w: "příchod", pos: "podstatné jméno", syll: 2, root: "CHODIT", vzor: "hrad", prefix: true },
  { w: "odchod", pos: "podstatné jméno", syll: 2, root: "CHODIT", vzor: "hrad", prefix: true },
  { w: "průchod", pos: "podstatné jméno", syll: 2, root: "CHODIT", vzor: "hrad", prefix: true },
  { w: "náklad", pos: "podstatné jméno", syll: 2, root: "KLÁST", vzor: "hrad", prefix: true },
  { w: "překlad", pos: "podstatné jméno", syll: 2, root: "KLÁST", vzor: "hrad", prefix: true },
  { w: "příklad", pos: "podstatné jméno", syll: 2, root: "KLÁST", vzor: "hrad", prefix: true },
  { w: "výklad", pos: "podstatné jméno", syll: 2, root: "KLÁST", vzor: "hrad", prefix: true },
  { w: "nález", pos: "podstatné jméno", syll: 2, root: "LÉZT", vzor: "hrad", prefix: true },
  { w: "výlet", pos: "podstatné jméno", syll: 2, root: "LETĚT", vzor: "hrad", prefix: true },
  { w: "přílet", pos: "podstatné jméno", syll: 2, root: "LETĚT", vzor: "hrad", prefix: true },
  { w: "odlet", pos: "podstatné jméno", syll: 2, root: "LETĚT", vzor: "hrad", prefix: true },
  { w: "zápis", pos: "podstatné jméno", syll: 2, root: "PSÁT", vzor: "hrad", prefix: true },
  { w: "podpis", pos: "podstatné jméno", syll: 2, root: "PSÁT", vzor: "hrad", prefix: true },
  { w: "opis", pos: "podstatné jméno", syll: 2, root: "PSÁT", vzor: "hrad", prefix: true },

  /* --- podstatná jména, vzor stavení --- */
  { w: "stavení", pos: "podstatné jméno", syll: 3, root: "STAVĚT", vzor: "stavení", prefix: false },
  { w: "oplocení", pos: "podstatné jméno", syll: 4, root: "PLOT", vzor: "stavení", prefix: true },
  { w: "osvětlení", pos: "podstatné jméno", syll: 4, root: "SVĚTLO", vzor: "stavení", prefix: true },
  { w: "vysvětlení", pos: "podstatné jméno", syll: 4, root: "SVĚTLO", vzor: "stavení", prefix: true },
  { w: "pochybení", pos: "podstatné jméno", syll: 4, root: "CHYBA", vzor: "stavení", prefix: true },
  { w: "upozornění", pos: "podstatné jméno", syll: 5, root: "POZOR", vzor: "stavení", prefix: true },
  { w: "přistání", pos: "podstatné jméno", syll: 3, root: "STÁT", vzor: "stavení", prefix: true },
  { w: "podepsání", pos: "podstatné jméno", syll: 4, root: "PSÁT", vzor: "stavení", prefix: true },
  { w: "přeložení", pos: "podstatné jméno", syll: 4, root: "LOŽIT", vzor: "stavení", prefix: true },
  { w: "zdravotnictví", pos: "podstatné jméno", syll: 5, root: "ZDRAVÍ", vzor: "stavení", prefix: false },

  /* --- podstatná jména, vzor žena --- */
  { w: "ohrada", pos: "podstatné jméno", syll: 3, root: "HRADIT", vzor: "žena", prefix: true },
  { w: "zahrada", pos: "podstatné jméno", syll: 3, root: "HRADIT", vzor: "žena", prefix: true },
  { w: "oprava", pos: "podstatné jméno", syll: 3, root: "PRAVIT", vzor: "žena", prefix: true },
  { w: "úprava", pos: "podstatné jméno", syll: 3, root: "PRAVIT", vzor: "žena", prefix: true },
  { w: "výprava", pos: "podstatné jméno", syll: 3, root: "PRAVIT", vzor: "žena", prefix: true },
  { w: "ozdoba", pos: "podstatné jméno", syll: 3, root: "ZDOBIT", vzor: "žena", prefix: true },
  { w: "předloha", pos: "podstatné jméno", syll: 3, root: "LOŽIT", vzor: "žena", prefix: true },
  { w: "výhoda", pos: "podstatné jméno", syll: 3, root: "HODIT", vzor: "žena", prefix: true },
  { w: "chyba", pos: "podstatné jméno", syll: 2, root: "CHYBA", vzor: "žena", prefix: false },
  { w: "zima", pos: "podstatné jméno", syll: 2, root: "ZIMA", vzor: "žena", prefix: false },

  /* --- přídavná jména, vzor mladý --- */
  { w: "bludný", pos: "přídavné jméno", syll: 2, root: "BLOUDIT", vzor: "mladý", prefix: false },
  { w: "hořlavý", pos: "přídavné jméno", syll: 3, root: "HOŘET", vzor: "mladý", prefix: false },
  { w: "světlý", pos: "přídavné jméno", syll: 2, root: "SVĚTLO", vzor: "mladý", prefix: false },
  { w: "chybný", pos: "přídavné jméno", syll: 2, root: "CHYBA", vzor: "mladý", prefix: false },
  { w: "zdravý", pos: "přídavné jméno", syll: 2, root: "ZDRAVÍ", vzor: "mladý", prefix: false },
  { w: "pochybný", pos: "přídavné jméno", syll: 3, root: "CHYBA", vzor: "mladý", prefix: true },
  { w: "výhodný", pos: "přídavné jméno", syll: 3, root: "HODIT", vzor: "mladý", prefix: true },
  { w: "osvětlený", pos: "přídavné jméno", syll: 4, root: "SVĚTLO", vzor: "mladý", prefix: true },
  { w: "nakladatelský", pos: "přídavné jméno", syll: 5, root: "KLÁST", vzor: "mladý", prefix: true },
  { w: "písemný", pos: "přídavné jméno", syll: 3, root: "PSÁT", vzor: "mladý", prefix: false },

  /* --- přídavná jména, vzor jarní --- */
  { w: "letní", pos: "přídavné jméno", syll: 2, root: "LÉTO", vzor: "jarní", prefix: false },
  { w: "zimní", pos: "přídavné jméno", syll: 2, root: "ZIMA", vzor: "jarní", prefix: false },
  { w: "stavební", pos: "přídavné jméno", syll: 3, root: "STAVĚT", vzor: "jarní", prefix: false },
  { w: "zdravotní", pos: "přídavné jméno", syll: 3, root: "ZDRAVÍ", vzor: "jarní", prefix: false },
  { w: "východní", pos: "přídavné jméno", syll: 3, root: "CHODIT", vzor: "jarní", prefix: true },
  { w: "průchozí", pos: "přídavné jméno", syll: 3, root: "CHODIT", vzor: "jarní", prefix: true },
  { w: "písemní", pos: "přídavné jméno", syll: 3, root: "PSÁT", vzor: "jarní", prefix: false },
];

/** Slova, která vyhovují zadaným omezením. */
export function matching(c: {
  pos: LexWord["pos"];
  syll: number;
  root: string;
  vzor: string;
  prefix: boolean;
}): LexWord[] {
  return LEXICON.filter(
    (w) =>
      w.pos === c.pos &&
      w.syll === c.syll &&
      w.root === c.root &&
      w.vzor === c.vzor &&
      w.prefix === c.prefix,
  );
}

/** Slovní vyjádření počtu slabik, jak ho používá zadání zkoušky. */
export function syllableWord(n: number): string {
  return (
    { 1: "jednoslabičné", 2: "dvouslabičné", 3: "tříslabičné", 4: "čtyřslabičné", 5: "pětislabičné" }[
      n
    ] ?? `${n}slabičné`
  );
}
