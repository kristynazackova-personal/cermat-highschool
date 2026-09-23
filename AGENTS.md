# Cermat generátor — poznámky pro agenty

## Next.js
Tento projekt běží na Next.js 16 (App Router, Turbopack, React 19).
API a konvence se liší od starších verzí — před psaním kódu si přečti
příslušnou kapitolu v `node_modules/next/dist/docs/`.

## Architektura generátoru
- `src/lib/cermat/spec.ts` je **jediný zdroj pravdy** o parametrech zkoušky
  (délka, počet úloh, body, tematické okruhy, plán testu). Když se změní
  specifikace požadavků Cermatu, mění se tento soubor — ne generátory.
- Generátory jsou **čisté funkce** semínka (`Rng`). Stejné semínko = stejný
  test. Žádné volání AI, žádná síť, žádný klíč.
- Matematika počítá **přesně** přes `Frac` (zlomková aritmetika). Nikdy
  neodvozuj správnou odpověď z výpočtu v plovoucí čárce.
- Čeština staví na kurátorovaných bankách (`czech/lexicon.ts`) — náhodně se
  vybírá a míchá, nikdy se negeneruje jazykový obsah šablonou, která by mohla
  vyrobit nesprávný tvar.
- `npm test` ověří, že plán sedí na parametry zkoušky a že tisíce
  vygenerovaných testů mají konzistentní body a jednoznačné odpovědi.
