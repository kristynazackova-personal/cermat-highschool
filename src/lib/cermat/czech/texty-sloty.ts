/**
 * Texty k úlohám „najděte ve výchozím textu N slov“, psané s místy.
 *
 * Zápis míst a důvod, proč to takhle je, popisuje `sloty.ts`. Každý text
 * nabízí víc míst, než kolik jich zadání hledá — generátor vybere jen
 * část, takže se v témž textu hledají pokaždé jiná slova.
 *
 * Mimo vybraná místa musí být text bez chyby a bez nespisovného slova,
 * jinak by úloha neměla jednoznačné řešení. Obě znění každého místa se
 * proto píší tak, aby se do věty dala vložit beze změny okolí.
 */

import type { SlotText } from "./sloty";

/** Texty s pravopisnými chybami — v sešitu úloha 18, hledají se 4 slova. */
export const TEXTY_S_CHYBAMI: SlotText[] = [
  {
    id: "hrad",
    odpovedZe: "mimo",
    text:
      "Nedaleko města leží {zřícenina|sřícenina|zřícenina — předpona z- vyjadřuje změnu stavu} " +
      "hradu, kterou každoročně navštíví tisíce turistů. Hrad byl zbudován ve třináctém " +
      "století a jeho zdi {odolaly|odolali|odolaly — podmět „zdi“ je rodu ženského, přísudek má koncovku -y} " +
      "mnoha obléháním. Dnes se zde konají koncerty, na " +
      "{které|kteří|které — „koncerty“ jsou rodu mužského neživotného, zájmeno má koncovku -é} " +
      "přijíždějí návštěvníci z celé země.\n\n" +
      "Správci areálu v posledních letech " +
      "{opravili|opravily|opravili — podmět „správci“ je rodu mužského životného, přísudek má koncovku -i} " +
      "hradní kapli i obvodové zdi. V podhradí " +
      "{vyrostlo|virostlo|vyrostlo — předpona vy- se píše s ypsilon} " +
      "informační středisko, kde si lze zapůjčit " +
      "{audioprůvodce|audioprúvodce|audioprůvodce — uvnitř slova se píše kroužkované ů}. " +
      "Děti tu najdou naučnou stezku s " +
      "{úkoly|úkoli|úkoly — 7. pád množného čísla vzoru hrad má koncovku -y}, které je " +
      "{seznámí|seznámý|seznámí — sloveso ve 3. osobě čísla množného má v koncovce měkké í} " +
      "s historií místa.",
  },
  {
    id: "obec",
    odpovedZe: "mimo",
    text:
      "Obec Lipová se rozkládá v " +
      "{mělkém|mnělkém|mělkém — po m se v tomto slově píše mě, nikoli mně} " +
      "údolí na okraji chráněné krajinné oblasti. Žije zde " +
      "{necelých|necelích|necelých — tvrdé přídavné jméno má v koncovce -ých} " +
      "šest set " +
      "{obyvatel|obivatel|obyvatel — slovo je příbuzné se slovesem být, píše se s ypsilon} " +
      "a většina z nich pracuje v nedalekém městě. Uprostřed návsi stojí kaple " +
      "z osmnáctého století.\n\n" +
      "Na okraji obce stojí {mlýn|mlín|mlýn — mlýn je vyjmenované slovo po m}, který " +
      "{býval|bíval|býval — odvozeno od slovesa být, píše se s ypsilon} " +
      "v provozu ještě po válce. V létě sem míří turisté, " +
      "{kteří|který|kteří — zájmeno se shoduje s podstatným jménem „turisté“, rod mužský životný} " +
      "obdivují okolní lesy a " +
      "{rybníky|ribníky|rybníky — ryba je vyjmenované slovo po r}. Obecní " +
      "{úřad|ůřad|úřad — na začátku slova se píše ú s čárkou} " +
      "nechal loni opravit cyklostezku, takže se sem dá pohodlně dojet i na kole.",
  },
  {
    id: "knihovna",
    odpovedZe: "mimo",
    text:
      "Nová knihovna vznikla v budově staré školy. Architekti " +
      "{zachovali|zachovaly|zachovali — podmět „architekti“ je rodu mužského životného, přísudek má koncovku -i} " +
      "původní klenby a doplnili je prosklenou přístavbou. Ve čtenářském sále se dnes " +
      "{schází|scházý|schází — sloveso vzoru sází má v koncovce měkké í} " +
      "studenti i senioři.\n\n" +
      "Fond čítá přes dvacet tisíc svazků a každý měsíc " +
      "{přibývají|přibívají|přibývají — kořen je odvozen od slovesa být, píše se s ypsilon} " +
      "další. V " +
      "{půjčovně|pújčovně|půjčovně — uvnitř slova se píše kroužkované ů} " +
      "si lze rezervovat i " +
      "{cizojazyčné|cyzojazyčné|cizojazyčné — po c se píše měkké i} " +
      "tituly. Knihovnice loni " +
      "{pomáhaly|pomáhali|pomáhaly — podmět „knihovnice“ je rodu ženského, přísudek má koncovku -y} " +
      "čtenářům vyhledávat literaturu a pravidelně pořádaly besedy se " +
      "{spisovateli|spisovately|spisovateli — 7. pád množného čísla vzoru muž zní spisovateli}. " +
      "Děti mají vlastní oddělení s " +
      "{koberci|kobercy|koberci — 7. pád množného čísla vzoru stroj má koncovku -i}, " +
      "na nichž si mohou v klidu číst.",
  },
  {
    id: "slavnost",
    odpovedZe: "mimo",
    text:
      "Zahradní slavnost se konala v parku u zámku. Do " +
      "{příprav|přýprav|příprav — po ř se píše měkké i} " +
      "se zapojili i " +
      "{žáci|žácy|žáci — po c se píše měkké i} " +
      "místní školy. Návštěvníci mohli ochutnat místní speciality a poslechnout si " +
      "dechovou hudbu. Pořadatelé " +
      "{připravili|připravyli|připravili — podmět „pořadatelé“ je rodu mužského životného, přísudek má koncovku -i} " +
      "také dílny pro děti.\n\n" +
      "Počasí přálo, a tak se na trávníku " +
      "{sešly|sešli|sešly — podmět „rodiny“ je rodu ženského, přísudek má koncovku -y} " +
      "celé rodiny. Prodejci " +
      "{nabízeli|nabízely|nabízeli — podmět „prodejci“ je rodu mužského životného, přísudek má koncovku -i} " +
      "{výrobky|vírobky|výrobky — předpona vý- se píše s ypsilon a s délkou} " +
      "z keramiky i ručně " +
      "{šité|šyté|šité — po š se píše měkké i} " +
      "hračky. " +
      "{Výtěžek|Vítěžek|Výtěžek — předpona vý- se píše s ypsilon a s délkou} " +
      "z prodeje vstupenek poputuje na opravu zámecké oranžerie, která je dlouhá léta zavřená.",
  },
];

/** Texty s nespisovnými slovy — v sešitu úloha 9, hledají se 2 slova. */
export const TEXTY_S_NESPISOVNYMI: SlotText[] = [
  {
    id: "skola",
    odpovedZe: "vybrano",
    text:
      "Ráno jsem zaspal, a tak jsem do školy přiběhl na poslední chvíli. " +
      "První hodinu jsme psali písemku z " +
      "{angličtiny|angliny|angliny — spisovně angličtiny, jde o slangový výraz}. " +
      "Druhou hodinu jsme měli místo " +
      "{tělocviku|tělaku|tělaku — spisovně tělocviku, jde o slangový výraz} " +
      "suplování. Po vyučování jsem zašel za " +
      "{otcem|fotrem|fotrem — spisovně otcem, jde o nespisovný výraz} " +
      "do " +
      "{kanceláře|kanclu|kanclu — spisovně kanceláře, jde o slangový výraz} " +
      "pro klíče od " +
      "{bytu|kvartýru|kvartýru — spisovně bytu, jde o nespisovný výraz}. " +
      "Na zítřek se ještě musím připravit z " +
      "{matematiky|matiky|matiky — spisovně matematiky, jde o slangový výraz}.",
  },
  {
    id: "vylet",
    odpovedZe: "vybrano",
    text:
      "O víkendu jsme jeli k babičce na chalupu. " +
      "{Bratra|Bráchu|Bráchu — spisovně bratra, jde o nespisovný výraz} " +
      "jsem přemluvil, aby vzal " +
      "{fotoaparát|foťák|foťák — spisovně fotoaparát, jde o nespisovný výraz}, " +
      "protože jsem chtěl vyfotit západ slunce nad rybníkem. Otec zůstal doma, " +
      "protože byl " +
      "{nemocný|marod|marod — spisovně nemocný, jde o nespisovný výraz}. " +
      "V tašce jsem měl " +
      "{svačinu|svačku|svačku — spisovně svačinu, jde o nespisovný výraz} " +
      "a nějaké " +
      "{peníze|prachy|prachy — spisovně peníze, jde o nespisovný výraz}. " +
      "Cestou zpátky jsme se zastavili na " +
      "{zmrzlinu|zmrzku|zmrzku — spisovně zmrzlinu, jde o slangový výraz}.",
  },
  {
    id: "zkouska",
    odpovedZe: "vybrano",
    text:
      "Před zkouškou jsem tři dny " +
      "{opakoval|šprtal|šprtal — spisovně například opakoval, jde o slangový výraz} " +
      "slovíčka. Poznámky jsem si předtím přepsal v " +
      "{počítači|kompu|kompu — spisovně počítači, jde o slangový výraz} " +
      "a nastudoval jsem jich " +
      "{hodně|fůru|fůru — spisovně hodně, jde o nespisovný výraz}. " +
      "{Sestra|Ségra|Ségra — spisovně sestra, jde o nespisovný výraz} " +
      "mi z nich večer dávala otázky a opravovala mi výslovnost. Ráno nás " +
      "{učitel|kantor|kantor — spisovně učitel, jde o nespisovný výraz} " +
      "rozsadil a já byl nervózní, ale nakonec všechno dopadlo " +
      "{dobře|super|super — spisovně například dobře, jde o nespisovný výraz}.",
  },
  {
    id: "rozhledna",
    odpovedZe: "vybrano",
    text:
      "V sobotu jsme s " +
      "{kamarády|kámoši|kámoši — spisovně kamarády, jde o nespisovný výraz} " +
      "vyrazili na výlet. V batohu jsem měl " +
      "{láhev|flašku|flašku — spisovně láhev, jde o nespisovný výraz} " +
      "vody a dva rohlíky. Bylo hezky, a tak jsme cestou pořídili pár snímků " +
      "{fotoaparátem|foťákem|foťákem — spisovně fotoaparátem, jde o nespisovný výraz}, " +
      "který mi půjčil otec.\n\n" +
      "Na vrcholu jsme si dali " +
      "{svačinu|svačku|svačku — spisovně svačinu, jde o nespisovný výraz} " +
      "a dlouho se dívali do kraje. Zpátky jsme pak šli " +
      "{rychle|fofrem|fofrem — spisovně rychle, jde o nespisovný výraz}, " +
      "protože se stmívalo. Domů jsme se vrátili " +
      "{unavení|zničení|zničení — spisovně unavení, jde o expresivní nespisovný výraz}, " +
      "ale spokojení.",
  },
];
