import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'fs';
const file = process.argv[2];
const doc = await getDocument({ data: new Uint8Array(readFileSync(file)), useSystemFonts: true }).promise;
console.log(`### ${file.split('/').pop()} — ${doc.numPages} stran`);
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const tc = await page.getTextContent();
  // seskupit podle řádků podle y-souřadnice
  const lines = new Map();
  for (const it of tc.items) {
    if (!it.str) continue;
    const y = Math.round(it.transform[5] / 2.2) * 2.2;
    if (!lines.has(y)) lines.set(y, []);
    lines.get(y).push({ x: it.transform[4], s: it.str });
  }
  const out = [...lines.entries()].sort((a, b) => b[0] - a[0])
    .map(([, arr]) => arr.sort((a, b) => a.x - b.x).map(o => o.s).join('').replace(/\s+/g, ' ').trim())
    .filter(Boolean).join('\n');
  console.log(`\n----- strana ${i} -----\n${out}`);
}
