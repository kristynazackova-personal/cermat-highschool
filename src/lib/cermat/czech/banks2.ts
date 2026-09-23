/**
 * Banky pro formáty, které přineslo srovnání se skutečnými sešity
 * C9A / C9B / C9C 2026: vid sloves, vypisování slov z textu, seřazení
 * částí textu, interpunkce po jednotlivých větách a básnické prostředky.
 */

/* ------------------------------------------------------------------ */
/* Vid sloves — přiřazovací úloha (v sešitu úloha 6)                    */
/* ------------------------------------------------------------------ */

/** Slovesa nedokonavá — dějem se neurčuje jeho ukončení. */
export const NEDOKONAVA = [
  "naléhat", "objíždět", "vzkvétat", "probíhat", "pobývat", "dohlížet",
  "rozdělovat", "zamýšlet", "vydělávat", "sledovat", "opakovat", "zkoumat",
  "budovat", "pracovat", "hledat", "poslouchat", "vysvětlovat", "přebírat",
  "utíkat", "zvedat", "otvírat", "sestavovat",
];

/** Slovesa dokonavá — děj je vyjádřen jako ukončený celek. */
export const DOKONAVA = [
  "rozbalit", "podat", "nazvat", "zaplatit", "obstarat", "dopadnout",
  "koupit", "napsat", "přečíst", "najít", "postavit", "rozhodnout",
  "vysvětlit", "otevřít", "zavřít", "podepsat", "zvednout", "utéct",
  "sestavit", "přebrat", "vrátit", "doplnit",
];

/* ------------------------------------------------------------------ */
/* Interpunkce po jednotlivých větách — dichotomická úloha A/N          */
/* ------------------------------------------------------------------ */

export const INTERPUNKCE_VETY: Array<{ text: string; ok: boolean; why: string }> = [
  { text: "Jakýkoli dopis, který je určen do rukou ředitele může převzít pouze on.", ok: false, why: "Chybí čárka za vedlejší větou přívlastkovou — správně „…ředitele, může převzít…“." },
  { text: "Uvádí se, že v jiných případech je situace složitější, ne-li dokonce neřešitelná.", ok: true, why: "Vedlejší věta je oddělena správně a spojení „ne-li“ se píše se spojovníkem." },
  { text: "Po náročné cestě domů, trvající mnohem déle než obvykle, šla hned spát.", ok: true, why: "Přívlastek volný je oddělen z obou stran; před „než“ v tomto spojení čárka nepatří." },
  { text: "Vysvětlila svým rodičům, proč přerušila studium, a proč jim to nejdřív tajila.", ok: false, why: "Dvě vedlejší věty v poměru slučovacím se spojkou a se čárkou neoddělují — správně „…studium a proč…“." },
  { text: "Když se rozednilo, vyrazili jsme na cestu.", ok: true, why: "Vedlejší věta časová stojí před hlavní a je oddělena čárkou." },
  { text: "Nevěděl jestli má počkat, nebo odejít.", ok: false, why: "Před spojkou „jestli“ chybí čárka — správně „Nevěděl, jestli…“." },
  { text: "Petře, podej mi prosím tu knihu.", ok: true, why: "Oslovení je odděleno čárkou." },
  { text: "Koupil jsem chleba, máslo a sýr.", ok: true, why: "Ve výčtu se čárky píší mezi členy, před spojkou a v poměru slučovacím ne." },
  { text: "Byl unavený ale pokračoval v práci.", ok: false, why: "Před spojkou „ale“ (poměr odporovací) musí být čárka." },
  { text: "Film, na který jsme se těšili, nakonec nedávali.", ok: true, why: "Vedlejší věta přívlastková je vložena a oddělena z obou stran." },
  { text: "Dokud nepřijdeš domů nebudu klidná.", ok: false, why: "Chybí čárka před větou hlavní — správně „Dokud nepřijdeš domů, nebudu klidná.“" },
  { text: "Na výletě jsme viděli hrad, zámek i starý mlýn.", ok: true, why: "Čárky ve výčtu jsou správně, před spojkou „i“ v poměru slučovacím se nepíší." },
];

/* ------------------------------------------------------------------ */
/* Nespisovné tvary sloves — úloha „najděte tři věty“                   */
/* ------------------------------------------------------------------ */

export const VETY_SPISOVNE = [
  "Slibte mi to.", "Kněz sepjal ruce.", "Jano, zaujmi moje místo.",
  "Jezte častěji ryby.", "Kamilo, už neplač.", "Zítra vstaňte v osm.",
  "Bez něho byste zaspali.", "Karle, odnes to dovnitř.", "Oni to dokážou.",
  "Zvedni to ze země.", "Půjčte mi tu knihu.", "Vezmi si teplý svetr.",
  "Buďte tu včas.", "Napiš mi, až dorazíš.", "Řekněte jim to sami.",
  "Nespěchejte na mě.",
];

export const VETY_NESPISOVNE: Array<{ text: string; why: string }> = [
  { text: "Oni ho chtěj v týmu.", why: "Spisovně „chtějí“ — tvar „chtěj“ je obecněčeský." },
  { text: "Bratr o to zakop.", why: "Spisovně „zakopl“ — v příčestí minulém nesmí chybět -l." },
  { text: "Klidně si sednite k nám.", why: "Spisovně „sedněte“ — tvar „sednite“ je nespisovný." },
  { text: "Nesmíš na to zapomenót.", why: "Spisovně „zapomenout“." },
  { text: "Voni to nestihnou.", why: "Spisovně „oni“ — protetické v- je nespisovné." },
  { text: "Kluci to určitě udělaj.", why: "Spisovně „udělají“." },
  { text: "Pes vylez z boudy.", why: "Spisovně „vylezl“ — chybí -l v příčestí." },
  { text: "Musíš to napsát znovu.", why: "Spisovně „napsat“." },
  { text: "Sestra mi to řekla, ať to udělám sám.", why: "Spisovně bez nadbytečného „ať“ po „řekla mi, abych…“." },
  { text: "Děti se moc těšej na prázdniny.", why: "Spisovně „těší“." },
];

/* ------------------------------------------------------------------ */
/* Doplnění náležitého tvaru slova do mezery                            */
/* ------------------------------------------------------------------ */

export const TVAR_SLOVA: Array<{
  text: string;
  base: string;
  answer: string;
  accept?: string[];
  why: string;
}> = [
  { text: "Spisovatel ochotně odpovídal na dotazy _____ posluchači.", base: "položený", answer: "položené", why: "Dotazy (4. pád mn. č., rod mužský neživotný) položené posluchači." },
  { text: "Během besedy jsme se dotkli i témat _____ se životem v zahraničí.", base: "související", answer: "souvisejících", why: "Témat (2. pád mn. č.) souvisejících se životem." },
  { text: "Policisté ocenili práci hasičů _____ u nehody.", base: "zasahující", answer: "zasahujících", why: "Hasičů (2. pád mn. č.) zasahujících u nehody." },
  { text: "Lékař se okamžitě věnoval _____ chodci.", base: "zraněný", answer: "zraněnému", why: "Věnoval se komu, čemu (3. pád j. č.) — zraněnému chodci." },
  { text: "Zpráva se týkala žáků _____ do soutěže.", base: "přihlášený", answer: "přihlášených", why: "Žáků (2. pád mn. č.) přihlášených do soutěže." },
  { text: "Setkali jsme se s lidmi _____ o stejnou věc.", base: "usilující", answer: "usilujícími", why: "S lidmi (7. pád mn. č.) usilujícími o stejnou věc." },
  { text: "Organizátoři poděkovali všem _____ akce.", base: "návštěvník", answer: "návštěvníkům", why: "Poděkovali komu, čemu (3. pád mn. č.) — návštěvníkům." },
  { text: "Kniha pojednává o městech _____ za druhé světové války.", base: "zničený", answer: "zničených", why: "O městech (6. pád mn. č.) zničených za války." },
];

/* ------------------------------------------------------------------ */
/* Gramaticky správné doplnění větného celku                            */
/* ------------------------------------------------------------------ */

export const GRAMATICKE_DOPLNENI: Array<{
  sentence: string;
  correct: string;
  wrong: [string, string, string];
  why: string;
}> = [
  {
    sentence: "Zámeček na Pardubicku se po několikaletém úsilí _____ komorní koncerty nebo divadelní představení.",
    correct: "stal místem, kde se konají",
    wrong: ["proměnil v místo, konajícím", "stal místem, kde se odehrává", "proměnil v místo, odehrávajícím"],
    why: "Podmětem vedlejší věty jsou koncerty i představení (množné číslo), přísudek proto musí být „se konají“. Varianty s přechodníkovým tvarem jsou gramaticky vadné.",
  },
  {
    sentence: "Díky novému vybavení mohou lékaři _____ mnohem dříve.",
    correct: "odhalit onemocnění",
    wrong: ["odhalení onemocnění", "odhalujíce onemocnění", "k odhalení onemocnění"],
    why: "Po slovesu „mohou“ následuje infinitiv — „mohou odhalit“.",
  },
  {
    sentence: "Výstava, _____ se konala loni, přilákala tisíce návštěvníků.",
    correct: "která",
    wrong: ["kterou", "které", "již"],
    why: "Vztažné zájmeno je podmětem vedlejší věty, musí tedy být v 1. pádě: která se konala.",
  },
  {
    sentence: "Obyvatelé obce se shodli na tom, _____ nová silnice povede mimo centrum.",
    correct: "že",
    wrong: ["aby", "zda", "jakoby"],
    why: "Jde o oznámení skutečnosti, na níž se shodli — vedlejší věta se uvozuje spojkou „že“.",
  },
  {
    sentence: "Ředitelka poděkovala všem, _____ se na přípravě akce podíleli.",
    correct: "kteří",
    wrong: ["které", "kterým", "jenž"],
    why: "Zájmeno je podmětem vedlejší věty (rod mužský životný, množné číslo) — „kteří se podíleli“.",
  },
];

/* ------------------------------------------------------------------ */
/* Básnické prostředky založené na opakování — přiřazovací úloha        */
/* ------------------------------------------------------------------ */

export type ProstredekDef = { key: string; nazev: string; definice: string };

export const PROSTREDKY: ProstredekDef[] = [
  {
    key: "epizeuxis",
    nazev: "epizeuxis",
    definice:
      "jeho podstatou je, že se v rámci jednoho verše opakuje totéž ohebné slovo užité ve stejném tvaru",
  },
  {
    key: "epifora",
    nazev: "epifora",
    definice:
      "jeho podstatou je opakování téhož slova či více slov na samém konci bezprostředně po sobě jdoucích veršů",
  },
  {
    key: "anafora",
    nazev: "anafora",
    definice:
      "jeho podstatou je opakování téhož slova či více slov na samém začátku bezprostředně po sobě jdoucích veršů",
  },
  {
    key: "epanastrofa",
    nazev: "epanastrofa (palilogie)",
    definice:
      "jeho podstatou je opakování téhož slova či více slov z konce jednoho verše na začátku bezprostředně následujícího verše",
  },
];

/** Úryvky, v nichž je uvedený prostředek prokazatelně obsažen. */
export const UKAZKY_PROSTREDKU: Array<{ prostredek: string; text: string }> = [
  { prostredek: "epizeuxis", text: "Ho, nech modlení – skoč a pojď,\nskoč a pojď a mě doprovoď;\nměsíček svítí na cestu:\njá přišel pro svou nevěstu." },
  { prostredek: "anafora", text: "Ach nechoď, nechoď na jezero,\nzůstaň dnes doma, moje dcero!\nJá měla zlý té noci sen:\nnechoď, dceruško, k vodě ven." },
  { prostredek: "epifora", text: "Nedávejte mne ve vsi na hřbitov,\ntam bývá nářek sirotků a vdov,\ntam slzí hořkých mnoho plynulo:\nsrdéčko mé by hořem hynulo." },
  { prostredek: "epanastrofa", text: "Což bych se bála? Tys se mnou\na oko boží nade mnou.\nPověz, můj milý, řekni přec,\nživ-li a zdráv je tvůj otec?" },
  { prostredek: "epizeuxis", text: "Tiše, tiše ať se nikdo nevzbudí,\nvítr venku o okenici buší.\nSpí už celý dům i lampa u vrat,\njen ta jedna svíce nechce zhasnout." },
  { prostredek: "anafora", text: "Kdo viděl ráno nad řekou,\nkdo slyšel zvon na starém mostě,\nten ví, jak tiše leží kraj,\nkdyž slunce teprv vstává." },
  { prostredek: "epifora", text: "Za oknem byla tma,\nv komoře byla tma,\na v srdci, které čekalo,\nusedla také tma." },
  { prostredek: "epanastrofa", text: "A z dálky zněla píseň,\npíseň, již nikdo neznal,\nznal ji jen starý vítr\nnad hladinou rybníka." },
];

/** Úryvky bez opakovacích prostředků — slouží jako nesprávné možnosti. */
export const UKAZKY_BEZ_PROSTREDKU: string[] = [
  "Pověz, můj milý, řekni jen,\njak je tvůj domek upraven?\nČistá světnička? Veselá?\nA zdali blízko kostela?",
  "Stokrát jsem tě prosila,\npřimlouvala sladce,\nbys mi na čas, na kratičký,\ndovolil k mé matce.",
  "Nad polem stál bílý sloup dýmu,\nv trávě chladla poslední rosa.\nZ lesa se ozval osamělý pták\na pak už bylo jenom ticho.",
  "Voda se leskla mezi kameny,\nna břehu ležel starý člun.\nNikdo už dávno nevyplul\nna druhou stranu jezera.",
];
