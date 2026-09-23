/**
 * Přepíše db/001_init.sql podle SCHEMA_SQL v kódu.
 *
 * Schéma má jediný zdroj (src/lib/server/schema.ts), protože ho aplikace
 * sama zakládá při prvním připojení. Soubor .sql je jen jeho opis pro ruční
 * spuštění a pro kontroly, které si zakládají databázi nanečisto.
 */
import { readFileSync, writeFileSync } from "node:fs";

const zdroj = readFileSync("src/lib/server/schema.ts", "utf8");
// Kotvíme se na deklaraci, ne na první zpětný apostrof — v komentáři nad ní
// jsou taky, a hledání „prvního“ by ukrojilo kus komentáře do SQL.
const ZNACKA = "export const SCHEMA_SQL = `";
const zacatek = zdroj.indexOf(ZNACKA);
const konec = zdroj.lastIndexOf("`;");
if (zacatek < 0 || konec <= zacatek) {
  console.error("V schema.ts se nepodařilo najít řetězec se schématem.");
  process.exit(1);
}
writeFileSync("db/001_init.sql", zdroj.slice(zacatek + ZNACKA.length, konec));
console.log("db/001_init.sql zapsán podle src/lib/server/schema.ts");
