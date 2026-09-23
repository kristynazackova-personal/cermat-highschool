/**
 * Kartičky k zapamatování.
 *
 * Většina se ODVOZUJE z týchž bank, ze kterých generátor staví úlohy —
 * když se opraví vysvětlení v bance, opraví se i na kartičce. Ručně psané
 * jsou jen souhrnná pravidla, která se v bankách jako jednotlivá položka
 * nevyskytují (tabulka shody, vzorce, pravidla hodnocení).
 */
import type { Subject } from "./spec";
import { MATH_FORMULAS } from "./spec";
import {
  RCENI,
  SYNONYMA,
  ANTONYMA,
  VZORY,
  MNE,
  SHODA,
  TVORENI_SLOV,
} from "./czech/lexicon";
import { ZANRY, TROPY, LIT_POJMY, STYLY, UTVARY } from "./czech/literature";

export type Card = {
  id: string;
  subject: Subject;
  /** Okruh specifikace, kvůli filtrování. */
  topic: string;
  topicLabel: string;
  front: string;
  back: string;
  /** Proč to tak je — to podstatné na učení. */
  why?: string;
};

const cz = (
  id: string,
  topic: string,
  topicLabel: string,
  front: string,
  back: string,
  why?: string,
): Card => ({ id, subject: "cestina", topic, topicLabel, front, back, why });

const ma = (
  id: string,
  topic: string,
  topicLabel: string,
  front: string,
  back: string,
  why?: string,
): Card => ({ id, subject: "matematika", topic, topicLabel, front, back, why });

/* ------------------------------------------------------------------ */
/* Odvozené z bank generátoru                                          */
/* ------------------------------------------------------------------ */

const derived: Card[] = [
  ...RCENI.map((r, i) =>
    cz(`rceni-${i}`, "slovni-zasoba", "Slovní zásoba", `Co znamená „${r.q}“?`, r.correct, r.why),
  ),
  ...SYNONYMA.map((r, i) =>
    cz(`syn-${i}`, "slovni-zasoba", "Slovní zásoba", `Synonymum ke slovu „${r.q}“`, r.correct, r.why),
  ),
  ...ANTONYMA.map((r, i) =>
    cz(`ant-${i}`, "slovni-zasoba", "Slovní zásoba", `Opak (antonymum) slova „${r.q}“`, r.correct, r.why),
  ),
  ...TVORENI_SLOV.map((r, i) =>
    cz(`tvor-${i}`, "slovni-zasoba", "Slovní zásoba", r.q, r.correct, r.why),
  ),
  ...VZORY.map((r, i) =>
    cz(`vzor-${i}`, "tvaroslovi", "Tvarosloví", `Podle jakého vzoru se skloňuje „${r.q}“?`, r.correct, r.why),
  ),
  ...MNE.map((r, i) =>
    cz(`mne-${i}`, "pravopis", "Pravopis", r.text, r.correct, r.why),
  ),
  ...SHODA.map((r, i) =>
    cz(`shoda-${i}`, "pravopis", "Pravopis", r.text, `-${r.correct}`, r.why),
  ),
  ...ZANRY.map((r, i) =>
    cz(`zanr-${i}`, "literatura", "Literární výchova", r.q, r.correct, r.why),
  ),
  ...LIT_POJMY.map((r, i) =>
    cz(`pojem-${i}`, "literatura", "Literární výchova", `Co označuje pojem „${r.q}“?`, r.correct, r.why),
  ),
  ...TROPY.map((r, i) =>
    cz(`trop-${i}`, "literatura", "Literární výchova", `Který prostředek je užit?\n\n„${r.ukazka}“`, r.correct, r.why),
  ),
  ...STYLY.map((r, i) =>
    cz(`styl-${i}`, "sloh", "Sloh", `Ke kterému funkčnímu stylu patří?\n\n„${r.ukazka}“`, r.correct, r.why),
  ),
  ...UTVARY.map((r, i) =>
    cz(`utvar-${i}`, "sloh", "Sloh", `O jaký slohový útvar jde?\n\n„${r.ukazka}“`, r.correct, r.why),
  ),
];

/* ------------------------------------------------------------------ */
/* Ručně psaná souhrnná pravidla                                       */
/* ------------------------------------------------------------------ */

const rules: Card[] = [
  cz(
    "rule-shoda",
    "pravopis",
    "Pravopis",
    "Shoda přísudku s podmětem — jaká koncovka kdy?",
    "rod mužský životný → -i\nrod mužský neživotný → -y\nrod ženský → -y\nrod střední → -a",
    "U několikanásobného podmětu rozhoduje nejsilnější rod: je-li mezi členy rod mužský životný, píše se -i (Chlapci a děvčata soutěžili).",
  ),
  cz(
    "rule-mne",
    "pravopis",
    "Pravopis",
    "Kdy se píše -mě- a kdy -mně-?",
    "-mně- tam, kde je v příbuzném slově n (jemný → jemně, rozumný → rozumně)\n-mě- v kořeni slova (měkký, město, rozumět, umět)",
    "U sloves od „mínit“ se píše -mně-: zapomněl, vzpomněl, připomněl. U zájmena: 2. a 4. pád mě, 3. a 6. pád mně.",
  ),
  cz(
    "rule-bje",
    "pravopis",
    "Pravopis",
    "Kdy se píše bje/vje a kdy bě/vě?",
    "-bje-/-vje- jen tam, kde je předpona ob-/v- a kořen začíná na je- (objevil, vjezd)\njinak -bě-/-vě- (oběd, věta, běžet)",
    "Pomůcka: dá se slovo rozdělit na ob- + jev? Pak bje.",
  ),
  cz(
    "rule-vyjmenovana",
    "pravopis",
    "Pravopis",
    "Po kterých souhláskách se řeší i/y?",
    "Po obojetných: b, f, l, m, p, s, v, z",
    "Po tvrdých (h, ch, k, r, d, t, n) se píše y; po měkkých (ž, š, č, ř, c, j, ď, ť, ň) se píše i.",
  ),
  cz(
    "rule-souveti",
    "skladba",
    "Skladba",
    "Jak poznám souvětí souřadné a podřadné?",
    "souřadné — všechny věty jsou hlavní\npodřadné — je tam alespoň jedna věta vedlejší",
    "Počet vět v souvětí se pozná podle počtu přísudků, ne podle počtu čárek.",
  ),
  cz(
    "rule-rym",
    "literatura",
    "Literární výchova",
    "Druhy rýmu podle uspořádání",
    "sdružený AABB\nstřídavý ABAB\nobkročný ABBA\npřerývaný ABCB",
    "Písmena označují, které verše se spolu rýmují — porovnávají se konce veršů.",
  ),
  cz(
    "rule-hodnoceni-an",
    "porozumeni",
    "Porozumění textu",
    "Jak se u zkoušky hodnotí skupina tvrzení A/N?",
    "všechna správně → plný počet\njedna chyba → polovina\ndvě a více chyb → 0 bodů",
    "Jedna chyba stojí polovinu bodů — vyplatí se raději o tvrzení chvíli přemýšlet než hádat.",
  ),
  cz(
    "rule-hodnoceni-vypis",
    "pravopis",
    "Pravopis",
    "Jak se hodnotí úloha „vypište N slov“?",
    "body = N − počet chyb\nchybou je NEnalezené slovo i slovo, které zadání nevyhovuje",
    "Napsat něco naslepo je dražší než nechat pole prázdné: špatný zápis se počítá jako chyba navíc k té nenalezené.",
  ),
  cz(
    "rule-hodnoceni-serazeni",
    "sloh",
    "Sloh",
    "Jak se hodnotí seřazení částí textu?",
    "Vše nebo nic — body jen za celé správné pořadí.",
    "Za pět správně seřazených částí ze šesti je nula, takže se vyplatí pořadí na konci překontrolovat.",
  ),

  ma(
    "rule-vzorce",
    "cislo-a-promenna",
    "Číslo a proměnná",
    "Vzorce pro rozklad na součin",
    MATH_FORMULAS.products.join("\n"),
    "Tyhle tři vzorce máte u zkoušky na poslední straně sešitu — ale poznat, kdy je použít, musíte sami.",
  ),
  ma(
    "rule-trojuhelnik",
    "geometrie",
    "Geometrie",
    "Trojúhelníková nerovnost",
    "|b − a| < c < a + b",
    "Krajní hodnoty neplatí — při rovnosti by se trojúhelník zploštil do úsečky. U celočíselné strany je proto nejmenší možná b − a + 1.",
  ),
  ma(
    "rule-thales",
    "geometrie",
    "Geometrie",
    "Thaletova věta",
    "Leží-li střed kružnice opsané na straně trojúhelníku, je úhel proti této straně pravý.",
    "Jinak řečeno: každý obvodový úhel nad průměrem kružnice je pravý. Poznávací znamení v zadání: „střed kružnice opsané leží na straně AB“.",
  ),
  ma(
    "rule-telesa",
    "geometrie",
    "Geometrie",
    "Objem a povrch kvádru a krychle",
    "kvádr: V = a·b·c, S = 2(ab + bc + ac)\nkrychle: V = a³, S = 6a²",
    "U hranolu obecně: V = S(podstavy) · výška, plášť = obvod podstavy · výška.",
  ),
  ma(
    "rule-procenta",
    "cislo-a-promenna",
    "Číslo a proměnná",
    "Procenta — tři základní úlohy",
    "část = celek : 100 · p\np = část : (celek : 100)\ncelek = část : p · 100",
    "Zvýšení o p % = násobení (100 + p)/100. Pozor: snížení o 20 % a pak zvýšení o 20 % nevrátí původní hodnotu.",
  ),
  ma(
    "rule-uhly",
    "geometrie",
    "Geometrie",
    "Součet vnitřních úhlů",
    "trojúhelník 180°\nčtyřúhelník 360°",
    "Vnější úhel trojúhelníku se rovná součtu dvou vnitřních úhlů při zbylých vrcholech.",
  ),
  ma(
    "rule-poradi",
    "cislo-a-promenna",
    "Číslo a proměnná",
    "Pořadí početních operací",
    "1. závorky\n2. mocniny a odmocniny\n3. násobení a dělení\n4. sčítání a odčítání",
    "Operace stejné priority se provádějí zleva doprava — proto 12 : 3 · 2 = 8, ne 2.",
  ),
  ma(
    "rule-zlomky",
    "cislo-a-promenna",
    "Číslo a proměnná",
    "Dělení zlomkem",
    "Dělit zlomkem = násobit jeho převrácenou hodnotou.",
    "a/b : c/d = a/b · d/c. Výsledek se vždy zkrátí na základní tvar — u zkoušky se to výslovně vyžaduje.",
  ),
  ma(
    "rule-jednotky-obsah",
    "zavislosti-a-data",
    "Závislosti a data",
    "Převody jednotek obsahu a objemu",
    "obsah: sousední jednotky dělí 100 (1 m² = 10 000 cm²)\nobjem: sousední jednotky dělí 1 000 (1 m³ = 1 000 000 cm³)",
    "Chyba bývá v tom, že se převádí jako u délky (×10). U obsahu je krok na druhou, u objemu na třetí.",
  ),
  ma(
    "rule-trojice",
    "geometrie",
    "Geometrie",
    "Pythagorejské trojice, které se vyplatí znát",
    "3–4–5\n5–12–13\n8–15–17\n7–24–25\n20–21–29",
    "Fungují i jejich násobky (6–8–10, 9–12–15). Poznáte je v zadání a ušetříte odmocňování — kalkulačka u zkoušky není.",
  ),
  ma(
    "rule-prumer",
    "zavislosti-a-data",
    "Závislosti a data",
    "Aritmetický průměr, modus, medián",
    "průměr = součet : počet\nmodus = nejčastější hodnota\nmedián = prostřední hodnota v seřazené řadě",
    "Je-li hodnot sudý počet, medián je průměr dvou prostředních. Medián na rozdíl od průměru neovlivní jedna extrémní hodnota.",
  ),
  ma(
    "rule-pomer",
    "cislo-a-promenna",
    "Číslo a proměnná",
    "Dělení celku v daném poměru",
    "Sečti členy poměru → tolik je dílů.\nCelek : počet dílů = jeden díl.\nJeden díl × člen poměru = hledaná část.",
    "Kontrola: části se musí sečíst zpátky na celek.",
  ),
  ma(
    "rule-soustava",
    "cislo-a-promenna",
    "Číslo a proměnná",
    "Soustava dvou rovnic — jak na ni",
    "sčítací metoda: uprav koeficienty u jedné neznámé tak, aby se při sečtení (odečtení) vyrušila\ndosazovací metoda: z jedné rovnice vyjádři neznámou a dosaď do druhé",
    "U zkoušky se vyžaduje zápis postupu. Klíč dává bod i za jednu správně vypočtenou neznámou, takže i rozpracované řešení má cenu.",
  ),
  ma(
    "rule-rada",
    "aplikacni-ulohy",
    "Nestandardní úlohy",
    "Jak hledat pravidlo číselné řady",
    "1. rozdíly sousedních členů\n2. jsou-li rozdíly stejné → přičítá se stále totéž\n3. rostou-li rozdíly pravidelně → druhé rozdíly\n4. podíly členů → násobí se",
    "Když nesedí ani jedno, zkuste, jestli se nestřídají dvě pravidla (+3, ×2, +3, ×2 …).",
  ),
  ma(
    "rule-umernost",
    "zavislosti-a-data",
    "Závislosti a data",
    "Přímá a nepřímá úměrnost",
    "přímá — kolikrát víc jednoho, tolikrát víc druhého\nnepřímá — kolikrát víc jednoho, tolikrát MÉNĚ druhého",
    "U nepřímé úměrnosti je součin obou veličin stálý: víc dělníků → méně dní, ale člověkodnů je pořád stejně.",
  ),
];

export const CARDS: Card[] = [...rules, ...derived];

/** Kartičky pro daný předmět, volitelně jen z jednoho okruhu. */
export function deck(subject: Subject, topic?: string | null): Card[] {
  return CARDS.filter((c) => c.subject === subject && (!topic || c.topic === topic));
}

/** Okruhy, pro které nějaké kartičky existují. */
export function deckTopics(subject: Subject): Array<{ key: string; label: string; count: number }> {
  const m = new Map<string, { key: string; label: string; count: number }>();
  for (const c of CARDS.filter((x) => x.subject === subject)) {
    const e = m.get(c.topic) ?? { key: c.topic, label: c.topicLabel, count: 0 };
    e.count++;
    m.set(c.topic, e);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}
