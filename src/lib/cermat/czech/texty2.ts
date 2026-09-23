/**
 * Texty pro úlohy typu „najděte ve výchozím textu N slov“.
 *
 * Každý text je psán tak, aby v něm byl PŘESNĚ uvedený počet hledaných
 * slov a nic dalšího zadání nevyhovovalo — jinak by úloha neměla
 * jednoznačné řešení. Proto se tyhle texty negenerují, ale píší ručně.
 */

export type ChybovyText = {
  id: string;
  text: string;
  /** Hledaná slova ve správném zápisu, ve tvaru, v jakém stojí v textu. */
  spravne: string[];
  /** Co je na kterém slově špatně — do komentovaného řešení. */
  why: string[];
};

/** Texty se čtyřmi pravopisnými chybami (v sešitu úloha 18, 4 body). */
export const TEXTY_S_CHYBAMI: ChybovyText[] = [
  {
    id: "hrad",
    text:
      "Nedaleko města leží sřícenina hradu, kterou každoročně navštíví tisíce turistů. " +
      "Hrad byl zbudován ve třináctém století a jeho zdi odolali mnoha obléháním. " +
      "Dnes se zde konají koncerty, na které přijíždějí návštěvníci z celé země.\n\n" +
      "Správci areálu v posledních letech opravili hradní kapli i obvodové zdi. " +
      "V podhradí virostlo informační středisko, kde si lze zapůjčit audioprůvodce. " +
      "Děti tu najdou naučnou stezku s úkoly, které je seznámý s historií místa.",
    spravne: ["zřícenina", "odolaly", "vyrostlo", "seznámí"],
    why: [
      "zřícenina — předpona z- (ne s-), jde o změnu stavu",
      "odolaly — podmět „zdi“ je rodu ženského, přísudek má koncovku -y",
      "vyrostlo — předpona vy- se píše s ypsilon",
      "seznámí — sloveso ve 3. osobě čísla množného, koncovka -í",
    ],
  },
  {
    id: "obec",
    text:
      "Obec Lipová se rozkládá v mělkém údolí na okraji chráněné krajinné oblasti. " +
      "Žije zde necelích šest set obivatel a většina z nich pracuje v nedalekém městě. " +
      "Uprostřed návsi stojí kaple z osmnáctého století.\n\n" +
      "V létě sem míří turisté, který obdivují okolní lesy a ribníky. " +
      "Obecní úřad nechal loni opravit cyklostezku, takže se sem dá pohodlně dojet i na kole. " +
      "Místní spolky pořádají několikrát do roka slavnosti, na nichž vystupují dětské soubory.",
    spravne: ["necelých", "obyvatel", "kteří", "rybníky"],
    why: [
      "necelých — v koncovce přídavného jména tvrdého se píše -ých",
      "obyvatel — slovo je příbuzné se slovesem být, píše se s ypsilon",
      "kteří — vztažné zájmeno se shoduje s podstatným jménem „turisté“ (rod mužský životný)",
      "rybníky — ryba je vyjmenované slovo po r",
    ],
  },
  {
    id: "knihovna",
    text:
      "Nová knihovna vznikla v budově staré školy. Architekti zachovali původní klenby " +
      "a doplnili je prosklenou přístavbou. Ve čtenářském sále se dnes scházý studenti i senioři.\n\n" +
      "Fond čítá přes dvacet tisíc svazků a každý měsíc přibívají další. " +
      "Knihovnice loni pomáhali čtenářům vyhledávat literaturu a pravidelně pořádaly besedy " +
      "se spisovately. Děti mají vlastní oddělení s koberci, na nichž si mohou v klidu číst.",
    spravne: ["schází", "přibývají", "pomáhaly", "spisovateli"],
    why: [
      "schází — sloveso ve 3. osobě čísla množného, koncovka -í",
      "přibývají — předpona při- + kořen s ypsilon (býv- od být)",
      "pomáhaly — podmět „knihovnice“ je rodu ženského, přísudek má koncovku -y",
      "spisovateli — 7. pád množného čísla podle vzoru muž zní „spisovateli“",
    ],
  },
  {
    id: "slavnost",
    text:
      "Zahradní slavnost se konala v parku u zámku. Návštěvníci mohli ochutnat místní " +
      "speciality a poslechnout si dechovou hudbu. Pořadatelé připravyli také dílny pro děti.\n\n" +
      "Počasí přálo, a tak se na trávníku sešli celé rodiny. Prodejci nabízely výrobky " +
      "z keramiky i ručně šité hračky. Vítěžek z prodeje vstupenek poputuje na opravu " +
      "zámecké oranžerie, která je dlouhá léta zavřená.",
    spravne: ["připravili", "sešly", "nabízeli", "výtěžek"],
    why: [
      "připravili — podmět „pořadatelé“ je rodu mužského životného, koncovka -i",
      "sešly — podmět „rodiny“ je rodu ženského, koncovka -y",
      "nabízeli — podmět „prodejci“ je rodu mužského životného, koncovka -i",
      "výtěžek — předpona vý- se píše s ypsilon a délkou",
    ],
  },
];

/** Texty, v nichž jsou přesně dvě nespisovná slova (v sešitu úloha 9, 2 body). */
export const TEXTY_S_NESPISOVNYMI: ChybovyText[] = [
  {
    id: "skola",
    text:
      "Ráno jsem zaspal, a tak jsem do školy přiběhl na poslední chvíli. " +
      "První hodinu jsme psali písemku z angliny. " +
      "Po vyučování jsem zašel za otcem do kanclu pro klíče od bytu.",
    spravne: ["angliny", "kanclu"],
    why: [
      "angliny — spisovně „angličtiny“, jde o slangový výraz",
      "kanclu — spisovně „kanceláře“, jde o slangový výraz",
    ],
  },
  {
    id: "vylet",
    text:
      "O víkendu jsme jeli k babičce na chalupu. " +
      "Bráchu jsem přemluvil, aby vzal foťák, protože jsem chtěl vyfotit západ slunce nad rybníkem. " +
      "Cestou zpátky jsme se stavili na zmrzlinu.",
    spravne: ["Bráchu", "foťák"],
    why: [
      "Bráchu — spisovně „bratra“, jde o nespisovný výraz",
      "foťák — spisovně „fotoaparát“, jde o nespisovný výraz",
    ],
  },
  {
    id: "zkouska",
    text:
      "Před zkouškou jsem tři dny šprtal slovíčka. " +
      "Ségra mi z nich večer dávala otázky a opravovala mi výslovnost. " +
      "Ráno jsem byl nervózní, ale nakonec všechno dopadlo dobře.",
    spravne: ["šprtal", "Ségra"],
    why: [
      "šprtal — spisovně „učil se nazpaměť“, jde o slangový výraz",
      "Ségra — spisovně „sestra“, jde o nespisovný výraz",
    ],
  },
  {
    id: "rozhledna",
    text:
      "V sobotu jsme s kamarády vyrazili na výlet. " +
      "V batohu jsem měl flašku vody a dva rohlíky. " +
      "Bylo hezky, a tak jsme cestou pořídili pár snímků foťákem, který mi půjčil otec.",
    spravne: ["flašku", "foťákem"],
    why: [
      "flašku — spisovně „láhev“, jde o nespisovný výraz",
      "foťákem — spisovně „fotoaparátem“, jde o nespisovný výraz",
    ],
  },
];

/** Souvislé texty rozstříhané na ŠEST částí — pro úlohu na seřazení (3 body). */
export const SERAZENI_TEXTY: Array<{ id: string; parts: string[]; zdroj: string }> = [
  {
    id: "kolo",
    zdroj: "podle historie dopravních prostředků",
    parts: [
      "První jízdní kolo nemělo pedály ani řetěz a jezdec se odrážel nohama přímo od země.",
      "Pedály se objevily až o několik desetiletí později, a to rovnou na předním kole.",
      "Protože se přední kolo muselo při každém šlápnutí otočit celé, začalo se zvětšovat.",
      "Nakonec dosáhlo takové výšky, že na stroj bylo možné nasednout jen z vyvýšeného místa.",
      "Teprve vynález řetězu umožnil pohánět kolo zadní, a obě kola se proto mohla zase zmenšit.",
      "Tím vznikl tvar bicyklu, který se od té doby v podstatě nezměnil.",
    ],
  },
  {
    id: "sopka",
    zdroj: "podle učebnice přírodopisu",
    parts: [
      "Hluboko pod zemskou kůrou se hromadí roztavená hornina zvaná magma.",
      "Je lehčí než okolní horniny, a proto pomalu stoupá vzhůru.",
      "Narazí-li přitom na trhlinu, prorazí povrch a vylije se ven.",
      "Na povrchu se magmatu říká láva a ve styku se vzduchem rychle tuhne.",
      "Postupným vrstvením ztuhlé lávy vzniká kolem kráteru sopečný kužel.",
      "Po tisících let se tak z nenápadné pukliny stane hora vysoká stovky metrů.",
    ],
  },
  {
    id: "dopis",
    zdroj: "podle informací České pošty",
    parts: [
      "Dopis putuje ze schránky nejprve na sběrnou poštu.",
      "Tam jej třídicí stroj přečte a rozdělí podle poštovního směrovacího čísla.",
      "V noci pak zásilky cestují k poště, která je nejblíž adresátovi.",
      "Ráno si je doručovatel rozdělí podle ulic do svého obvodu.",
      "Poslední metry urazí dopis pěšky v doručovatelské brašně.",
      "Skončí ve schránce adresáta, obvykle druhý den po odeslání.",
    ],
  },
  {
    id: "chleba",
    zdroj: "podle příručky pro domácí pekaře",
    parts: [
      "Pekař nejprve smíchá mouku, vodu, sůl a kvásek v hladké těsto.",
      "Hotové těsto pak nechá několik hodin odpočívat na teplém místě.",
      "Kvasinky během té doby uvolňují bublinky plynu, a těsto proto viditelně kyne.",
      "V rozpálené peci se bublinky roztáhnou a bochník se nadzvedne.",
      "Povrch mezitím ztmavne a vytvoří se na něm křupavá kůrka.",
      "Upečený chléb se nechá vychladnout, jinak by se při krájení mazal.",
    ],
  },
];
