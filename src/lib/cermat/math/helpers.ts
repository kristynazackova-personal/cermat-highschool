/** Pomocné funkce pro generátory matematiky. */

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/** Přesná zlomková aritmetika — generátory nesmí počítat v plovoucí čárce. */
export class Frac {
  readonly num: number;
  readonly den: number;

  constructor(num: number, den = 1) {
    if (den === 0) throw new Error("dělení nulou");
    const sign = den < 0 ? -1 : 1;
    const g = gcd(num, den);
    this.num = (sign * num) / g;
    this.den = (sign * den) / g;
  }

  add(o: Frac) {
    return new Frac(this.num * o.den + o.num * this.den, this.den * o.den);
  }
  sub(o: Frac) {
    return new Frac(this.num * o.den - o.num * this.den, this.den * o.den);
  }
  mul(o: Frac) {
    return new Frac(this.num * o.num, this.den * o.den);
  }
  div(o: Frac) {
    return new Frac(this.num * o.den, this.den * o.num);
  }
  get isInt() {
    return this.den === 1;
  }
  get value() {
    return this.num / this.den;
  }
  /** Zápis "a/b", u celého čísla jen číslo. */
  toString() {
    return this.den === 1 ? String(this.num) : `${this.num}/${this.den}`;
  }
  /** Desetinný zápis s čárkou, pokud je ukončený. */
  toDecimal(maxDigits = 4): string | null {
    let d = this.den;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    if (d !== 1) return null;
    const s = (this.num / this.den).toFixed(maxDigits).replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",");
  }
}

/** Číslo v českém zápisu — desetinná čárka, mezera jako oddělovač tisíců. */
export function cz(n: number, digits = 2): string {
  const rounded = Number(n.toFixed(digits));
  const s = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
  const [whole, frac] = s.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return frac ? `${grouped},${frac}` : grouped;
}

/**
 * Sjednotí zápis odpovědi, aby "3,5", "3.5" a " 3,5 cm" byly totéž.
 * Zlomky se převádějí na desetinné číslo, jde-li to přesně.
 */
export function normalizeAnswer(raw: string): string {
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    // typografické minus a pomlčky sjednotit na obyčejný spojovník, jinak by
    // se „−1/4“ opsané ze zadání nerovnalo „-1/4“ napsanému na klávesnici
    .replace(/[\u2212\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ");
  // odstranit běžné jednotky na konci
  s = s.replace(
    /\s*(cm3|cm²|cm2|cm³|m2|m3|m²|m³|mm2|mm3|km2|dm3|dm2|cm|mm|dm|km|m|kg|dkg|g|t|l|hl|ml|min|minut|hod|h|s|kč|korun|%|°|stupňů|bodů|ks)\s*$/,
    "",
  );
  s = s.replace(/\s/g, "").replace(/,/g, ".").replace(/[·*]/g, "");
  // zlomek a/b -> desetinné číslo, když vyjde přesně
  const m = s.match(/^(-?\d+)\/(\d+)$/);
  if (m) {
    const f = new Frac(Number(m[1]), Number(m[2]));
    const dec = f.toDecimal(6);
    if (dec) return dec.replace(",", ".");
    return `${f.num}/${f.den}`;
  }
  if (/^-?\d*\.?\d+$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n)) return String(n);
  }
  // u nečíselných odpovědí nerozlišujeme oddělovače: "C, A, B" == "CAB"
  return s.replace(/[.;]/g, "");
}

/**
 * Sjednotí zápis algebraického výrazu na tvar, který jde porovnat:
 * odstraní mezery a znaky násobení, „x^2“ i „x2“ zapíše jako „x²“
 * a jednotkový koeficient („1x“) zkrátí na „x“.
 */
export function normalizeExpr(raw: string): string {
  let s = normalizeAnswer(raw);
  s = s.replace(/\^2/g, "²").replace(/\^3/g, "³");
  s = s.replace(/([a-z])2(?![0-9])/g, "$1²");
  s = s.replace(/(^|[+\-(])1([a-z])/g, "$1$2");
  return s;
}

/** Porovná odpověď žáka se správnou odpovědí a s uznávanými variantami. */
export function answersMatch(given: string, answer: string, accept: string[] = []): boolean {
  if (!given.trim()) return false;
  const g = normalizeAnswer(given);
  const ge = normalizeExpr(given);
  return [answer, ...accept].some(
    (a) => normalizeAnswer(a) === g || normalizeExpr(a) === ge,
  );
}

/** Pythagorejské trojice pro úlohy s celočíselným výsledkem. */
export const TRIPLES: ReadonlyArray<readonly [number, number, number]> = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
  [12, 35, 37],
];

/** Skloňování jednotek — "1 koruna / 2 koruny / 5 korun". */
export function plural(n: number, one: string, few: string, many: string): string {
  const a = Math.abs(n);
  if (a === 1) return one;
  if (a >= 2 && a <= 4) return few;
  return many;
}

/** Jednoduchý obrázek jako inline SVG — generátory jej vkládají do zadání. */
export function svg(body: string, w: number, h: number): string {
  return (
    `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${Math.min(w, 420)}px;height:auto" ` +
    `xmlns="http://www.w3.org/2000/svg" role="img" font-family="ui-sans-serif, system-ui, sans-serif">` +
    body +
    `</svg>`
  );
}
