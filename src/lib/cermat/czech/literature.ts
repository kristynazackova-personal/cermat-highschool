/** Banky pro literární výchovu a pro komunikačně-slohovou oblast. */

export type OneOfItem = {
  q: string;
  correct: string;
  wrong: [string, string, string];
  why: string;
};

/* ------------------------------------------------------------------ */
/* Literární druhy                                                     */
/* ------------------------------------------------------------------ */

export const LIT_DRUHY: Array<{ ukazka: string; correct: string; wrong: [string, string, string]; why: string }> = [
  {
    ukazka:
      "MATKA: A kdes byl celou tu dobu?\n" +
      "SYN (odkládá kabát): U řeky. Musel jsem si to promyslet.\n" +
      "MATKA: Promyslet! Zatímco tady všichni čekáme.",
    correct: "drama",
    wrong: ["próza", "poezie", "epika ve verších"],
    why: "Text je psán formou replik uvozených jmény postav a doplněných scénickou poznámkou v závorce — to je stavba dramatu.",
  },
  {
    ukazka:
      "Na kopci stojí bílý dům,\n" +
      "okna má stále dokořán,\n" +
      "a vítr nosí dovnitř šum\n" +
      "z dalekých luk a cizích stran.",
    correct: "poezie",
    wrong: ["próza", "drama", "publicistika"],
    why: "Text je členěn na verše a užívá rým — jde o poezii.",
  },
  {
    ukazka:
      "Vyšel před dům a chvíli stál. Vzduch byl studený a nehybný, jako by i on čekal, " +
      "až se někdo odhodlá udělat první krok. Pak zvedl tašku a vydal se dolů k silnici.",
    correct: "próza",
    wrong: ["poezie", "drama", "lyrika"],
    why: "Souvislý text bez veršů a bez replik postav — jde o prózu.",
  },
];

/* ------------------------------------------------------------------ */
/* Literární žánry                                                     */
/* ------------------------------------------------------------------ */

export const ZANRY: OneOfItem[] = [
  { q: "Krátký příběh, v němž vystupují zvířata s lidskými vlastnostmi a který vyúsťuje v ponaučení.", correct: "bajka", wrong: ["pohádka", "pověst", "povídka"], why: "Zvířecí postavy a závěrečné mravní ponaučení jsou znaky bajky." },
  { q: "Vyprávění s nadpřirozenými prvky, v němž dobro vítězí nad zlem a jehož děj není vázán na konkrétní místo ani dobu.", correct: "pohádka", wrong: ["pověst", "bajka", "legenda"], why: "Neurčitý čas a místo plus vítězství dobra jsou znaky pohádky." },
  { q: "Vyprávění vázané ke konkrétnímu místu nebo historické události, jehož jádro bývá pokládáno za pravdivé.", correct: "pověst", wrong: ["pohádka", "mýtus", "bajka"], why: "Vazba na skutečné místo či událost odlišuje pověst od pohádky." },
  { q: "Báseň s pochmurným, rychle spějícím dějem, který zpravidla končí tragicky.", correct: "balada", wrong: ["romance", "óda", "elegie"], why: "Ponurý děj a tragický závěr jsou znaky balady." },
  { q: "Rozsáhlé prozaické dílo s více dějovými liniemi a širokým okruhem postav.", correct: "román", wrong: ["novela", "povídka", "črta"], why: "Rozsah a více dějových linií odlišují román od kratších próz." },
  { q: "Kratší próza s jedinou dějovou linií, sevřenou stavbou a nečekaným zvratem v závěru.", correct: "novela", wrong: ["román", "bajka", "pověst"], why: "Sevřený děj a překvapivý závěr jsou znaky novely." },
  { q: "Dramatický žánr s humorným dějem a smírným koncem.", correct: "komedie", wrong: ["tragédie", "balada", "fraška"], why: "Humorný děj a šťastné rozuzlení odpovídají komedii." },
  { q: "Dramatický žánr, v němž hlavní hrdina podléhá v nerovném zápase a zpravidla hyne.", correct: "tragédie", wrong: ["komedie", "balada", "epos"], why: "Nevyhnutelný pád hrdiny je znakem tragédie." },
  { q: "Vyprávění o životě, skutcích a zázracích světce.", correct: "legenda", wrong: ["mýtus", "pověst", "kronika"], why: "Světec jako hlavní postava odlišuje legendu od pověsti." },
  { q: "Vyprávění o bozích a o vzniku světa, které vysvětluje jeho řád.", correct: "mýtus", wrong: ["legenda", "pověst", "pohádka"], why: "Bohové a výklad vzniku světa jsou znaky mýtu." },
];

/* ------------------------------------------------------------------ */
/* Jazykové prostředky (tropy a figury)                                */
/* ------------------------------------------------------------------ */

export const TROPY: Array<{ ukazka: string; correct: string; wrong: [string, string, string]; why: string }> = [
  { ukazka: "Slunce se smálo na celý kraj.", correct: "personifikace", wrong: ["přirovnání", "metonymie", "nadsázka"], why: "Neživé věci (slunci) je přisouzena lidská vlastnost — smát se." },
  { ukazka: "Byl silný jako medvěd.", correct: "přirovnání", wrong: ["metafora", "personifikace", "nadsázka"], why: "Dvě věci jsou srovnány pomocí spojky jako." },
  { ukazka: "Nad loukou se vlnilo moře trávy.", correct: "metafora", wrong: ["přirovnání", "metonymie", "personifikace"], why: "Tráva je pojmenována jako moře na základě vnější podobnosti, bez spojky jako." },
  { ukazka: "Čekal jsem na tebe celou věčnost.", correct: "nadsázka", wrong: ["metafora", "přirovnání", "metonymie"], why: "Úmyslné zveličení skutečnosti (hyperbola)." },
  { ukazka: "Přečetl jsem celého Čapka.", correct: "metonymie", wrong: ["metafora", "přirovnání", "personifikace"], why: "Jméno autora zastupuje jeho dílo — jde o záměnu na základě věcné souvislosti." },
  { ukazka: "Vítr si pohrával se spadaným listím.", correct: "personifikace", wrong: ["metafora", "nadsázka", "přirovnání"], why: "Větru je přisouzena lidská činnost — pohrávat si." },
  { ukazka: "Měla oči jako dvě studánky.", correct: "přirovnání", wrong: ["metafora", "personifikace", "metonymie"], why: "Srovnání pomocí spojky jako." },
  { ukazka: "Na obloze hořely hvězdy.", correct: "metafora", wrong: ["personifikace", "přirovnání", "metonymie"], why: "Svit hvězd je pojmenován slovesem hořet na základě podobnosti." },
];

/* ------------------------------------------------------------------ */
/* Rým                                                                 */
/* ------------------------------------------------------------------ */

export const RYMY: Array<{ ukazka: string; correct: string; wrong: [string, string, string]; why: string }> = [
  {
    ukazka: "Za oknem tiše padá sníh,\nutichl v domě dětský smích,\njen stará lampa v okně plá\na noc je dlouhá, noc je zlá.",
    correct: "sdružený (AABB)",
    wrong: ["střídavý (ABAB)", "obkročný (ABBA)", "přerývaný (ABCB)"],
    why: "Rýmují se vždy dva sousední verše: sníh–smích, plá–zlá.",
  },
  {
    ukazka: "Pod mostem plyne temná řeka,\nna břehu někdo tiše čeká,\naž ráno vyjde první svit\na bude zase možné jít.",
    correct: "sdružený (AABB)",
    wrong: ["střídavý (ABAB)", "obkročný (ABBA)", "přerývaný (ABCB)"],
    why: "Rýmují se dvojice sousedních veršů: řeka–čeká, svit–jít.",
  },
  {
    ukazka: "Na louce zraje vonný květ,\nu cesty stojí starý strom,\na nad tím vším se klene svět\na v dálce duní letní hrom.",
    correct: "střídavý (ABAB)",
    wrong: ["sdružený (AABB)", "obkročný (ABBA)", "přerývaný (ABCB)"],
    why: "Rýmuje se první verš se třetím (květ–svět) a druhý se čtvrtým (strom–hrom).",
  },
  {
    ukazka: "Nad polem krouží černý pták,\nna cestě šustí suchý list,\na podzim vchází do vrat tak,\nže nikdo není ničím jist.",
    correct: "střídavý (ABAB)",
    wrong: ["sdružený (AABB)", "obkročný (ABBA)", "přerývaný (ABCB)"],
    why: "Rýmují se verše 1 a 3 (pták–tak) a verše 2 a 4 (list–jist).",
  },
  {
    ukazka: "Když večer padne na zahradu,\nutichnou ptáci ve větvích\na jenom vítr nese smích\npřes ztichlou trávu do sadu.",
    correct: "obkročný (ABBA)",
    wrong: ["sdružený (AABB)", "střídavý (ABAB)", "přerývaný (ABCB)"],
    why: "Krajní verše se rýmují spolu (zahradu–sadu) a vnitřní dvojice také (větvích–smích).",
  },
  {
    ukazka: "Za lesem dozněl deště hlas,\nmokrá je tráva, mokrý mech\na ve vzduchu je cítit dech\nté chvíle, co se vrací zas.",
    correct: "obkročný (ABBA)",
    wrong: ["sdružený (AABB)", "střídavý (ABAB)", "přerývaný (ABCB)"],
    why: "První a čtvrtý verš se rýmují (hlas–zas), druhý a třetí rovněž (mech–dech).",
  },
];

/* ------------------------------------------------------------------ */
/* Literární pojmy                                                     */
/* ------------------------------------------------------------------ */

export const LIT_POJMY: OneOfItem[] = [
  { q: "lyrický subjekt", correct: "ten, kdo v básni promlouvá", wrong: ["hlavní postava prózy", "autor díla jako skutečná osoba", "adresát, k němuž se báseň obrací"], why: "Lyrický subjekt je vnitrotextový mluvčí, není totožný s autorem." },
  { q: "pointa", correct: "překvapivé vyvrcholení na konci textu", wrong: ["úvodní část vyprávění", "popis prostředí děje", "shrnutí hlavní myšlenky na začátku"], why: "Pointa je závěrečný zvrat, k němuž text směřuje." },
  { q: "verš", correct: "jeden řádek básně", wrong: ["skupina řádků oddělená mezerou", "závěrečná část básně", "opakující se zvuková shoda na konci řádků"], why: "Verš je základní jednotka básnického textu — jeden řádek." },
  { q: "sloka", correct: "skupina veršů oddělená od ostatních mezerou", wrong: ["jeden řádek básně", "zvuková shoda konců veršů", "úvod básnické skladby"], why: "Sloka (strofa) sdružuje několik veršů do celku." },
  { q: "monolog", correct: "souvislá promluva jediné postavy", wrong: ["rozhovor dvou postav", "poznámka autora o dění na jevišti", "vyprávění v 1. osobě"], why: "V monologu mluví jedna postava bez odpovědi druhé." },
  { q: "scénická poznámka", correct: "pokyn autora k jednání postav a k výpravě", wrong: ["replika vedlejší postavy", "shrnutí děje před jednáním", "věnování na začátku hry"], why: "Scénická poznámka stojí mimo repliky a řídí inscenaci." },
  { q: "vypravěč", correct: "ten, kdo v prozaickém textu podává děj", wrong: ["postava, o níž se vypráví", "autor jako skutečná osoba", "čtenář, jemuž je text určen"], why: "Vypravěč je textová instance, která děj zprostředkovává." },
  { q: "zápletka", correct: "situace, z níž se rozvíjí konflikt a děj", wrong: ["závěrečné rozuzlení", "popis hlavní postavy", "prostředí, v němž se děj odehrává"], why: "Zápletka uvádí do pohybu vlastní děj díla." },
];

/* ------------------------------------------------------------------ */
/* Funkční styly                                                       */
/* ------------------------------------------------------------------ */

export const STYLY: Array<{ ukazka: string; correct: string; wrong: [string, string, string]; why: string }> = [
  {
    ukazka: "Ahoj, nezapomeň zítra přinést tu knížku. Sejdeme se v pět před školou, ať to stihneme.",
    correct: "prostěsdělovací",
    wrong: ["odborný", "publicistický", "administrativní"],
    why: "Běžné soukromé sdělení, hovorové prostředky, jednoduchá stavba vět.",
  },
  {
    ukazka:
      "Fotosyntéza je děj, při němž zelené rostliny za přítomnosti světelného záření přeměňují " +
      "oxid uhličitý a vodu na glukózu a kyslík.",
    correct: "odborný",
    wrong: ["prostěsdělovací", "umělecký", "publicistický"],
    why: "Odborné názvosloví, věcnost, žádné citové zabarvení.",
  },
  {
    ukazka:
      "Také letos přilákal festival do města tisíce návštěvníků. Podle pořadatelů jde o vůbec " +
      "nejvyšší návštěvnost v jeho historii.",
    correct: "publicistický",
    wrong: ["odborný", "administrativní", "umělecký"],
    why: "Zpravodajské sdělení o aktuální události, odkaz na zdroj informace.",
  },
  {
    ukazka:
      "Žádám o uvolnění svého syna z vyučování dne 15. 3. z rodinných důvodů. " +
      "Předem děkuji za kladné vyřízení mé žádosti.",
    correct: "administrativní",
    wrong: ["prostěsdělovací", "publicistický", "odborný"],
    why: "Ustálené obraty, neosobní věcný tón, úřední účel sdělení.",
  },
  {
    ukazka:
      "Nad střechami se rozlévalo šedivé ráno a v úzkých ulicích ještě spal poslední zbytek noci.",
    correct: "umělecký",
    wrong: ["publicistický", "odborný", "prostěsdělovací"],
    why: "Obrazná pojmenování a estetická funkce sdělení.",
  },
];

/* ------------------------------------------------------------------ */
/* Slohové útvary                                                      */
/* ------------------------------------------------------------------ */

export const UTVARY: Array<{ ukazka: string; correct: string; wrong: [string, string, string]; why: string }> = [
  {
    ukazka:
      "Narodila jsem se roku 2010 v Brně. Po absolvování základní školy jsem nastoupila " +
      "na gymnázium, kde se věnuji zejména přírodním vědám.",
    correct: "životopis",
    wrong: ["charakteristika", "vypravování", "úvaha"],
    why: "Chronologický přehled údajů o vlastním životě.",
  },
  {
    ukazka:
      "Sháním použité horské kolo velikosti 26 palců, ideálně s kotoučovými brzdami. " +
      "Nabídky posílejte na uvedený kontakt.",
    correct: "inzerát",
    wrong: ["oznámení", "žádost", "zpráva"],
    why: "Krátký veřejný text nabízející nebo poptávající zboží či službu.",
  },
  {
    ukazka:
      "Nejprve jsme se dlouho nemohli rozhodnout. Pak Honza vykřikl, že vidí kouř, a všichni " +
      "jsme se rozběhli k hájovně. To, co jsme za ní našli, nikdo z nás nečekal.",
    correct: "vypravování",
    wrong: ["popis", "úvaha", "výklad"],
    why: "Text podává souvislý děj se zápletkou a napětím, užívá minulý čas a přímou řeč.",
  },
  {
    ukazka:
      "Přístroj má válcovité tělo z leštěné oceli. V horní části je umístěn ovládací panel " +
      "se třemi tlačítky, na levém boku je zásuvka pro napájecí kabel.",
    correct: "popis",
    wrong: ["vypravování", "charakteristika", "zpráva"],
    why: "Text vypočítává části a jejich uspořádání, neobsahuje děj.",
  },
  {
    ukazka:
      "Má-li mít vzdělání smysl, nestačí si zapamatovat fakta. Otázkou zůstává, zda dnešní " +
      "škola dokáže učit i to, jak s nimi zacházet.",
    correct: "úvaha",
    wrong: ["výklad", "popis", "zpráva"],
    why: "Autor zvažuje problém, klade otázky a hledá odpověď, nepodává jen fakta.",
  },
  {
    ukazka:
      "Ve čtvrtek 12. června se v aule školy uskuteční setkání s absolventy. Začátek je " +
      "v 17 hodin, vstup je volný.",
    correct: "oznámení",
    wrong: ["zpráva", "inzerát", "žádost"],
    why: "Sděluje se chystaná událost s uvedením místa a času — jde o oznámení (na rozdíl od zprávy, která informuje o tom, co už proběhlo).",
  },
];
