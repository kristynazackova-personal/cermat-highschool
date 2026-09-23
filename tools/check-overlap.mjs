/**
 * Kontrola, že se v bankách generátoru neobjevuje text převzatý doslova
 * ze skutečných zadání Cermatu.
 *
 * Sešity samy v repozitáři NEJSOU a být nemají — jsou předmětem autorských
 * práv CZVV. Kontrola proto čeká, že si je vedle sebe připravíš jako prostý
 * text: každý PDF převeď a slož do jednoho souboru, jehož cestu předáš
 * proměnnou CORPUS.
 *
 *   CORPUS=/cesta/k/korpus.txt npm run check:overlap
 *
 * Bez korpusu kontrola nic netvrdí a skončí s vysvětlením — mlčky projít
 * by bylo horší než nespustit se vůbec.
 */
import { readFileSync, existsSync } from "node:fs";

const corpusPath = process.env.CORPUS;
if (!corpusPath || !existsSync(corpusPath)) {
  console.log(
    "Kontrola nespuštěna: chybí korpus skutečných zadání.\n" +
      "Nastav CORPUS=/cesta/k/souboru.txt s textem sešitů (v repozitáři nejsou\n" +
      "a nebudou — jsou předmětem autorských práv CZVV).",
  );
  process.exit(0);
}

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[ \s]+/g, " ")
    .replace(/[„“"'’‘]/g, "")
    .replace(/[–—−]/g, "-")
    .trim();

const corpus = norm(readFileSync(corpusPath, "utf8"));

const files = [
  "src/lib/cermat/czech/texts.ts",
  "src/lib/cermat/czech/lexicon.ts",
  "src/lib/cermat/czech/literature.ts",
  "src/lib/cermat/czech/banks2.ts",
  "src/lib/cermat/czech/texty2.ts",
  "src/lib/cermat/czech/generators.ts",
  "src/lib/cermat/math/generators.ts",
  "src/lib/cermat/flashcards.ts",
];

/**
 * Mluvnické termíny a ustálená záhlaví se shodovat MUSÍ — jde o názvosloví
 * a formát, ne o převzatý text. Kdyby se tenhle seznam rozrůstal, je to
 * signál, že se do bank znovu dostal cizí obsah.
 */
const ALLOWED = [
  "příslovečné určení",
  "příslovečné určení místa",
  "příslovečné určení času",
  "příslovečná příčinná",
  "výchozí text k úloze",
  "výchozí text a obrázek k úloze",
  "v cm délku strany ab obdélníku abcd,",
].map(norm);

const hits = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/"((?:[^"\\]|\\.){18,})"/g)) {
    for (const part of m[1].split(/\\n/)) {
      const n = norm(part);
      if (n.length < 18 || ALLOWED.includes(n)) continue;
      if (corpus.includes(n)) hits.push({ f, s: part.trim() });
    }
  }
}

const seen = new Set();
const uniq = hits.filter((h) => !seen.has(h.s) && seen.add(h.s));

if (uniq.length === 0) {
  console.log("✓ Žádná doslovná shoda se skutečnými zadáními.");
  process.exit(0);
}
console.error(`✗ Doslovných shod: ${uniq.length}`);
for (const h of uniq) console.error(`  ${h.f.split("/").pop()} :: ${h.s}`);
process.exit(1);
