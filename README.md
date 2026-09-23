# Přijímačky nanečisto

Generátor cvičných testů k **jednotné přijímací zkoušce (JPZ / „Cermat“)** na
čtyřleté obory středních škol. Jedno kliknutí vygeneruje celý nový test
z matematiky nebo z českého jazyka a literatury — se stejnou stavbou, stejným
rozložením typů úloh a stejným bodováním, jaké má skutečná zkouška.

## Proč

Skutečných testů z minulých let je konečný počet. Po pár průchodech si je žák
spíš pamatuje, než počítá. Tady se test skládá znovu při každém kliknutí:
jiná čísla, jiné věty, jiné pořadí nabídek.

## Podle čeho se testy generují

Parametry zkoušky drží **`src/lib/cermat/spec.ts`** — je to jediný zdroj pravdy.
Plán testu je odvozený ze **skutečných testových sešitů a klíčů správných
řešení JPZ 2026**: čtyř forem z matematiky (M9A–M9D) a tří z českého jazyka
(C9A–C9C). Rozbor, proti kterému se dá plán ověřit, je v `docs/`:

- [`docs/JPZ_M9A_2026_T1.md`](docs/JPZ_M9A_2026_T1.md) — matematika
- [`docs/JPZ_C9_2026.md`](docs/JPZ_C9_2026.md) — český jazyk a literatura

Obsah zkoušky vymezuje *Specifikace požadavků* vydávaná Cermatem, která se
opírá o vzdělávací obory *Český jazyk a literatura* a *Matematika a její
aplikace* podle RVP ZV.

### Hodnocení není všude lineární

Klíče Cermatu používají tři různá pravidla, která generátor přesně
napodobuje — a která by se z běžného popisu zkoušky nedala uhodnout:

- **dichotomická skupina A/N** — vše správně → plný počet, jedna chyba →
  polovina, jinak nula;
- **„vypište N slov“** — body = max(0, N − chyby), přičemž chybou je i slovo,
  které zadání nevyhovuje, takže tipovat naslepo se nevyplácí;
- **seřazení částí textu** — body jen za celé správné pořadí.

| | Matematika | Český jazyk a literatura |
|---|---|---|
| Čas | 70 minut | 60 minut |
| Úloh | 16 | 30 |
| Bodů | 50 | 50 |
| Okruhy | Číslo a proměnná · Závislosti, vztahy a práce s daty · Geometrie v rovině a v prostoru · Nestandardní aplikační úlohy | Porozumění textu · Komunikační a slohová výchova · Pravopis · Slovní zásoba a tvoření slov · Tvarosloví · Skladba · Literární výchova |

Soubor kromě toho obsahuje **plán testu** — co je na které pozici, jakého je to
typu a za kolik bodů — a odkazy na oficiální zdroje. Změní-li Cermat specifikaci,
mění se tenhle soubor; generátory z něj čtou.

## Jak to funguje

- **Bez AI a bez serveru.** Test se skládá v prohlížeči z generátorů napsaných
  na míru každému typu úlohy. Žádný API klíč, žádné náklady, žádná latence.
- **Deterministicky.** Celý test je funkcí jediného semínka. V adrese je krátký
  kód — stejný kód vždy vrátí tentýž test, takže jde odkaz sdílet nebo se
  k testu vrátit.
- **Matematika počítá přesně.** Veškerá aritmetika běží přes zlomkovou třídu
  `Frac`, takže správný výsledek nikdy nevznikne zaokrouhlením. Geometrické
  úlohy si samy kreslí okótovaný obrázek jako inline SVG.
- **Čeština se negeneruje šablonou.** Všechny věty, ukázky a nabídky jsou předem
  ověřené položky v `src/lib/cermat/czech/`; generátor z nich vybírá a míchá
  pořadí. Šablona by v češtině snadno vyrobila neexistující tvar nebo otázku
  s víc než jednou správnou odpovědí.

## Kontrola

```bash
npm test
```

Ověří na 4 000 vygenerovaných testech, že plán sedí na parametry zkoušky, body
podúloh se sečtou na dotaci úlohy, každá uzavřená úloha má právě jednu správnou
možnost v nabídce, vzorové řešení projde vyhodnocením na plný počet bodů a týž
výchozí text se v jednom testu neobjeví dvakrát. Rozsah se dá zvětšit:
`RUNS=20000 npm test`.

## Vývoj

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Next.js 16 (App Router), React 19, Tailwind 4. Celý web je staticky
předgenerovaný — nasadí se kamkoli.

## Struktura

```
src/lib/cermat/
  spec.ts              parametry zkoušky, okruhy, plán testu, zdroje
  build.ts             sestavení testu ze semínka + vyhodnocení
  rng.ts               deterministický generátor náhodných čísel
  selftest.ts          kontrola (npm test)
  math/
    helpers.ts         zlomková aritmetika, český zápis čísel, porovnání odpovědí
    generators.ts      16 generátorů úloh z matematiky
  czech/
    texts.ts           výchozí texty k úlohám na porozumění
    lexicon.ts         jazykové banky (pravopis, tvarosloví, skladba, slovní zásoba)
    literature.ts      literární výchova a funkční styly
    generators.ts      30 generátorů úloh z češtiny
src/app/               Next.js stránky
```

## Co generátor neumí

Konstrukční úlohy z geometrie se rýsují na papír — web u nich ukáže vzorový
postup i bodování a body si žák přizná sám. Otevřené úlohy s delší odpovědí
zastupuje komentovaný postup řešení.

## Upozornění

Neoficiální cvičná pomůcka. **Nejde o zadání Cermatu** ani o materiál jím
schválený. Skutečná zadání z minulých let i závazné znění specifikace jsou na
[prijimacky.cermat.cz](https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf.html).
