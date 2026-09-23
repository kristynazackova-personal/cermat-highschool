/**
 * Jazykové banky pro generátory češtiny.
 *
 * Zásada: jazykový obsah se NIKDY negeneruje šablonou — všechny položky jsou
 * ručně ověřené a generátor z nich jen vybírá a míchá pořadí nabídek.
 * Šablona by u češtiny snadno vyrobila tvar, který neexistuje, nebo otázku
 * s více správnými odpověďmi.
 */

/** Úloha typu „ve které možnosti je vše správně / chybně“. */
export type PickItem = {
  options: [string, string, string, string];
  /** Index správné odpovědi v poli options. */
  correct: number;
  why: string;
};

/** Doplňovací úloha — do mezery patří jedna z nabídnutých možností. */
export type FillItem = {
  text: string;
  options: string[];
  correct: string;
  why: string;
};

/** Úloha „které slovo sem patří“ — jedno správné, tři nesprávné. */
export type OneOfItem = {
  q: string;
  correct: string;
  wrong: [string, string, string];
  why: string;
};

/* ------------------------------------------------------------------ */
/* PRAVOPIS — i/y po obojetných souhláskách                            */
/* ------------------------------------------------------------------ */

/** Ve které možnosti jsou VŠECHNA slova napsána pravopisně správně? */
export const PRAVOPIS_SKUPINY: PickItem[] = [
  {
    options: ["mlýn, blýskat se, plyn", "mlín, blýskat se, plyn", "mlýn, blískat se, plyn", "mlýn, blýskat se, plin"],
    correct: 0,
    why: "Mlýn, blýskat se i plyn jsou vyjmenovaná slova (po b, l, p) — všechna se píší s ypsilon.",
  },
  {
    options: ["obyvatel, lyže, pytel", "obivatel, lyže, pytel", "obyvatel, liže, pytel", "obyvatel, lyže, pitel"],
    correct: 0,
    why: "Obyvatel je příbuzné se slovem být, lyže a pytel jsou vyjmenovaná slova po l a po p.",
  },
  {
    options: ["slepýš, netopýr, kopyto", "slepíš, netopýr, kopyto", "slepýš, netopír, kopyto", "slepýš, netopýr, kopito"],
    correct: 0,
    why: "Slepýš a netopýr jsou vyjmenovaná slova po p, kopyto po k — všechna s ypsilon.",
  },
  {
    options: ["zvykat si, jazyk, brzy", "zvikat si, jazyk, brzy", "zvykat si, jazik, brzy", "zvykat si, jazyk, brzi"],
    correct: 0,
    why: "Zvykat si je vyjmenované slovo po z, jazyk po z a brzy po b.",
  },
  {
    options: ["sýkora, sychravý, syn", "sikora, sychravý, syn", "sýkora, sichravý, syn", "sýkora, sychravý, sin"],
    correct: 0,
    why: "Sýkora, sychravý i syn jsou vyjmenovaná slova po s.",
  },
  {
    options: ["vydra, vysoký, zvykat", "vidra, vysoký, zvykat", "vydra, visoký, zvykat", "vydra, vysoký, zvikat"],
    correct: 0,
    why: "Vydra a vysoký jsou vyjmenovaná slova po v, zvykat po z.",
  },
  {
    options: ["pýcha, pytel, netopýr", "pícha, pytel, netopýr", "pýcha, pitel, netopýr", "pýcha, pytel, netopír"],
    correct: 0,
    why: "Pýcha, pytel i netopýr patří mezi vyjmenovaná slova po p.",
  },
  {
    options: ["mýdlo, myslivec, hmyz", "mídlo, myslivec, hmyz", "mýdlo, mislivec, hmyz", "mýdlo, myslivec, hmiz"],
    correct: 0,
    why: "Mýdlo (od mýt), myslivec (od mysl) i hmyz jsou vyjmenovaná slova po m.",
  },
  {
    options: ["lysý, plýtvat, slyšet", "lisý, plýtvat, slyšet", "lysý, plítvat, slyšet", "lysý, plýtvat, slišet"],
    correct: 0,
    why: "Lysý a slyšet jsou vyjmenovaná slova po l a po s, plýtvat po p.",
  },
  {
    options: ["brzy, jazyk, nazývat", "brzi, jazyk, nazývat", "brzy, jazik, nazývat", "brzy, jazyk, nazívat"],
    correct: 0,
    why: "Brzy je vyjmenované slovo po b, jazyk a nazývat po z.",
  },
];

/** Ve které z vět je pravopisná chyba? */
export const PRAVOPIS_CHYBA: PickItem[] = [
  {
    options: [
      "Naše sousedky si vyprávěly o dovolené.",
      "Kluci běželi přes louku.",
      "Ptáci odlétaly na jih.",
      "Stromy shodily listí.",
    ],
    correct: 2,
    why: "Podmět „ptáci“ je rod mužský životný, přísudek má proto koncovku -i: Ptáci odlétali.",
  },
  {
    options: [
      "Děti si hrály na zahradě.",
      "Auta stála před domem.",
      "Koťata si hráli s klubkem.",
      "Ženy nakupovaly v obchodě.",
    ],
    correct: 2,
    why: "Podmět „koťata“ je rod střední, přísudek má koncovku -a: Koťata si hrála.",
  },
  {
    options: [
      "Dopis jsem napsal včera.",
      "Byl bych přišel, kdybych to věděl.",
      "Nevím, jestli přijde.",
      "Přišly k nám dva chlapci.",
    ],
    correct: 3,
    why: "Podmět „chlapci“ je rod mužský životný: Přišli k nám dva chlapci.",
  },
  {
    options: [
      "V lese jsme našli hřiby.",
      "Na obloze se objevili mraky.",
      "Sestry zpívaly písničku.",
      "Psi štěkali na kolemjdoucí.",
    ],
    correct: 1,
    why: "Podmět „mraky“ je rod mužský neživotný: Na obloze se objevily mraky.",
  },
  {
    options: [
      "Myslivec šel brzy ráno do lesa.",
      "Na louce kvetly kopretiny.",
      "Visypal jsem koš do popelnice.",
      "Pytel byl plný obilí.",
    ],
    correct: 2,
    why: "Předpona vy- se píše s ypsilon: vysypal.",
  },
  {
    options: [
      "Podej mi, prosím, tu knihu.",
      "Bez tebe mě to vůbec nebaví.",
      "Přišel ke mně domů až večer.",
      "Řekni mě, co se vlastně stalo.",
    ],
    correct: 3,
    why: "Ve 3. pádě se píše „mně“ nebo kratší „mi“: Řekni mi (mně), co se stalo. Tvar „mě“ je 2. a 4. pád.",
  },
];

/* ------------------------------------------------------------------ */
/* PRAVOPIS — shoda přísudku s podmětem                                */
/* ------------------------------------------------------------------ */

export const SHODA: FillItem[] = [
  { text: "Na dvoře hlasitě štěkal__ psi.", options: ["i", "y", "a", "í"], correct: "i", why: "Podmět „psi“ — rod mužský životný → -i." },
  { text: "Stromy v aleji se ohýbal__ ve větru.", options: ["i", "y", "a", "í"], correct: "y", why: "Podmět „stromy“ — rod mužský neživotný → -y." },
  { text: "Děvčata si hrál__ na dvoře.", options: ["i", "y", "a", "í"], correct: "a", why: "Podmět „děvčata“ — rod střední → -a." },
  { text: "Naše kočky spal__ celé odpoledne na okně.", options: ["i", "y", "a", "í"], correct: "y", why: "Podmět „kočky“ — rod ženský → -y." },
  { text: "Chlapci a děvčata spolu soutěžil__.", options: ["i", "y", "a", "í"], correct: "i", why: "Několikanásobný podmět, jeden z členů je rod mužský životný → -i." },
  { text: "Lístky ze stromů spadl__ na zem.", options: ["i", "y", "a", "í"], correct: "y", why: "Podmět „lístky“ — rod mužský neživotný → -y." },
  { text: "Ženy i muži trpělivě čekal__ před kinem.", options: ["i", "y", "a", "í"], correct: "i", why: "Několikanásobný podmět s rodem mužským životným → -i." },
  { text: "Okna do dvora byl__ dokořán otevřená.", options: ["i", "y", "a", "í"], correct: "a", why: "Podmět „okna“ — rod střední → -a." },
  { text: "Lodě připlul__ do přístavu za svítání.", options: ["i", "y", "a", "í"], correct: "y", why: "Podmět „lodě“ — rod ženský → -y." },
  { text: "Rodiče odjel__ na víkend do hor.", options: ["i", "y", "a", "í"], correct: "i", why: "Podmět „rodiče“ — rod mužský životný → -i." },
  { text: "Koťata se schoval__ pod skříň.", options: ["i", "y", "a", "í"], correct: "a", why: "Podmět „koťata“ — rod střední → -a." },
  { text: "Housle a violy se rozeznal__ hned v úvodu.", options: ["i", "y", "a", "í"], correct: "y", why: "Podmět je rodu ženského → -y." },
];

/* ------------------------------------------------------------------ */
/* PRAVOPIS — mě/mně, bě/bje, vě/vje                                   */
/* ------------------------------------------------------------------ */

export const MNE: FillItem[] = [
  { text: "Zapo__l si doma deštník.", options: ["mě", "mně"], correct: "mně", why: "Zapomněl — sloveso je příbuzné se slovem pomněnka/mínit, píše se -mně-." },
  { text: "Te__ se rozezněl kostelní zvon.", options: ["mě", "mně"], correct: "mně", why: "Temně — příslovce od přídavného jména temný (temn- + -ě)." },
  { text: "Vysvětli mi to, prosím, rozu__.", options: ["mě", "mně"], correct: "mně", why: "Rozumně — od přídavného jména rozumný (rozumn- + -ě)." },
  { text: "Vůbec nerozu__l zadané otázce.", options: ["mě", "mně"], correct: "mě", why: "Nerozuměl — sloveso rozumět má v kořeni -mě-." },
  { text: "Koláč byl ještě teplý a __kký.", options: ["mě", "mně"], correct: "mě", why: "Měkký — v kořeni slova se píše -mě-." },
  { text: "Bydlí přímo v centru __sta.", options: ["mě", "mně"], correct: "mě", why: "Města — kořen slova město obsahuje -mě-." },
  { text: "Je__ se na nás usmál.", options: ["mě", "mně"], correct: "mně", why: "Jemně — od přídavného jména jemný (jemn- + -ě)." },
  { text: "Příje__ nás v hotelu přivítali.", options: ["mě", "mně"], correct: "mně", why: "Příjemně — od přídavného jména příjemný." },
  { text: "Celou skladbu u__l zpaměti.", options: ["mě", "mně"], correct: "mě", why: "Uměl — sloveso umět má v kořeni -mě-." },
  { text: "Připo__l mi, že máme schůzku.", options: ["mě", "mně"], correct: "mně", why: "Připomněl — příbuzné se slovem pomněnka, píše se -mně-." },
  { text: "Lékaři ob__vili nový způsob léčby.", options: ["bě", "bje"], correct: "bje", why: "Objevili — předpona ob- + kořen jev, proto -bje-." },
  { text: "V__zd do dvora byl zatarasený.", options: ["vě", "vje"], correct: "vje", why: "Vjezd — předpona v- + kořen jezd, proto -vje-." },
  { text: "Ob__d podávají od dvanácti hodin.", options: ["bě", "bje"], correct: "bě", why: "Oběd — nejde o předponu ob- + jed, píše se -bě-." },
  { text: "Napiš každou v__tu na nový řádek.", options: ["vě", "vje"], correct: "vě", why: "Věta — v kořeni slova se píše -vě-." },
];

/* ------------------------------------------------------------------ */
/* PRAVOPIS — interpunkce                                              */
/* ------------------------------------------------------------------ */

/** Ve které z možností je interpunkce doplněna SPRÁVNĚ? */
export const INTERPUNKCE: PickItem[] = [
  {
    options: [
      "Věděl, že přijde pozdě.",
      "Věděl že, přijde pozdě.",
      "Věděl že přijde, pozdě.",
      "Věděl, že, přijde pozdě.",
    ],
    correct: 0,
    why: "Čárka odděluje větu hlavní od vedlejší a píše se před spojkou že.",
  },
  {
    options: [
      "Když se setmělo rozsvítili jsme lampu.",
      "Když se setmělo, rozsvítili jsme lampu.",
      "Když, se setmělo rozsvítili jsme lampu.",
      "Když se setmělo rozsvítili, jsme lampu.",
    ],
    correct: 1,
    why: "Vedlejší věta příslovečná časová stojí před větou hlavní a odděluje se čárkou.",
  },
  {
    options: [
      "Koupil jsem chleba máslo a sýr.",
      "Koupil jsem chleba, máslo a sýr.",
      "Koupil jsem, chleba máslo a sýr.",
      "Koupil jsem chleba, máslo, a sýr.",
    ],
    correct: 1,
    why: "Ve výčtu se čárky píší mezi členy, ale ne před spojkou a v poměru slučovacím.",
  },
  {
    options: [
      "Nevím kdy se vrátí.",
      "Nevím kdy, se vrátí.",
      "Nevím, kdy se vrátí.",
      "Nevím, kdy, se vrátí.",
    ],
    correct: 2,
    why: "Před vedlejší větou uvozenou tázacím zájmenem kdy se píše čárka.",
  },
  {
    options: [
      "Byl unavený ale pokračoval v práci.",
      "Byl unavený, ale pokračoval v práci.",
      "Byl unavený ale, pokračoval v práci.",
      "Byl, unavený ale pokračoval v práci.",
    ],
    correct: 1,
    why: "Před spojkou ale (poměr odporovací) se píše čárka.",
  },
  {
    options: [
      "Petře podej mi tu knihu.",
      "Petře, podej mi tu knihu.",
      "Petře podej, mi tu knihu.",
      "Petře, podej mi, tu knihu.",
    ],
    correct: 1,
    why: "Oslovení se odděluje čárkou.",
  },
];

/* ------------------------------------------------------------------ */
/* SLOVNÍ ZÁSOBA                                                       */
/* ------------------------------------------------------------------ */

export const SYNONYMA: OneOfItem[] = [
  { q: "lstivý", correct: "prohnaný", wrong: ["odvážný", "laskavý", "hlučný"], why: "Lstivý i prohnaný znamenají „jednající s úskokem“." },
  { q: "zdráhat se", correct: "váhat", wrong: ["spěchat", "radovat se", "souhlasit"], why: "Zdráhat se = zdrženlivě váhat, nemít se k činu." },
  { q: "obezřetný", correct: "opatrný", wrong: ["bezstarostný", "ukvapený", "hlasitý"], why: "Obezřetný = jednající s rozvahou, opatrný." },
  { q: "neurvalý", correct: "hrubý", wrong: ["zdvořilý", "plachý", "veselý"], why: "Neurvalý = hrubý, bezohledný v chování." },
  { q: "svízelný", correct: "obtížný", wrong: ["snadný", "veselý", "krátký"], why: "Svízelný = spojený se svízelemi, obtížný." },
  { q: "pokořit", correct: "ponížit", wrong: ["povýšit", "pochválit", "podpořit"], why: "Pokořit = srazit něčí hrdost, ponížit." },
  { q: "zevrubný", correct: "podrobný", wrong: ["povrchní", "stručný", "nejasný"], why: "Zevrubný = do všech podrobností." },
  { q: "úsporný", correct: "hospodárný", wrong: ["marnotratný", "zdlouhavý", "hlučný"], why: "Úsporný = šetrný, hospodárný." },
  { q: "nevraživý", correct: "nepřátelský", wrong: ["vstřícný", "klidný", "zvědavý"], why: "Nevraživý = naplněný skrytou zlobou, nepřátelský." },
  { q: "rozmarný", correct: "náladový", wrong: ["spolehlivý", "vytrvalý", "tichý"], why: "Rozmarný = měnící nálady, vrtošivý." },
];

export const ANTONYMA: OneOfItem[] = [
  { q: "štědrý", correct: "lakomý", wrong: ["bohatý", "veselý", "moudrý"], why: "Opakem štědrosti je lakota." },
  { q: "všední", correct: "sváteční", wrong: ["obyčejný", "únavný", "krátký"], why: "Všední den × sváteční den." },
  { q: "mělký", correct: "hluboký", wrong: ["široký", "úzký", "kalný"], why: "Mělká × hluboká voda." },
  { q: "pokorný", correct: "pyšný", wrong: ["tichý", "slabý", "věrný"], why: "Pokora je opakem pýchy." },
  { q: "prostorný", correct: "stísněný", wrong: ["světlý", "vysoký", "čistý"], why: "Prostorná × stísněná místnost." },
  { q: "hojný", correct: "vzácný", wrong: ["drahý", "velký", "pěkný"], why: "Hojný výskyt × vzácný výskyt." },
  { q: "svěží", correct: "zvadlý", wrong: ["chladný", "mokrý", "zelený"], why: "Svěží × zvadlá květina." },
  { q: "zdlouhavý", correct: "rychlý", wrong: ["nudný", "těžký", "tichý"], why: "Zdlouhavý postup × rychlý postup." },
  { q: "vstřícný", correct: "odmítavý", wrong: ["mlčenlivý", "opatrný", "přísný"], why: "Vstřícný postoj × odmítavý postoj." },
  { q: "úrodný", correct: "neplodný", wrong: ["suchý", "rovný", "kamenitý"], why: "Úrodná × neplodná půda." },
];

export const TVORENI_SLOV: OneOfItem[] = [
  { q: "Které z uvedených slov vzniklo SKLÁDÁNÍM?", correct: "zeměpis", wrong: ["učitel", "lesník", "nábytek"], why: "Zeměpis vzniklo spojením dvou základů: země + psát." },
  { q: "Které z uvedených slov vzniklo SKLÁDÁNÍM?", correct: "dřevorubec", wrong: ["rybář", "školní", "přednáška"], why: "Dřevorubec = dřevo + rubat, jde o složeninu." },
  { q: "Které z uvedených slov vzniklo SKLÁDÁNÍM?", correct: "velkoměsto", wrong: ["městský", "domeček", "nádraží"], why: "Velkoměsto = velké + město, jde o složeninu." },
  { q: "Které z uvedených slov vzniklo ZKRACOVÁNÍM?", correct: "MHD", wrong: ["autobus", "jízdenka", "nástupiště"], why: "MHD je zkratka z názvu městská hromadná doprava." },
  { q: "Které z uvedených slov vzniklo ZKRACOVÁNÍM?", correct: "ČSAD", wrong: ["dopravce", "linkový", "spoj"], why: "ČSAD je iniciálová zkratka." },
  { q: "Které z uvedených slov vzniklo ODVOZOVÁNÍM?", correct: "lesník", wrong: ["vodopád", "zeměkoule", "ČR"], why: "Lesník vzniklo z podstatného jména les příponou -ník." },
  { q: "Které z uvedených slov vzniklo ODVOZOVÁNÍM?", correct: "přednáška", wrong: ["autoškola", "vlastivěda", "OSN"], why: "Přednáška vzniklo od slovesa přednášet příponou -ka." },
  { q: "Ve kterém slově je předpona?", correct: "nadchodem", wrong: ["nádoba", "nádech", "nádvoří"], why: "Nadchod = předpona nad- + kořen chod. (U ostatních jde o předponu ná-, ale kořen je jiný.)" },
];

export const RCENI: OneOfItem[] = [
  { q: "mít máslo na hlavě", correct: "mít sám něco na svědomí", wrong: ["být velmi unavený", "mít neupravený zevnějšek", "být lakomý"], why: "Rčení znamená, že ten, kdo druhého kritizuje, sám něco provedl." },
  { q: "házet flintu do žita", correct: "předčasně to vzdát", wrong: ["neuváženě střílet", "zbavit se nepotřebné věci", "schovat se před někým"], why: "Znamená vzdát se, přestat se snažit." },
  { q: "chodit kolem horké kaše", correct: "vyhýbat se podstatě věci", wrong: ["mít velký hlad", "chovat se opatrně u sporáku", "být netrpělivý"], why: "Znamená nemluvit o tom, oč skutečně jde." },
  { q: "dělat z komára velblouda", correct: "zveličovat malichernost", wrong: ["vymýšlet si nepravdy", "být velmi pomalý", "plést si podobné věci"], why: "Znamená přehánět význam něčeho nepodstatného." },
  { q: "mít hlavu v oblacích", correct: "být zasněný a nevnímat okolí", wrong: ["být domýšlivý", "být velmi vysoký", "mít závrať"], why: "Znamená být duchem nepřítomný." },
  { q: "vzít nohy na ramena", correct: "rychle utéct", wrong: ["vydat se na dlouhou cestu", "nést někoho na zádech", "protáhnout si svaly"], why: "Znamená dát se na útěk." },
  { q: "tlouct špačky", correct: "usínat vsedě", wrong: ["chovat se hlučně", "plašit ptáky", "marnit čas"], why: "Znamená klimbat, přemáhat se spánkem vsedě." },
  { q: "být v sedmém nebi", correct: "být velmi šťastný", wrong: ["být zcela vyčerpaný", "být daleko od domova", "být povýšený"], why: "Znamená prožívat velkou radost." },
  { q: "mít něco za lubem", correct: "chystat něco tajně", wrong: ["mít něco schované doma", "být na někoho rozzlobený", "dlužit někomu peníze"], why: "Znamená mít nějaký skrytý úmysl." },
  { q: "lít vodu do moře", correct: "dělat zbytečnou práci", wrong: ["plýtvat penězi", "pomáhat druhým", "mluvit bez rozmyslu"], why: "Znamená konat něco zcela marného." },
];

/* ------------------------------------------------------------------ */
/* TVAROSLOVÍ                                                          */
/* ------------------------------------------------------------------ */

export const SLOVNI_DRUHY: Array<{ sentence: string; word: string; correct: string; wrong: [string, string, string]; why: string }> = [
  { sentence: "Chlapec pomalu otevřel dveře.", word: "pomalu", correct: "příslovce", wrong: ["přídavné jméno", "částice", "spojka"], why: "Vyjadřuje způsob děje a ptáme se na ně otázkou jak." },
  { sentence: "Okolo domu rostly vzrostlé stromy.", word: "okolo", correct: "předložka", wrong: ["příslovce", "spojka", "částice"], why: "Stojí před podstatným jménem a pojí se s 2. pádem." },
  { sentence: "Přišel, ale hned zase odešel.", word: "ale", correct: "spojka", wrong: ["částice", "příslovce", "citoslovce"], why: "Spojuje dvě věty v poměru odporovacím." },
  { sentence: "Ach, to je ale krása!", word: "Ach", correct: "citoslovce", wrong: ["částice", "příslovce", "spojka"], why: "Vyjadřuje citový postoj mluvčího." },
  { sentence: "Rád tě zase vidím.", word: "tě", correct: "zájmeno", wrong: ["částice", "podstatné jméno", "příslovce"], why: "Zastupuje podstatné jméno — jde o osobní zájmeno ty ve 4. pádě." },
  { sentence: "Koupil si tři nové knihy.", word: "tři", correct: "číslovka", wrong: ["přídavné jméno", "zájmeno", "příslovce"], why: "Vyjadřuje počet, jde o číslovku základní." },
  { sentence: "Slunce zapadalo za les.", word: "Slunce", correct: "podstatné jméno", wrong: ["přídavné jméno", "zájmeno", "příslovce"], why: "Označuje samostatnou věc, skloňuje se." },
  { sentence: "Byl to velmi starý dům.", word: "starý", correct: "přídavné jméno", wrong: ["podstatné jméno", "příslovce", "zájmeno"], why: "Vyjadřuje vlastnost podstatného jména, ptáme se jaký." },
  { sentence: "Voda teče z kohoutku.", word: "teče", correct: "sloveso", wrong: ["podstatné jméno", "příslovce", "částice"], why: "Vyjadřuje děj, časuje se." },
  { sentence: "Prý se vrátí až v neděli.", word: "Prý", correct: "částice", wrong: ["příslovce", "spojka", "citoslovce"], why: "Uvozuje větu a vyjadřuje postoj mluvčího k jejímu obsahu." },
  { sentence: "Kniha ležela na stole.", word: "na", correct: "předložka", wrong: ["spojka", "částice", "příslovce"], why: "Pojí se s podstatným jménem v 6. pádě." },
  { sentence: "Náš dům stojí na kopci.", word: "Náš", correct: "zájmeno", wrong: ["přídavné jméno", "číslovka", "částice"], why: "Jde o zájmeno přivlastňovací." },
];

export const KATEGORIE: Array<{ sentence: string; word: string; correct: string; wrong: [string, string, string]; why: string }> = [
  { sentence: "Rozdali jsme dárky všem dětem.", word: "dětem", correct: "3. pád, číslo množné, rod ženský", wrong: ["4. pád, číslo množné, rod ženský", "3. pád, číslo množné, rod střední", "6. pád, číslo množné, rod ženský"], why: "Rozdali jsme komu, čemu → 3. pád. Dítě je rodu středního, ale v množném čísle se „děti“ skloňují jako rod ženský." },
  { sentence: "Bez bratra bych to nezvládl.", word: "bratra", correct: "2. pád, číslo jednotné, rod mužský životný", wrong: ["4. pád, číslo jednotné, rod mužský životný", "2. pád, číslo množné, rod mužský životný", "3. pád, číslo jednotné, rod mužský životný"], why: "Předložka bez se pojí s 2. pádem." },
  { sentence: "O prázdninách jsme byli u moře.", word: "moře", correct: "2. pád, číslo jednotné, rod střední", wrong: ["1. pád, číslo jednotné, rod střední", "4. pád, číslo množné, rod střední", "6. pád, číslo jednotné, rod střední"], why: "Předložka u se pojí s 2. pádem." },
  { sentence: "Napsal dopis své babičce.", word: "babičce", correct: "3. pád, číslo jednotné, rod ženský", wrong: ["6. pád, číslo jednotné, rod ženský", "2. pád, číslo jednotné, rod ženský", "4. pád, číslo jednotné, rod ženský"], why: "Napsal komu, čemu → 3. pád." },
  { sentence: "Vraceli se domů unavení.", word: "Vraceli se", correct: "3. osoba, číslo množné, čas minulý", wrong: ["3. osoba, číslo množné, čas přítomný", "1. osoba, číslo množné, čas minulý", "3. osoba, číslo jednotné, čas minulý"], why: "Tvar „vraceli se“ je minulý čas ve 3. osobě množného čísla." },
  { sentence: "Zítra pojedeme na výlet.", word: "pojedeme", correct: "1. osoba, číslo množné, čas budoucí", wrong: ["1. osoba, číslo množné, čas přítomný", "2. osoba, číslo množné, čas budoucí", "3. osoba, číslo množné, čas budoucí"], why: "Tvar „pojedeme“ vyjadřuje budoucnost v 1. osobě množného čísla." },
];

export const VZORY: OneOfItem[] = [
  { q: "chlapec", correct: "muž", wrong: ["pán", "stroj", "soudce"], why: "2. pád je „chlapce“ jako „muže“ — měkké skloňování, rod mužský životný." },
  { q: "hoch", correct: "pán", wrong: ["muž", "hrad", "předseda"], why: "2. pád je „hocha“ jako „pána“ — tvrdé skloňování." },
  { q: "nůž", correct: "stroj", wrong: ["muž", "hrad", "les"], why: "Rod mužský neživotný, 2. pád „nože“ — měkké skloňování jako stroj." },
  { q: "hrdina", correct: "předseda", wrong: ["pán", "muž", "soudce"], why: "Rod mužský životný zakončený na -a se skloňuje podle vzoru předseda." },
  { q: "vládce", correct: "soudce", wrong: ["muž", "předseda", "stroj"], why: "Rod mužský životný zakončený na -ce se skloňuje podle vzoru soudce." },
  { q: "země", correct: "růže", wrong: ["žena", "píseň", "kost"], why: "2. pád je „země“ — měkké skloňování jako růže." },
  { q: "dlaň", correct: "píseň", wrong: ["kost", "růže", "žena"], why: "2. pád je „dlaně“, 7. pád „dlaní“ — jako píseň." },
  { q: "radost", correct: "kost", wrong: ["píseň", "růže", "žena"], why: "Podstatná jména na -ost se skloňují podle vzoru kost." },
  { q: "nádraží", correct: "stavení", wrong: ["moře", "město", "kuře"], why: "Rod střední zakončený na -í se skloňuje podle vzoru stavení." },
  { q: "pole", correct: "moře", wrong: ["město", "stavení", "kuře"], why: "Rod střední zakončený na -e bez rozšíření kmene — vzor moře." },
  { q: "house", correct: "kuře", wrong: ["moře", "stavení", "město"], why: "2. pád je „house te“ → houseťi, rozšiřuje se o -et-, tedy vzor kuře." },
  { q: "koráb", correct: "hrad", wrong: ["pán", "les", "stroj"], why: "Rod mužský neživotný, 2. pád „korábu“ — vzor hrad." },
];

/** Ve které z možností je tvar utvořen NESPRÁVNĚ? */
export const TVARY_CHYBA: PickItem[] = [
  { options: ["se dvěma kamarády", "s oběma rodiči", "se dvouma psy", "bez čtyř dnů"], correct: 2, why: "Tvar „dvouma“ neexistuje, správně je „se dvěma psy“." },
  { options: ["abychom stihli vlak", "aby jsme stihli vlak", "kdybychom věděli", "bychom rádi přišli"], correct: 1, why: "Správný tvar je „abychom“, spojení „aby jsme“ je nespisovné." },
  { options: ["kdybyste přišli dřív", "kdyby jste přišli dřív", "byste se divili", "kdybych mohl"], correct: 1, why: "Správný tvar je „kdybyste“, nikoli „kdyby jste“." },
  { options: ["mohli bychom jít", "mohli by jsme jít", "chtěli bychom vědět", "šli bychom rádi"], correct: 1, why: "Správně je „mohli bychom“." },
  { options: ["dvě stě korun", "tři sta metrů", "pět set lidí", "dvě sta korun"], correct: 3, why: "Správně je „dvě stě“ — tvar „dvě sta“ je chybný." },
  { options: ["nejlepší z nich", "nejvíce oblíbený", "nejnejlepší", "nejzajímavější"], correct: 2, why: "Zdvojený stupeň „nejnejlepší“ je chybný." },
];

/* ------------------------------------------------------------------ */
/* SKLADBA                                                             */
/* ------------------------------------------------------------------ */

export const ZAKLADNI_DVOJICE: Array<{ sentence: string; podmet: string; podmetAccept: string[]; prisudek: string; prisudekAccept: string[]; why: string }> = [
  { sentence: "Starý dub na návsi se ve vichřici zlomil.", podmet: "dub", podmetAccept: ["starý dub"], prisudek: "zlomil se", prisudekAccept: ["zlomil", "se zlomil"], why: "Kdo, co se zlomil → dub (podmět). Přísudek je sloveso „zlomil se“." },
  { sentence: "Naši sousedé postavili na zahradě altán.", podmet: "sousedé", podmetAccept: ["naši sousedé"], prisudek: "postavili", prisudekAccept: [], why: "Kdo, co postavil → sousedé. Přísudek je „postavili“." },
  { sentence: "Do třídy vešel nový učitel matematiky.", podmet: "učitel", podmetAccept: ["nový učitel", "učitel matematiky"], prisudek: "vešel", prisudekAccept: [], why: "Kdo, co vešel → učitel. Přísudek je „vešel“." },
  { sentence: "Na obloze se rychle stahovaly tmavé mraky.", podmet: "mraky", podmetAccept: ["tmavé mraky"], prisudek: "stahovaly se", prisudekAccept: ["stahovaly", "se stahovaly"], why: "Kdo, co se stahovalo → mraky. Přísudek je „stahovaly se“." },
  { sentence: "Naše výprava dorazila na vrchol až za soumraku.", podmet: "výprava", podmetAccept: ["naše výprava"], prisudek: "dorazila", prisudekAccept: [], why: "Kdo, co dorazil → výprava. Přísudek je „dorazila“." },
  { sentence: "Malý chlapec u okna si prohlížel obrázkovou knihu.", podmet: "chlapec", podmetAccept: ["malý chlapec"], prisudek: "prohlížel si", prisudekAccept: ["prohlížel", "si prohlížel"], why: "Kdo, co si prohlížel → chlapec. Přísudek je „prohlížel si“." },
];

export const VETNE_CLENY: Array<{ sentence: string; word: string; correct: string; wrong: [string, string, string]; why: string }> = [
  { sentence: "Babička upekla vnoučatům jablečný závin.", word: "závin", correct: "předmět", wrong: ["podmět", "přívlastek", "příslovečné určení"], why: "Upekla koho, co → závin. Jde o předmět." },
  { sentence: "Babička upekla vnoučatům jablečný závin.", word: "jablečný", correct: "přívlastek", wrong: ["předmět", "doplněk", "příslovečné určení"], why: "Rozvíjí podstatné jméno závin, ptáme se jaký." },
  { sentence: "Vlak přijel na nádraží se zpožděním.", word: "na nádraží", correct: "příslovečné určení místa", wrong: ["předmět", "přívlastek", "příslovečné určení času"], why: "Přijel kam → na nádraží." },
  { sentence: "Od rána trpělivě čekali před obchodem.", word: "Od rána", correct: "příslovečné určení času", wrong: ["příslovečné určení místa", "předmět", "přívlastek"], why: "Čekali odkdy → od rána." },
  { sentence: "Sestra se vrátila domů unavená.", word: "unavená", correct: "doplněk", wrong: ["přívlastek", "předmět", "příslovečné určení"], why: "Vztahuje se zároveň k podmětu (sestra) i k přísudku (vrátila se)." },
  { sentence: "Studenti odevzdali učiteli své práce.", word: "učiteli", correct: "předmět", wrong: ["podmět", "přívlastek", "doplněk"], why: "Odevzdali komu, čemu → učiteli." },
];

export const SOUVETI: Array<{ sentence: string; pocet: number; druh: "souřadné" | "podřadné"; vedlejsi: string | null; why: string }> = [
  { sentence: "Když jsme dorazili na nádraží, vlak už odjel.", pocet: 2, druh: "podřadné", vedlejsi: "příslovečná časová", why: "Vedlejší věta uvozená spojkou když odpovídá na otázku kdy — je příslovečná časová." },
  { sentence: "Chtěl bych vědět, kdo tu knihu napsal.", pocet: 2, druh: "podřadné", vedlejsi: "předmětná", why: "Vedlejší věta zastupuje předmět: chtěl bych vědět co." },
  { sentence: "Sněžilo celou noc, a proto jsme ráno nikam nejeli.", pocet: 2, druh: "souřadné", vedlejsi: null, why: "Dvě věty hlavní spojené v poměru důsledkovém (a proto)." },
  { sentence: "Petr si přečetl zadání, ale úloze stejně nerozuměl.", pocet: 2, druh: "souřadné", vedlejsi: null, why: "Dvě věty hlavní v poměru odporovacím (ale)." },
  { sentence: "Dům, který stojí na kraji vsi, patří našim příbuzným.", pocet: 2, druh: "podřadné", vedlejsi: "přívlastková", why: "Vedlejší věta uvozená vztažným zájmenem který rozvíjí podstatné jméno dům." },
  { sentence: "Protože se setmělo, rozsvítili jsme v celém domě.", pocet: 2, druh: "podřadné", vedlejsi: "příslovečná příčinná", why: "Vedlejší věta uvozená spojkou protože odpovídá na otázku proč." },
  { sentence: "Nevěděli jsme, že se výlet ruší, a tak jsme přišli zbytečně.", pocet: 3, druh: "podřadné", vedlejsi: "předmětná", why: "Tři přísudky → tři věty. Vedlejší věta uvozená spojkou že zastupuje předmět." },
  { sentence: "Kdo chce kam, pomozme mu tam.", pocet: 2, druh: "podřadné", vedlejsi: "podmětná", why: "Vedlejší věta zastupuje podmět věty hlavní." },
];
