/**
 * Texty se zaměnitelnými místy.
 *
 * Úlohy „najděte v textu N slov“ byly dlouho nejslabším místem generátoru:
 * text měl chyby napsané napevno, takže čtyři texty znamenaly čtyři podoby
 * úlohy. Kdo si pamatoval, že v textu o hradu se hledá „zřícenina“, měl
 * hotovo, aniž by text četl.
 *
 * Text se proto píše s VÍC místy, než kolik se jich hledá. Každé místo má
 * dvě znění: to, které v textu stojí, když se místo nevybere, a to, které
 * v něm stojí, když se vybere. Generátor vybere tolik míst, kolik zadání
 * žádá; zbytek textu je bez chyby. Ze čtyř textů o osmi místech je tak
 * 4 × C(8, 4) = 280 různých zadání a zapamatovaná odpověď nepomůže.
 *
 * Zápis v textu: {mimo|vybráno|vysvětlení}
 */

import type { Rng } from "../rng";

export type SlotText = {
  id: string;
  /** Text se zápisem míst; mimo místa je to obyčejný text. */
  text: string;
  /**
   * Odkud se bere odpověď žáka. U pravopisu se hledá chyba a píše se tvar
   * správný (`mimo`), u nespisovných slov se vypisuje slovo tak, jak
   * v textu stojí (`vybrano`).
   */
  odpovedZe: "mimo" | "vybrano";
};

type Slot = { mimo: string; vybrano: string; why: string };
type Segment = string | Slot;

/** Rozdělí text na obyčejné úseky a místa. */
export function parseSlots(text: string): Segment[] {
  const out: Segment[] = [];
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf("{", i);
    if (open < 0) {
      out.push(text.slice(i));
      break;
    }
    if (open > i) out.push(text.slice(i, open));
    const close = text.indexOf("}", open);
    if (close < 0) throw new Error(`neuzavřené místo v textu: ${text.slice(open, open + 40)}`);
    const parts = text.slice(open + 1, close).split("|");
    if (parts.length !== 3) {
      throw new Error(`místo musí mít tři části {mimo|vybráno|vysvětlení}: ${text.slice(open, close + 1)}`);
    }
    out.push({ mimo: parts[0], vybrano: parts[1], why: parts[2] });
    i = close + 1;
  }
  return out;
}

/** Kolik míst text nabízí. */
export function slotCount(text: string): number {
  return parseSlots(text).filter((s): s is Slot => typeof s !== "string").length;
}

/**
 * Vybere `n` míst, sestaví text a vrátí hledaná slova v pořadí, v jakém
 * v textu stojí — komentované řešení je pak čitelné odshora dolů.
 */
export function renderSlots(
  rng: Rng,
  src: SlotText,
  n: number,
): { text: string; hledana: string[]; why: string[] } {
  const segments = parseSlots(src.text);
  const indexes = segments.flatMap((s, i) => (typeof s === "string" ? [] : [i]));
  if (indexes.length < n) {
    throw new Error(`text „${src.id}“ nabízí ${indexes.length} míst, zadání jich žádá ${n}`);
  }
  const chosen = new Set(rng.sample(indexes, n));

  let text = "";
  const hledana: string[] = [];
  const why: string[] = [];
  segments.forEach((s, i) => {
    if (typeof s === "string") {
      text += s;
      return;
    }
    const vybrano = chosen.has(i);
    text += vybrano ? s.vybrano : s.mimo;
    if (vybrano) {
      hledana.push(src.odpovedZe === "mimo" ? s.mimo : s.vybrano);
      why.push(s.why);
    }
  });
  return { text, hledana, why };
}
