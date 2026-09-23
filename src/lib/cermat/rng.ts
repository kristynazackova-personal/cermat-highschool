/**
 * Deterministický generátor pseudonáhodných čísel.
 *
 * Celý test je funkcí jediného semínka (seed), takže konkrétní test jde
 * sdílet odkazem a znovu si ho otevřít se stejnými úlohami.
 */
export class Rng {
  private s: number;

  constructor(seed: number) {
    // mulberry32
    this.s = seed >>> 0;
  }

  /** Další číslo v intervalu <0, 1). */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Celé číslo z <min, max> včetně obou krajů. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Náhodný prvek pole. */
  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error("pick z prázdného pole");
    return arr[this.int(0, arr.length - 1)];
  }

  /** Nová zamíchaná kopie pole (Fisher–Yates). */
  shuffle<T>(arr: readonly T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** n různých prvků pole. */
  sample<T>(arr: readonly T[], n: number): T[] {
    return this.shuffle(arr).slice(0, Math.min(n, arr.length));
  }

  /** true s pravděpodobností p. */
  chance(p: number): boolean {
    return this.next() < p;
  }
}

/** Převede libovolný řetězec na číselné semínko (FNV-1a). */
export function seedFromString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Krátký čitelný kód semínka, který jde sdílet. */
export function seedCode(seed: number): string {
  return seed.toString(36).toUpperCase().padStart(7, "0").slice(-7);
}

export function seedFromCode(code: string): number {
  const n = parseInt(code, 36);
  return Number.isFinite(n) ? n >>> 0 : seedFromString(code);
}
