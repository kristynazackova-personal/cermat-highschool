/**
 * Výchozí texty pro úlohy na porozumění textu.
 *
 * Texty jsou původní (psané pro tento projekt), délkou i stavbou odpovídají
 * výchozím textům v testech Cermat. Ke každému textu patří sada otázek —
 * generátor z nich vybírá, nikdy je nesestavuje šablonou, aby nemohla
 * vzniknout otázka bez jednoznačné odpovědi.
 */

export type Passage = {
  id: string;
  title: string;
  text: string;
  /** Explicitně uvedená informace. */
  obsah: { q: string; correct: string; wrong: [string, string, string] };
  /** Tvrzení pro dichotomické úlohy — generátor jich vybírá tři. */
  tvrzeni: Array<{ text: string; truth: boolean; why: string }>;
  /** Hlavní myšlenka / záměr autora. */
  myslenka: { correct: string; wrong: [string, string, string] };
  /** Význam slova nebo spojení užitého v textu. */
  vyznam: { word: string; correct: string; wrong: [string, string, string] };
};

export const PASSAGES: Passage[] = [
  {
    id: "papir",
    title: "VÝCHOZÍ TEXT",
    text:
      "Papír, jak jej známe dnes, se zrodil v Číně na počátku druhého století našeho letopočtu. " +
      "Jeho vynález bývá připisován dvorskému úředníkovi Cchaj Lunovi, který rozvlákněné hadry, " +
      "kůru moruše a rybářské sítě svařil ve vodě a vzniklou kaši nabral na síto. Voda odtekla, " +
      "vlákna se spojila a po usušení zůstal tenký, pružný list.\n\n" +
      "Do Evropy se tato technologie dostala oklikou přes arabský svět a trvalo jí to bezmála " +
      "tisíc let. První evropské papírny vznikly ve Španělsku a v Itálii, kde brzy nahradily " +
      "drahý pergamen vyráběný ze zvířecí kůže. Teprve levný papír umožnil, aby se o tři staletí " +
      "později vyplatil Gutenbergův knihtisk — tisknout se totiž vyplatí jen tam, kde je na co tisknout.",
    obsah: {
      q: "Z čeho podle textu vyráběl Cchaj Lun papír?",
      correct: "Z rozvlákněných hadrů, kůry moruše a rybářských sítí.",
      wrong: [
        "Ze zvířecí kůže a rybářských sítí.",
        "Z dřevné hmoty a z kůry moruše.",
        "Z rozemletého pergamenu a z bavlny.",
      ],
    },
    tvrzeni: [
      { text: "Papír byl podle textu vynalezen v Číně.", truth: true, why: "První věta to uvádí přímo." },
      {
        text: "Do Evropy se výroba papíru dostala přímo z Číny během několika desetiletí.",
        truth: false,
        why: "Text říká, že se dostala oklikou přes arabský svět a trvalo to bezmála tisíc let.",
      },
      {
        text: "Pergamen byl dražší než papír.",
        truth: true,
        why: "Text uvádí, že papír nahradil drahý pergamen.",
      },
      {
        text: "Knihtisk vznikl dříve než první evropské papírny.",
        truth: false,
        why: "Knihtisk se objevil o tři staletí později než evropské papírny.",
      },
      {
        text: "Pergamen se vyráběl ze zvířecí kůže.",
        truth: true,
        why: "Text to uvádí v závorkovém upřesnění.",
      },
    ],
    myslenka: {
      correct: "Levný papír byl podmínkou, bez níž by se knihtisk neprosadil.",
      wrong: [
        "Čínští úředníci byli zručnější řemeslníci než evropští.",
        "Pergamen byl kvalitnější materiál než papír.",
        "Gutenberg převzal svůj vynález od arabských obchodníků.",
      ],
    },
    vyznam: {
      word: "oklikou",
      correct: "nepřímou, delší cestou",
      wrong: ["náhodou, bez záměru", "tajně, bez vědomí ostatních", "velmi rychle, bez zastávek"],
    },
  },
  {
    id: "ptaci",
    title: "VÝCHOZÍ TEXT",
    text:
      "Na podzim opouštějí naši krajinu miliony ptáků. Nejde o útěk před chladem — peří izoluje " +
      "spolehlivě a řada druhů by mráz přestála. Rozhodující je potrava. Jakmile zmizí hmyz, " +
      "ztrácejí lastovičky, rorýsi i pěnice důvod zůstávat.\n\n" +
      "Jak ptáci trefí cestu, kterou většina z nich nikdy neletěla? Orientují se podle polohy " +
      "slunce, v noci podle hvězd a nejspíš i podle magnetického pole Země. Mláďata mnoha druhů " +
      "odlétají dřív než rodiče, takže se cestu nemají od koho naučit — směr i vzdálenost mají " +
      "zapsané v dědičné výbavě.\n\n" +
      "Tažné trasy nejsou neměnné. S oteplováním zůstává část špačků a červenek přes zimu u nás " +
      "a některé druhy zkracují cestu o stovky kilometrů.",
    obsah: {
      q: "Co je podle textu hlavním důvodem podzimního odletu ptáků?",
      correct: "Nedostatek potravy.",
      wrong: [
        "Nízké teploty, které by nepřežili.",
        "Zkracující se délka dne.",
        "Nedostatek míst vhodných k hnízdění.",
      ],
    },
    tvrzeni: [
      {
        text: "Ptáci podle textu odlétají především proto, že jim vadí mráz.",
        truth: false,
        why: "Text výslovně říká, že nejde o útěk před chladem, ale o potravu.",
      },
      {
        text: "Mláďata některých druhů odlétají dříve než jejich rodiče.",
        truth: true,
        why: "Text to uvádí přímo.",
      },
      {
        text: "Ptáci se při letu orientují mimo jiné podle postavení slunce.",
        truth: true,
        why: "Text jmenuje slunce, hvězdy a magnetické pole Země.",
      },
      {
        text: "Tažné trasy ptáků se v čase nemění.",
        truth: false,
        why: "Poslední odstavec uvádí, že se trasy zkracují a část ptáků zůstává.",
      },
      {
        text: "Znalost trasy se mláďata učí od starších ptáků během letu.",
        truth: false,
        why: "Text říká, že se cestu nemají od koho naučit — mají ji v dědičné výbavě.",
      },
    ],
    myslenka: {
      correct: "Ptačí tah řídí dostupnost potravy a vrozená orientace, a v čase se proměňuje.",
      wrong: [
        "Ptáci odlétají na jih, protože nesnesou nízké teploty.",
        "Bez pomoci zkušených jedinců by mladí ptáci cestu nenašli.",
        "Oteplování ohrožuje přežití všech tažných druhů.",
      ],
    },
    vyznam: {
      word: "dědičná výbava",
      correct: "soubor vlastností zděděných po předcích",
      wrong: [
        "zkušenost získaná během prvního roku života",
        "zásoba tuku nashromážděná před odletem",
        "vybavení hnízda, které pták zdědí po rodičích",
      ],
    },
  },
  {
    id: "cokolada",
    title: "VÝCHOZÍ TEXT",
    text:
      "Kakaovník pochází ze Střední Ameriky a Mayové i Aztékové z jeho semen připravovali hořký " +
      "pěnivý nápoj, ochucený chilli a kukuřičnou moukou. Se sladkostí neměl nic společného; " +
      "podával se při obřadech a kakaové boby sloužily zároveň jako platidlo.\n\n" +
      "Do Španělska dorazilo kakao v šestnáctém století a dvorští kuchaři do něj přidali třtinový " +
      "cukr a skořici. Nápoj se stal výsadou šlechty — byl drahý a jeho příprava zdlouhavá. " +
      "Zlom přišel až roku 1828, kdy nizozemský chemik van Houten sestrojil lis, který ze semen " +
      "oddělil kakaové máslo. Vznikl prášek, jenž se snadno rozpouštěl, a o dvě desetiletí později " +
      "z něj bylo možné odlévat první tabulky.",
    obsah: {
      q: "Jak chutnal nápoj z kakaových semen u Mayů a Aztéků?",
      correct: "Hořce, byl ochucený chilli a kukuřičnou moukou.",
      wrong: [
        "Sladce, protože se do něj přidával třtinový cukr.",
        "Byl osladěný medem a ochucený skořicí.",
        "Neutrálně, pil se bez jakéhokoli koření.",
      ],
    },
    tvrzeni: [
      {
        text: "Kakaové boby sloužily ve Střední Americe také jako platidlo.",
        truth: true,
        why: "Text to uvádí v prvním odstavci.",
      },
      {
        text: "Cukr se do kakaa začal přidávat až ve Španělsku.",
        truth: true,
        why: "Dvorští kuchaři do něj přidali třtinový cukr a skořici.",
      },
      {
        text: "První tabulky čokolády vznikly ještě před sestrojením van Houtenova lisu.",
        truth: false,
        why: "Tabulky bylo možné odlévat až dvě desetiletí po roce 1828.",
      },
      {
        text: "Kakao bylo ve Španělsku dostupné všem vrstvám obyvatelstva.",
        truth: false,
        why: "Text říká, že šlo o výsadu šlechty.",
      },
      {
        text: "Van Houtenův lis odděloval ze semen kakaové máslo.",
        truth: true,
        why: "Text to uvádí přímo.",
      },
    ],
    myslenka: {
      correct: "Z obřadního hořkého nápoje se čokoláda stala běžnou sladkostí až díky technickému vynálezu.",
      wrong: [
        "Aztécká kuchyně předběhla evropskou o několik století.",
        "Čokoláda byla vždy především luxusním zbožím pro šlechtu.",
        "Nizozemsko bylo největším dovozcem kakaa v Evropě.",
      ],
    },
    vyznam: {
      word: "výsada",
      correct: "zvláštní právo či přednost, kterou ostatní nemají",
      wrong: ["povinnost uložená zákonem", "zvyk dodržovaný o svátcích", "vada, nedostatek"],
    },
  },
  {
    id: "spanek",
    title: "VÝCHOZÍ TEXT",
    text:
      "Dlouho se soudilo, že spánek je jen nečinná pauza. Měření mozkové aktivity ukázalo pravý " +
      "opak: mozek ve spánku pracuje, jen jinak. Střídají se fáze hlubokého spánku, kdy se tělo " +
      "regeneruje, s fázemi, při nichž se pod zavřenými víčky rychle pohybují oči. Právě v nich " +
      "se nám nejčastěji zdají sny.\n\n" +
      "Spánek má také funkci třídicí. Zážitky z uplynulého dne se během noci přesouvají do " +
      "dlouhodobé paměti a nepodstatné se odsouvají stranou. Žák, který se učí do dvou do rána, " +
      "proto paradoxně ztrácí — látku sice přečte, ale nedopřeje mozku čas ji uložit.\n\n" +
      "Dospívající potřebují podle výzkumů osm až deset hodin spánku, tedy víc než dospělí. " +
      "Jejich vnitřní hodiny se navíc posouvají k pozdějšímu usínání, což se s ranním začátkem " +
      "vyučování špatně snáší.",
    obsah: {
      q: "Kolik hodin spánku podle textu potřebují dospívající?",
      correct: "Osm až deset hodin.",
      wrong: ["Šest až osm hodin.", "Sedm hodin, stejně jako dospělí.", "Deset až dvanáct hodin."],
    },
    tvrzeni: [
      {
        text: "Mozek je během spánku podle textu zcela nečinný.",
        truth: false,
        why: "Text říká pravý opak — mozek pracuje, jen jinak.",
      },
      {
        text: "Během spánku se zážitky přesouvají do dlouhodobé paměti.",
        truth: true,
        why: "Text popisuje třídicí funkci spánku.",
      },
      {
        text: "Dospívající potřebují podle textu méně spánku než dospělí.",
        truth: false,
        why: "Text uvádí, že potřebují víc než dospělí.",
      },
      {
        text: "Učení do pozdních nočních hodin je podle textu málo účinné.",
        truth: true,
        why: "Text říká, že žák tím paradoxně ztrácí.",
      },
      {
        text: "Sny se nejčastěji zdají ve fázi, kdy se rychle pohybují oči.",
        truth: true,
        why: "Text to uvádí přímo.",
      },
    ],
    myslenka: {
      correct: "Spánek je aktivní děj, který je nezbytný pro paměť i regeneraci.",
      wrong: [
        "Vyučování by mělo začínat dřív, aby si žáci zvykli vstávat.",
        "Sny jsou nejdůležitější funkcí spánku.",
        "Dospělí spí kvalitněji než dospívající.",
      ],
    },
    vyznam: {
      word: "paradoxně",
      correct: "proti očekávání, zdánlivě protismyslně",
      wrong: ["zcela pochopitelně", "opakovaně, pravidelně", "s velkým úsilím"],
    },
  },
  {
    id: "mosty",
    title: "VÝCHOZÍ TEXT",
    text:
      "Kamenný most drží pohromadě bez malty i bez hřebíků. Tajemství je v oblouku: každý kámen " +
      "tlačí na sousední a celá klenba převádí tíhu do opěr po stranách. Čím větší zatížení, " +
      "tím pevněji do sebe kameny zapadají — most zesiluje tím, co by ho mělo zbořit.\n\n" +
      "Stavitelé proto klenbu vyzdívali na dřevěném skruži, dřevěné konstrukci, která oblouk držela, " +
      "dokud nebyl uzavřen posledním kamenem uprostřed. Teprve jeho osazení klenbu sevřelo a skruž " +
      "bylo možné odstranit. Právě ten okamžik býval nejnapínavější částí celé stavby.\n\n" +
      "Řada takto postavených mostů stojí dodnes, přestože je dnes přejíždějí vozidla mnohonásobně " +
      "těžší, než jaká si jejich stavitelé dokázali představit.",
    obsah: {
      q: "K čemu sloužila skruž?",
      correct: "Držela oblouk, dokud nebyl uzavřen posledním kamenem.",
      wrong: [
        "Spojovala jednotlivé kameny místo malty.",
        "Zpevňovala opěry mostu po stranách.",
        "Sloužila jako zábradlí během stavby.",
      ],
    },
    tvrzeni: [
      {
        text: "Kameny v klenbě jsou podle textu spojeny maltou.",
        truth: false,
        why: "Text říká, že most drží pohromadě bez malty i bez hřebíků.",
      },
      {
        text: "Větší zatížení klenbu podle textu zpevňuje.",
        truth: true,
        why: "Text uvádí, že kameny do sebe při zatížení zapadají pevněji.",
      },
      {
        text: "Skruž se odstraňovala až po osazení posledního kamene.",
        truth: true,
        why: "Text to popisuje v druhém odstavci.",
      },
      {
        text: "Kamenné mosty dnes již neunesou provoz moderních vozidel.",
        truth: false,
        why: "Poslední odstavec uvádí, že po nich jezdí i mnohem těžší vozidla.",
      },
      {
        text: "Klenba převádí tíhu do opěr po stranách mostu.",
        truth: true,
        why: "Text to uvádí přímo.",
      },
    ],
    myslenka: {
      correct: "Nosnost kamenného mostu plyne z geometrie oblouku, ne z pojiva mezi kameny.",
      wrong: [
        "Dřevěné skruže byly nejnáročnější částí stavby mostu.",
        "Moderní mosty jsou méně trvanlivé než kamenné.",
        "Středověcí stavitelé znali výpočty, které se používají dodnes.",
      ],
    },
    vyznam: {
      word: "osazení",
      correct: "usazení, umístění na určené místo",
      wrong: ["ozdobení povrchu", "očištění od nečistot", "změření rozměrů"],
    },
  },
  {
    id: "knihovny",
    title: "VÝCHOZÍ TEXT",
    text:
      "Když v Alexandrii zakládali nejslavnější knihovnu starověku, neměli její správci na práci " +
      "nic menšího než shromáždit všechny knihy světa. Lodě, které zakotvily v přístavu, musely " +
      "své svitky odevzdat k opsání; originál si knihovna často ponechala a majiteli vrátila kopii.\n\n" +
      "Svitky se tehdy neřadily podle abecedy — ta se jako pořádací princip prosadila mnohem " +
      "později. Učenec Kallimachos proto sestavil rozsáhlý soupis, v němž díla třídil podle oborů " +
      "a u každého uváděl autora, začátek textu a počet řádků. Vznikl tak vůbec první knihovní " +
      "katalog a s ním i profese, která z hromady svitků teprve dělá knihovnu.",
    obsah: {
      q: "Co musely podle textu udělat lodě, které zakotvily v alexandrijském přístavu?",
      correct: "Odevzdat své svitky k opsání.",
      wrong: [
        "Zaplatit poplatek určený na nákup knih.",
        "Vyložit svitky a prodat je knihovně.",
        "Nechat si svitky zapsat do katalogu.",
      ],
    },
    tvrzeni: [
      {
        text: "Knihovna si často ponechala originál a vrátila opis.",
        truth: true,
        why: "Text to uvádí přímo.",
      },
      {
        text: "Svitky byly v knihovně řazeny podle abecedy.",
        truth: false,
        why: "Text říká, že abeceda se jako pořádací princip prosadila mnohem později.",
      },
      {
        text: "Kallimachos u každého díla uváděl počet řádků.",
        truth: true,
        why: "Text jmenuje autora, začátek textu a počet řádků.",
      },
      {
        text: "Kallimachův soupis je označován za první knihovní katalog.",
        truth: true,
        why: "Poslední věta to uvádí.",
      },
      {
        text: "Alexandrijská knihovna shromažďovala pouze díla řeckých autorů.",
        truth: false,
        why: "Text mluví o záměru shromáždit všechny knihy světa.",
      },
    ],
    myslenka: {
      correct: "Sbírka se stává knihovnou teprve tím, že je uspořádaná a popsaná.",
      wrong: [
        "Alexandrijská knihovna byla největší stavbou starověku.",
        "Opisování knih bylo ve starověku výnosným řemeslem.",
        "Abecední řazení je jediný spolehlivý způsob třídění knih.",
      ],
    },
    vyznam: {
      word: "pořádací princip",
      correct: "pravidlo, podle něhož se věci řadí",
      wrong: [
        "úřední nařízení o provozu knihovny",
        "způsob uchovávání svitků před poškozením",
        "seznam osob oprávněných ke vstupu",
      ],
    },
  },
];

/** Souvislé texty rozstříhané na věty — pro úlohu na seřazení. */
export const ORDERED_TEXTS: Array<{ id: string; sentences: string[] }> = [
  {
    id: "kolo",
    sentences: [
      "První jízdní kolo nemělo pedály a jezdec se odrážel nohama od země.",
      "Pedály se objevily až o několik desetiletí později, a to rovnou na předním kole.",
      "Protože se přední kolo muselo otočit celé, zvětšovalo se, až dosáhlo výšky dospělého muže.",
      "Teprve vynález řetězu umožnil pohánět kolo zadní a obě kola zase zmenšit.",
      "Tím vznikl tvar bicyklu, který se od té doby v podstatě nezměnil.",
    ],
  },
  {
    id: "sopka",
    sentences: [
      "Pod zemskou kůrou se hromadí roztavená hornina zvaná magma.",
      "Je lehčí než okolní horniny, a proto stoupá vzhůru.",
      "Narazí-li na trhlinu, prorazí povrch a vylije se ven.",
      "Na povrchu se magmatu říká láva a rychle tuhne.",
      "Postupným vrstvením ztuhlé lávy vzniká sopečný kužel.",
    ],
  },
  {
    id: "dopis",
    sentences: [
      "Dopis nejprve putuje ze schránky na sběrnou poštu.",
      "Tam jej třídicí stroj přečte a rozdělí podle poštovního směrovacího čísla.",
      "V noci pak zásilky cestují k poště, která je nejblíž adresátovi.",
      "Ráno si je doručovatel rozdělí podle ulic do svého obvodu.",
      "Poslední metry urazí dopis pěšky a skončí ve schránce adresáta.",
    ],
  },
  {
    id: "chleba",
    sentences: [
      "Pekař smíchá mouku, vodu, sůl a kvásek v hladké těsto.",
      "Těsto pak nechá několik hodin odpočívat v teple.",
      "Kvasinky během té doby uvolňují bublinky plynu, a těsto proto kyne.",
      "V rozpálené peci se bublinky roztáhnou a těsto se nadzvedne.",
      "Povrch mezitím ztmavne a vytvoří se křupavá kůrka.",
    ],
  },
];
