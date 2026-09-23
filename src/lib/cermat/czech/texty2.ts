/**
 * Souvislé texty pro úlohu na seřazení.
 *
 * Texty s hledanými slovy (pravopisné chyby, nespisovná slova) se
 * přestěhovaly do `texty-sloty.ts` — tam se místa vybírají, tady se
 * jen míchá pořadí částí.
 */

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
