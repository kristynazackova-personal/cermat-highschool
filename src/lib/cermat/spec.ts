/**
 * Specifikace požadavků k jednotné přijímací zkoušce (JPZ / "Cermat")
 * — čtyřleté obory vzdělání zakončené maturitní zkouškou.
 *
 * Zdrojem parametrů je Specifikace požadavků vydávaná CZVV (Cermat),
 * vycházející ze vzdělávacích oborů "Český jazyk a literatura" a
 * "Matematika a její aplikace" definovaných v RVP ZV.
 * Pro školní rok 2025/2026 platí Specifikace ve stejném znění jako pro 2022/2023.
 *
 * Tento soubor je JEDINÝM zdrojem pravdy o parametrech testu. Generátor
 * (build.ts) sestavuje test podle zde uloženého blueprintu — když se změní
 * specifikace, mění se tento soubor, ne generátory.
 */

export type Subject = "matematika" | "cestina";

export type TaskFormat =
  | "open-result" // otevřená úloha, zapisuje se jen výsledek
  | "open-work" // otevřená úloha, vyžaduje se celý postup řešení
  | "choice" // uzavřená úloha s výběrem z nabídky
  | "truefalse" // dichotomická úloha A/N
  | "match" // přiřazovací úloha se společnou nabídkou
  | "order" // seřazení částí textu
  | "wordlist" // vypsání několika slov nalezených ve výchozím textu
  | "construction"; // konstrukční (geometrická) úloha

/**
 * Jak se sčítají body skupinové úlohy.
 *
 * `per-part` — každá podúloha se boduje samostatně (výchozí).
 * `stepped`  — dichotomická úloha A/N: v testech Cermat NENÍ hodnocení
 *              lineární. U tříčlenné skupiny za max. 4 body platí
 *              3 správně → 4 b, 2 správně → 2 b, 1 nebo 0 správně → 0 b.
 *              Ověřeno v klíči M9A/M9B/M9C/M9D 2026, úloha 11, a v klíči
 *              C9A/C9B/C9C 2026, kde má skupina ČTYŘI podúlohy a platí
 *              4 správně → 2 b, 3 → 1 b, 2 a méně → 0 b. Pravidlo je tedy
 *              v obou předmětech totéž: vše správně → plný počet, jedna
 *              chyba → polovina, jinak nula.
 * `errors`   — úloha „vypište N slov z výchozího textu“. Body = max(0, N − chyby),
 *              přičemž chybou je JAK nenalezené slovo, TAK zapsané slovo, které
 *              zadání neodpovídá. Napsat něco špatně je proto dražší než
 *              nechat pole prázdné. Pořadí zápisu nerozhoduje.
 *              Ověřeno v klíči C9A/C9B/C9C 2026 (úlohy 9, 18, 25).
 * `all-or-nothing` — seřazení částí textu: body jen tehdy, je-li celé pořadí
 *              správné. Ověřeno v klíči C9A/C9B/C9C 2026, úloha 15 (resp. 14).
 */
export type ScoringMode = "per-part" | "stepped" | "errors" | "all-or-nothing";

/** Základní parametry zkoušky. */
export const EXAM = {
  branch: "Čtyřleté obory vzdělání (včetně nástavbového studia)",
  schoolYear: "2025/2026",
  subjects: {
    matematika: {
      label: "Matematika",
      minutes: 70,
      tasks: 16,
      points: 50,
      note:
        "Test obsahuje otevřené a uzavřené úlohy; u každé uzavřené úlohy nebo " +
        "podúlohy je právě jedna odpověď správná. Za neuvedené ani za nesprávné " +
        "řešení se neudělují záporné body — u uzavřených úloh se proto vyplatí " +
        "tipovat. Je-li požadován celý postup řešení a uvedete pouze výsledek, " +
        "nebudou vám přiděleny žádné body.",
      allowed: "Pouze psací a rýsovací potřeby. Kalkulačka ani tabulky povoleny NEJSOU.",
    },
    cestina: {
      label: "Český jazyk a literatura",
      minutes: 60,
      tasks: 30,
      points: 50,
      note:
        "Většina úloh je uzavřených s nabídkou A–D, u každé je právě jedna " +
        "odpověď správná; menší část je otevřená. Řada úloh se váže k výchozímu " +
        "textu. Za neuvedené ani za nesprávné řešení se neudělují záporné body. " +
        "Při psaní odpovědí rozlišujte velká a malá písmena; otevřené odpovědi " +
        "musí být zapsány pravopisně správně včetně diakritiky.",
      allowed: "Pouze psací potřeby. Pravidla českého pravopisu ani slovníky povoleny NEJSOU.",
    },
  },
} as const;

/** Tematický okruh specifikace + co se k němu má umět. */
export type SpecTopic = {
  /** Klíč používaný generátory. */
  key: string;
  /** Název okruhu podle specifikace. */
  area: string;
  /** Konkrétní dovednosti — "co se učit". */
  skills: string[];
};

/**
 * MATEMATIKA — čtyři okruhy specifikace požadavků.
 */
export const MATH_TOPICS: SpecTopic[] = [
  {
    key: "cislo-a-promenna",
    area: "Číslo a proměnná",
    skills: [
      "Provádět početní operace s přirozenými, celými, racionálními a desetinnými čísly",
      "Počítat se zlomky, převádět zlomek na desetinné číslo a naopak, krátit a rozšiřovat",
      "Určovat dělitele a násobky, NSD a nsn, znaky dělitelnosti, prvočísla a čísla složená",
      "Používat mocniny s přirozeným exponentem a druhou odmocninu",
      "Zaokrouhlovat, odhadovat výsledek a používat absolutní hodnotu",
      "Upravovat výrazy s proměnnou, dosazovat do výrazů, používat vzorce (a±b)² a a²−b²",
      "Řešit lineární rovnice a jejich soustavy, provádět zkoušku",
      "Vyjádřit neznámou ze vzorce",
      "Řešit slovní úlohy o procentech, úrocích a promile",
      "Používat poměr, měřítko plánu a mapy, dělení celku v daném poměru",
      "Rozlišit přímou a nepřímou úměrnost a využít trojčlenku",
    ],
  },
  {
    key: "zavislosti-a-data",
    area: "Závislosti, vztahy a práce s daty",
    skills: [
      "Převádět jednotky délky, obsahu, objemu, hmotnosti, času a rychlosti",
      "Číst a sestrojit tabulku, sloupcový a kruhový diagram, spojnicový graf",
      "Určit aritmetický průměr, modus, medián a rozpětí souboru dat",
      "Vyjádřit funkční závislost tabulkou, rovnicí i grafem",
      "Pracovat s lineární funkcí a jejím grafem, určit průsečíky s osami",
      "Řešit úlohy na pohyb, společnou práci a směsi",
    ],
  },
  {
    key: "geometrie",
    area: "Geometrie v rovině a v prostoru",
    skills: [
      "Určovat obvod a obsah trojúhelníku, čtyřúhelníků, kruhu a složených obrazců",
      "Používat Pythagorovu větu v rovině i v prostoru",
      "Rozlišit shodnost a podobnost trojúhelníků, pracovat s poměrem podobnosti",
      "Znát vlastnosti trojúhelníku (výšky, těžnice, kružnice opsaná a vepsaná)",
      "Určit velikosti úhlů — vrcholové, vedlejší, souhlasné, střídavé, úhly v trojúhelníku",
      "Sestrojit trojúhelník, čtyřúhelník a kružnici ze zadaných prvků; zapsat postup konstrukce",
      "Provádět konstrukce s využitím množin bodů dané vlastnosti (osa úsečky, osa úhlu, Thaletova kružnice)",
      "Určit povrch a objem krychle, kvádru, hranolu, válce a jehlanu",
      "Pracovat se sítí tělesa a s pohledy na těleso",
      "Užívat osovou a středovou souměrnost",
    ],
  },
  {
    key: "aplikacni-ulohy",
    area: "Nestandardní aplikační úlohy a problémy",
    skills: [
      "Řešit úlohy logického charakteru a číselné i obrázkové řady",
      "Analyzovat problém, zvolit vhodnou strategii a ověřit výsledek",
      "Užívat úsudek tam, kde nevede přímý početní postup",
      "Řešit kombinatorické úlohy jednoduchým výčtem možností",
      "Odhadnout a ověřit reálnost výsledku v kontextu zadání",
    ],
  },
];

/**
 * ČESKÝ JAZYK A LITERATURA — tři oblasti specifikace
 * (komunikačně-slohová, jazyková, literární), rozepsané na okruhy.
 */
export const CZECH_TOPICS: SpecTopic[] = [
  {
    key: "porozumeni",
    area: "Porozumění textu (komunikačně-slohová oblast)",
    skills: [
      "Najít v textu explicitně uvedenou informaci",
      "Vyvodit informaci, která v textu není řečena přímo",
      "Rozpoznat hlavní myšlenku textu a záměr autora",
      "Posoudit, které tvrzení odpovídá obsahu textu a které mu odporuje",
      "Rozlišit v textu fakt a názor",
    ],
  },
  {
    key: "sloh",
    area: "Komunikační a slohová výchova",
    skills: [
      "Rozlišit funkční styly (prostěsdělovací, odborný, publicistický, administrativní, umělecký)",
      "Rozpoznat slohový útvar (vypravování, popis, charakteristika, úvaha, výklad, zpráva, oznámení, životopis, žádost, inzerát)",
      "Rozlišit subjektivní a objektivní sdělení",
      "Uspořádat části textu tak, aby na sebe navazovaly",
      "Znát zásady formální úpravy dopisu, žádosti a životopisu",
    ],
  },
  {
    key: "pravopis",
    area: "Pravidla českého pravopisu",
    skills: [
      "Psát i/y po obojetných souhláskách — vyjmenovaná slova a slova příbuzná",
      "Shoda přísudku s podmětem, včetně podmětu několikanásobného",
      "Psaní i/y v koncovkách podstatných a přídavných jmen",
      "Předpony a předložky s/z, vz; skupiny bě/bje, pě, vě/vje, mě/mně",
      "Psaní velkých písmen ve vlastních jménech a názvech",
      "Interpunkce v jednoduché větě i v souvětí",
      "Psaní ú/ů, zdvojených souhlásek a slov přejatých",
    ],
  },
  {
    key: "slovni-zasoba",
    area: "Slovní zásoba a tvoření slov",
    skills: [
      "Určit synonyma, antonyma, homonyma a slova mnohoznačná",
      "Rozlišit slova spisovná, nespisovná, citově zabarvená a odborná",
      "Rozpoznat způsob tvoření slov — odvozování, skládání, zkracování",
      "Určit kořen, předponu, příponu a koncovku",
      "Vysvětlit význam rčení, přísloví a ustálených spojení",
      "Rozpoznat slova přejatá a jejich význam",
    ],
  },
  {
    key: "tvaroslovi",
    area: "Tvarosloví",
    skills: [
      "Určit slovní druhy ve větě",
      "Určit mluvnické kategorie podstatných a přídavných jmen (pád, číslo, rod, vzor)",
      "Určit mluvnické kategorie sloves (osoba, číslo, čas, způsob, rod, vid)",
      "Skloňovat zájmena a číslovky, rozlišit jejich druhy",
      "Rozpoznat a opravit tvary nespisovné nebo chybně utvořené",
    ],
  },
  {
    key: "skladba",
    area: "Skladba",
    skills: [
      "Určit základní skladební dvojici — podmět a přísudek, včetně podmětu nevyjádřeného",
      "Rozlišit druhy podmětu a přísudku",
      "Určit rozvíjející větné členy (předmět, přívlastek, příslovečné určení, doplněk)",
      "Rozlišit větu jednoduchou a souvětí, určit počet vět v souvětí",
      "Rozlišit souvětí souřadné a podřadné",
      "Určit druhy vedlejších vět a poměry mezi větami hlavními",
      "Rozpoznat přímou a nepřímou řeč",
    ],
  },
  {
    key: "literatura",
    area: "Literární výchova",
    skills: [
      "Rozlišit poezii, prózu a drama a jejich znaky",
      "Rozpoznat literární druhy a žánry (bajka, pohádka, pověst, balada, román, novela, povídka, komedie, tragédie)",
      "Určit základní jazykové prostředky — metafora, metonymie, personifikace, přirovnání, epiteton, hyperbola",
      "Pracovat s veršem — rým (sdružený, střídavý, obkročný, přerývaný), rytmus, sloka",
      "Rozlišit vypravěče v 1. a 3. osobě",
      "Orientovat se v základních pojmech: autor, lyrický subjekt, postava, zápletka, pointa",
    ],
  },
];

/** Jedna položka plánu testu — co generátor pro danou pozici vyrobí. */
export type BlueprintItem = {
  /** Pořadí úlohy v testu. */
  n: number;
  /** Klíč generátoru. */
  gen: string;
  /** Okruh specifikace, do kterého úloha spadá. */
  topic: string;
  /** Bodová dotace. */
  points: number;
  format: TaskFormat;
  /** Nelineární hodnocení skupiny (jen dichotomické úlohy A/N). */
  scoring?: ScoringMode;
};

/**
 * Plán testu z matematiky — 16 úloh, 50 bodů.
 *
 * Odvozeno ze čtyř skutečných sešitů JPZ 2026 pro čtyřleté obory
 * (M9A 1. řádný, M9B 2. řádný, M9C 1. náhradní, M9D 2. náhradní termín);
 * rozbor je v `docs/JPZ_M9A_2026_T1.md`. Napříč všemi čtyřmi formami je
 * stabilní tato kostra:
 *
 *   1        krátký úvodní výpočet, jen výsledek
 *   2–4      zlomky → úpravy výrazů → rovnice; poslední část vždy s postupem
 *   5–8      slovní úlohy a geometrie, jen výsledky
 *   9, 10    dvě konstrukční úlohy, dohromady vždy 5 bodů
 *   11       dichotomická úloha A/N o třech tvrzeních, vždy 4 body
 *   12–14    tři samostatné uzavřené úlohy po 2 bodech, nabídka A–E
 *   15       přiřazovací úloha, tři podúlohy, společná nabídka A–F, 6 bodů
 *   16       nestandardní aplikační úloha, 4 body
 *
 * Bodové dotace úloh 1 a 5–8 se mezi formami mírně liší; použito je
 * rozložení formy M9B.
 */
export const MATH_BLUEPRINT: BlueprintItem[] = [
  { n: 1, gen: "uvod", topic: "zavislosti-a-data", points: 1, format: "open-result" },
  { n: 2, gen: "zlomky", topic: "cislo-a-promenna", points: 4, format: "open-work" },
  { n: 3, gen: "vyrazy", topic: "cislo-a-promenna", points: 4, format: "open-work" },
  { n: 4, gen: "rovnice", topic: "cislo-a-promenna", points: 4, format: "open-work" },
  { n: 5, gen: "procenta", topic: "cislo-a-promenna", points: 3, format: "open-result" },
  { n: 6, gen: "modelovani", topic: "cislo-a-promenna", points: 4, format: "open-result" },
  { n: 7, gen: "telesa", topic: "geometrie", points: 3, format: "open-result" },
  { n: 8, gen: "trojuhelnik", topic: "geometrie", points: 2, format: "open-result" },
  { n: 9, gen: "konstrukce1", topic: "geometrie", points: 2, format: "construction" },
  { n: 10, gen: "konstrukce2", topic: "geometrie", points: 3, format: "construction" },
  { n: 11, gen: "anone", topic: "zavislosti-a-data", points: 4, format: "truefalse", scoring: "stepped" },
  { n: 12, gen: "vyber1", topic: "cislo-a-promenna", points: 2, format: "choice" },
  { n: 13, gen: "vyber2", topic: "geometrie", points: 2, format: "choice" },
  { n: 14, gen: "vyber3", topic: "geometrie", points: 2, format: "choice" },
  { n: 15, gen: "prirazovani", topic: "cislo-a-promenna", points: 6, format: "match" },
  { n: 16, gen: "nestandardni", topic: "aplikacni-ulohy", points: 4, format: "open-result" },
];

/**
 * Vybrané vzorce a vztahy — v testovém sešitu je žák má na poslední straně,
 * takže je musíme ukázat také.
 */
export const MATH_FORMULAS = {
  squares: "11² = 121 · 12² = 144 · 13² = 169 · 14² = 196 · 15² = 225 · 16² = 256 · 17² = 289 · 18² = 324 · 19² = 361 · 20² = 400",
  pi: "π ≐ 3,14   π ≈ 22/7",
  products: [
    "a² + 2ab + b² = (a + b)(a + b)",
    "a² − 2ab + b² = (a − b)(a − b)",
    "a² − b² = (a + b)(a − b)",
  ],
  circle: "Kruh o poloměru r:  o = 2πr,  S = πr²",
};

/**
 * Plán testu z českého jazyka a literatury — 30 úloh, 50 bodů.
 *
 * Odvozeno ze tří skutečných sešitů JPZ 2026 pro čtyřleté obory
 * (C9A 1. řádný, C9B 2. řádný, C9C 1. náhradní termín). Napříč formami
 * je stabilní tato skladba:
 *
 *   ~17 uzavřených úloh po 1 bodu s nabídkou A–D, vázaných k výchozím textům
 *   4 dichotomické skupiny A/N po ČTYŘECH tvrzeních, po 2 bodech, stupňovitě
 *   3 úlohy „vypište N slov / čísel“ za 2, 3 a 4 body, hodnocené počtem chyb
 *   1 seřazení částí textu za 3 body, hodnocené vše nebo nic
 *   1 přiřazování ke trojici možností (3 b) a 1 ke čtveřici (4 b)
 *   1 zápis základní skladební dvojice a 1 určení větných členů, po 2 bodech
 *   1 doplnění náležitého tvaru slova, 2 body
 *
 * Bodové rozložení odpovídá formě C9A.
 */
export const CZECH_BLUEPRINT: BlueprintItem[] = [
  { n: 1, gen: "pravopis-veta", topic: "pravopis", points: 1, format: "choice" },
  { n: 2, gen: "text-obsah", topic: "porozumeni", points: 1, format: "choice" },
  { n: 3, gen: "slovni-druhy", topic: "tvaroslovi", points: 1, format: "choice" },
  { n: 4, gen: "rym", topic: "literatura", points: 1, format: "choice" },
  { n: 5, gen: "zakladni-dvojice", topic: "skladba", points: 2, format: "open-result" },
  { n: 6, gen: "vid", topic: "tvaroslovi", points: 3, format: "match" },
  { n: 7, gen: "tvar-slova", topic: "tvaroslovi", points: 2, format: "open-result" },
  { n: 8, gen: "vyplyva-a", topic: "porozumeni", points: 2, format: "truefalse", scoring: "stepped" },
  { n: 9, gen: "vypis-predpony", topic: "slovni-zasoba", points: 2, format: "wordlist", scoring: "errors" },
  { n: 10, gen: "tvoreni-slov", topic: "slovni-zasoba", points: 1, format: "choice" },
  { n: 11, gen: "text-myslenka", topic: "porozumeni", points: 1, format: "choice" },
  { n: 12, gen: "vyznam-slov", topic: "slovni-zasoba", points: 1, format: "choice" },
  { n: 13, gen: "rceni", topic: "slovni-zasoba", points: 1, format: "choice" },
  { n: 14, gen: "interpunkce-an", topic: "pravopis", points: 2, format: "truefalse", scoring: "stepped" },
  { n: 15, gen: "serazeni", topic: "sloh", points: 3, format: "order", scoring: "all-or-nothing" },
  { n: 16, gen: "gramaticke-doplneni", topic: "sloh", points: 1, format: "choice" },
  { n: 17, gen: "funkcni-styl", topic: "sloh", points: 1, format: "choice" },
  { n: 18, gen: "chyby-v-textu", topic: "pravopis", points: 4, format: "wordlist", scoring: "errors" },
  { n: 19, gen: "vyplyva-b", topic: "porozumeni", points: 2, format: "truefalse", scoring: "stepped" },
  { n: 20, gen: "vetne-cleny", topic: "skladba", points: 2, format: "open-result" },
  { n: 21, gen: "literarni-druh", topic: "literatura", points: 1, format: "choice" },
  { n: 22, gen: "druh-souveti", topic: "skladba", points: 1, format: "choice" },
  { n: 23, gen: "zanr", topic: "literatura", points: 1, format: "choice" },
  { n: 24, gen: "pravopis-skupina", topic: "pravopis", points: 1, format: "choice" },
  { n: 25, gen: "nespisovne-tvary", topic: "tvaroslovi", points: 3, format: "wordlist", scoring: "errors" },
  { n: 26, gen: "vyplyva-c", topic: "porozumeni", points: 2, format: "truefalse", scoring: "stepped" },
  { n: 27, gen: "antonyma", topic: "slovni-zasoba", points: 1, format: "choice" },
  { n: 28, gen: "slohovy-utvar", topic: "sloh", points: 1, format: "choice" },
  { n: 29, gen: "vzory", topic: "tvaroslovi", points: 1, format: "choice" },
  { n: 30, gen: "literarni-prostredky", topic: "literatura", points: 4, format: "match" },
];

/** Kontrola, že plán sedí na parametry zkoušky. Volá se v testech. */
export function verifyBlueprint(subject: Subject) {
  const bp = subject === "matematika" ? MATH_BLUEPRINT : CZECH_BLUEPRINT;
  const cfg = EXAM.subjects[subject];
  const points = bp.reduce((s, i) => s + i.points, 0);
  return {
    ok: points === cfg.points && bp.length === cfg.tasks,
    points,
    expectedPoints: cfg.points,
    tasks: bp.length,
    expectedTasks: cfg.tasks,
  };
}

/** Oficiální zdroje — kde si ověřit zadání a stáhnout skutečné testy. */
export const SOURCES = [
  {
    label: "Specifikace požadavků k JPZ (Cermat)",
    url: "https://prijimacky.cermat.cz/menu/specifikace-pozadavku-k-jpz",
    note: "Závazné vymezení obsahu zkoušky pro ČJL i matematiku.",
  },
  {
    label: "Testová zadání k procvičování (Cermat)",
    url: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf.html",
    note: "Archiv zadání i klíčů správných řešení z minulých let, po oborech.",
  },
  {
    label: "Čtyřleté obory — matematika (archiv zadání)",
    url: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika.html",
    note: "Řádné i náhradní termíny od roku 2015.",
  },
  {
    label: "Čtyřleté obory — český jazyk a literatura (archiv zadání)",
    url: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-cesky-jazyk-a-literatura.html",
    note: "Řádné i náhradní termíny od roku 2015.",
  },
  {
    label: "Typické úlohy — matematika",
    url: "https://prijimacky.cermat.cz/menu/jednotna-prijimaci-zkouska/prijimacky-bez-obav/typicke-ulohy-matematika",
    note: "Komentované ukázky jednotlivých typů úloh.",
  },
  {
    label: "Typické úlohy — český jazyk a literatura",
    url: "https://prijimacky.cermat.cz/menu/jednotna-prijimaci-zkouska/prijimacky-bez-obav/typicke-ulohy-cesky-jazyk-a-literatura",
    note: "Komentované ukázky jednotlivých typů úloh.",
  },
];
