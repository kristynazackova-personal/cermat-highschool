import type { Rng } from "../rng";
import type { Part } from "../types";
import { Frac, cz, gcd, lcm, plural, svg, TRIPLES } from "./helpers";

export type GenResult = {
  prompt: string;
  parts: Part[];
  solution: string;
  figure?: string;
  stimulus?: string;
  stimulusTitle?: string;
  selfGraded?: boolean;
};

export type MathGen = (rng: Rng, points: number) => GenResult;

/** Rozdělí body mezi podúlohy tak, aby součet seděl. */
function splitPoints(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  const out = Array(count).fill(base);
  let rest = total - base * count;
  for (let i = 0; rest > 0; i++, rest--) out[i] += 1;
  return out;
}

const L = ["a", "b", "c", "d", "e"];

/** Zkratka pro otevřenou podúlohu s výsledkem. */
function open(id: string, prompt: string, answer: string, points: number, opts: Partial<Part> = {}): Part {
  return { id, prompt, format: "open-result", answer, points, ...opts };
}

/** Zkratka pro uzavřenou podúlohu s nabídkou. */
function choice(
  id: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  points: number,
  rng: Rng,
): Part {
  const keys = ["A", "B", "C", "D", "E"];
  const tagged = options.map((text, i) => ({ text, correct: i === correctIndex }));
  const mixed = rng.shuffle(tagged);
  return {
    id,
    prompt,
    format: "choice",
    choices: mixed.map((o, i) => ({ key: keys[i], text: o.text })),
    answer: keys[mixed.findIndex((o) => o.correct)],
    points,
  };
}

/* ------------------------------------------------------------------ */
/* 1. Numerické výrazy                                                 */
/* ------------------------------------------------------------------ */

export const vypocty: MathGen = (rng, points) => {
  const pts = splitPoints(points, 3);

  // a) celá čísla se závorkami
  const shapes = [
    () => {
      const a = rng.int(20, 90), b = rng.int(3, 9), c = rng.int(6, 15), d = rng.int(2, 5);
      return { text: `${a} − ${b} · (${c} − ${d})`, val: a - b * (c - d) };
    },
    () => {
      const a = rng.int(4, 12), b = rng.int(5, 14), c = rng.int(3, 8), d = rng.int(10, 40);
      return { text: `(${a} + ${b}) · ${c} − ${d}`, val: (a + b) * c - d };
    },
    () => {
      const a = rng.int(6, 14), b = rng.int(4, 9), c = rng.int(3, 8), d = rng.int(2, 7);
      return { text: `${a} · ${b} − ${c} · ${d}`, val: a * b - c * d };
    },
    () => {
      const b = rng.int(30, 80), c = rng.int(4, 9), d = rng.int(2, 6), a = rng.int(2, 8);
      return { text: `${b} − ${c} · ${d} + ${a}²`, val: b - c * d + a * a };
    },
  ];
  const A = rng.pick(shapes)();

  // b) zlomky
  const dens = [2, 3, 4, 5, 6, 8, 10, 12];
  const d1 = rng.pick(dens);
  const d2 = rng.pick(dens.filter((d) => d !== d1));
  const f1 = new Frac(rng.int(1, d1 - 1), d1);
  const f2 = new Frac(rng.int(1, d2 - 1), d2);
  const ops = [
    { sym: "+", f: f1.add(f2) },
    { sym: "−", f: f1.sub(f2) },
    { sym: "·", f: f1.mul(f2) },
    { sym: ":", f: f1.div(f2) },
  ];
  const op = rng.pick(ops);
  const Bval = op.f;

  // c) desetinná čísla (počítáno přesně přes zlomky)
  const x = new Frac(rng.int(11, 95), 10);
  const y = new Frac(rng.int(2, 9) * 5, 100);
  const k = rng.int(2, 9);
  const cShapes = [
    { text: `${cz(x.value)} · ${k} + ${cz(y.value)}`, f: x.mul(new Frac(k)).add(y) },
    { text: `${cz(x.value)} − ${k} · ${cz(y.value)}`, f: x.sub(new Frac(k).mul(y)) },
    { text: `(${cz(x.value)} + ${cz(y.value)}) · ${k}`, f: x.add(y).mul(new Frac(k)) },
  ];
  const C = rng.pick(cShapes);

  const bDec = Bval.toDecimal(6);
  const cDec = C.f.toDecimal(6) ?? cz(C.f.value, 4);

  return {
    prompt: "Vypočtěte:",
    parts: [
      open("a", A.text, String(A.val), pts[0]),
      open("b", `${f1.toString()} ${op.sym} ${f2.toString()}`, Bval.toString(), pts[1], {
        accept: bDec ? [bDec] : [],
      }),
      open("c", C.text, cDec, pts[2]),
    ],
    solution:
      `a) ${A.text} = ${A.val} — nejdříve závorka a násobení, pak sčítání a odčítání.\n` +
      `b) ${f1.toString()} ${op.sym} ${f2.toString()} = ${Bval.toString()}` +
      (bDec ? ` = ${bDec}` : "") +
      ` — zlomky převedeme na společného jmenovatele (u násobení násobíme čitatele i jmenovatele, u dělení násobíme převrácenou hodnotou) a výsledek zkrátíme.\n` +
      `c) ${C.text} = ${cDec} — pozor na pořadí operací, násobení má přednost.`,
  };
};

/* ------------------------------------------------------------------ */
/* 2. Zlomky, desetinná čísla, procenta                                */
/* ------------------------------------------------------------------ */

export const zlomky: MathGen = (rng, points) => {
  const pts = splitPoints(points, 2);
  const den = rng.pick([4, 5, 8, 10, 16, 20, 25]);
  const num = rng.int(1, den - 1);
  const f = new Frac(num, den);
  const dec = f.toDecimal(4)!;
  const pct = cz(f.value * 100, 2);

  const base = rng.pick([120, 180, 240, 300, 360, 420, 480, 540, 600]);
  const den2 = rng.pick([2, 3, 4, 5, 6, 8, 12].filter((d) => base % d === 0));
  const num2 = rng.int(1, den2 - 1);
  const res2 = (base / den2) * num2;

  return {
    prompt: "Řešte úlohy se zlomky:",
    parts: [
      open("a", `Zapište zlomek ${f.toString()} v procentech.`, pct, pts[0], {
        unit: "%",
        accept: [dec, `${pct} %`],
      }),
      open("b", `Vypočtěte ${num2}/${den2} z čísla ${base}.`, String(res2), pts[1]),
    ],
    solution:
      `a) ${f.toString()} = ${dec} = ${pct} % — zlomek převedeme na desetinné číslo (${num} : ${den}) a vynásobíme stem.\n` +
      `b) ${base} : ${den2} = ${base / den2}, a ${base / den2} · ${num2} = ${res2}.`,
  };
};

/* ------------------------------------------------------------------ */
/* 3. Lineární rovnice                                                 */
/* ------------------------------------------------------------------ */

export const rovnice: MathGen = (rng, points) => {
  const root = rng.int(-9, 12);
  const style = rng.int(0, 2);
  let text: string;

  if (style === 0) {
    // ax + b = cx + d
    const a = rng.int(3, 9);
    let c = rng.int(1, 8);
    if (c === a) c = a + 1;
    const b = rng.int(-12, 20);
    const d = (a - c) * root + b;
    text = `${a}x ${b >= 0 ? "+ " + b : "− " + -b} = ${c}x ${d >= 0 ? "+ " + d : "− " + -d}`;
  } else if (style === 1) {
    // a(x + b) = c
    const a = rng.int(2, 7);
    const b = rng.int(-8, 10);
    const c = a * (root + b);
    text = `${a} · (x ${b >= 0 ? "+ " + b : "− " + -b}) = ${c}`;
  } else {
    // (x + a) / b = c  -> bez zlomků v odpovědi
    const b = rng.pick([2, 3, 4, 5]);
    const a = rng.int(-8, 12);
    const c = (root + a) / b;
    if (!Number.isInteger(c)) {
      // posunout a tak, aby dělení vyšlo
      const a2 = b * Math.round((root + a) / b) - root;
      const c2 = (root + a2) / b;
      text = `(x ${a2 >= 0 ? "+ " + a2 : "− " + -a2}) : ${b} = ${c2}`;
    } else {
      text = `(x ${a >= 0 ? "+ " + a : "− " + -a}) : ${b} = ${c}`;
    }
  }

  return {
    prompt: "Řešte rovnici. Proveďte zkoušku.",
    parts: [open("", text, String(root), points, { accept: [`x = ${root}`, `x=${root}`] })],
    solution:
      `${text}\nNeznámé převedeme na jednu stranu, čísla na druhou, obě strany vydělíme koeficientem u x.\n` +
      `x = ${root}\nZkouška: po dosazení x = ${root} se levá strana rovná pravé.`,
  };
};

/* ------------------------------------------------------------------ */
/* 4. Dělitelnost                                                      */
/* ------------------------------------------------------------------ */

export const delitelnost: MathGen = (rng, points) => {
  const pts = splitPoints(points, 2);
  const a = rng.int(24, 96);
  const b = rng.int(18, 84);
  const g = gcd(a, b);
  const m = lcm(a, b);

  const n = rng.pick([36, 48, 60, 72, 84, 90, 96, 120]);
  const divisors = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) divisors.push(i);

  const variant = rng.chance(0.5);

  return {
    prompt: "Řešte úlohy o dělitelnosti:",
    parts: variant
      ? [
          open("a", `Určete největší společný dělitel čísel ${a} a ${b}.`, String(g), pts[0]),
          open("b", `Určete nejmenší společný násobek čísel ${a} a ${b}.`, String(m), pts[1]),
        ]
      : [
          open("a", `Kolik dělitelů má číslo ${n}?`, String(divisors.length), pts[0]),
          open(
            "b",
            `Určete největší společný dělitel čísel ${a} a ${b}.`,
            String(g),
            pts[1],
          ),
        ],
    solution: variant
      ? `a) Rozklad na prvočinitele: NSD(${a}, ${b}) = ${g}.\n` +
        `b) nsn(${a}, ${b}) = ${a} · ${b} : NSD = ${a * b} : ${g} = ${m}.`
      : `a) Dělitelé čísla ${n}: ${divisors.join(", ")} — celkem ${divisors.length}.\n` +
        `b) NSD(${a}, ${b}) = ${g}.`,
  };
};

/* ------------------------------------------------------------------ */
/* 5. Procenta (se zápisem postupu)                                    */
/* ------------------------------------------------------------------ */

export const procenta: MathGen = (rng, points) => {
  const kind = rng.int(0, 3);

  if (kind === 0) {
    const pct = rng.pick([10, 15, 20, 25, 30, 40]);
    const newPrice = rng.pick([1_200, 1_500, 1_800, 2_100, 2_400, 3_000, 3_600]);
    const orig = Math.round(newPrice / (1 - pct / 100));
    const price = Math.round(orig / 100) * 100;
    const after = price * (1 - pct / 100);
    return {
      prompt:
        `Zboží stálo ${cz(price)} Kč. Prodejce cenu snížil o ${pct} %.\n` +
        `Vypočtěte novou cenu zboží. Zapište celý postup řešení.`,
      parts: [open("", "Nová cena:", String(after), points, { unit: "Kč" })],
      solution:
        `Sleva: ${pct} % z ${cz(price)} Kč = ${cz(price)} : 100 · ${pct} = ${cz((price / 100) * pct)} Kč.\n` +
        `Nová cena: ${cz(price)} − ${cz((price / 100) * pct)} = ${cz(after)} Kč.\n` +
        `Rychleji: nová cena je ${100 - pct} % původní, tedy ${cz(price)} · ${cz((100 - pct) / 100)} = ${cz(after)} Kč.`,
    };
  }

  if (kind === 1) {
    const pct = rng.pick([12, 15, 18, 24, 25, 35, 45]);
    const part = rng.pick([6, 9, 12, 18, 21, 27]) * pct;
    const whole = (part / pct) * 100;
    return {
      prompt:
        `${cz(part)} Kč je ${pct} % z celkové částky.\n` +
        `Vypočtěte celkovou částku. Zapište celý postup řešení.`,
      parts: [open("", "Celková částka:", String(whole), points, { unit: "Kč" })],
      solution:
        `1 % = ${cz(part)} : ${pct} = ${cz(part / pct)} Kč.\n` +
        `100 % = ${cz(part / pct)} · 100 = ${cz(whole)} Kč.`,
    };
  }

  if (kind === 2) {
    const total = rng.pick([120, 150, 200, 240, 250, 300, 400]);
    const pct = rng.pick([12, 15, 20, 24, 25, 30, 35, 40]);
    const count = (total / 100) * pct;
    const rest = total - count;
    return {
      prompt:
        `Ve škole je ${total} žáků devátých ročníků. ${pct} % z nich se hlásí na gymnázium.\n` +
        `Kolik žáků se na gymnázium nehlásí? Zapište celý postup řešení.`,
      parts: [open("", "Počet žáků:", String(rest), points)],
      solution:
        `Na gymnázium: ${pct} % z ${total} = ${total} : 100 · ${pct} = ${cz(count)} žáků.\n` +
        `Nehlásí se: ${total} − ${cz(count)} = ${cz(rest)} žáků.\n` +
        `Kontrola: ${cz(rest)} je ${100 - pct} % z ${total}.`,
    };
  }

  const before = rng.pick([400, 500, 600, 750, 800, 1_000]);
  const step = rng.pick([10, 20, 25, 40, 50]);
  const after = before + (before / 100) * step;
  return {
    prompt:
      `Cena vstupenky se zvýšila z ${cz(before)} Kč na ${cz(after)} Kč.\n` +
      `O kolik procent se cena zvýšila? Zapište celý postup řešení.`,
    parts: [open("", "Zvýšení:", String(step), points, { unit: "%" })],
    solution:
      `Zvýšení v korunách: ${cz(after)} − ${cz(before)} = ${cz(after - before)} Kč.\n` +
      `Původní cena je 100 %, tedy 1 % = ${cz(before)} : 100 = ${cz(before / 100)} Kč.\n` +
      `${cz(after - before)} : ${cz(before / 100)} = ${step} %.`,
  };
};

/* ------------------------------------------------------------------ */
/* 6. Poměr a úměrnost (se zápisem postupu)                            */
/* ------------------------------------------------------------------ */

export const pomer: MathGen = (rng, points) => {
  const kind = rng.int(0, 2);

  if (kind === 0) {
    const r1 = rng.int(2, 7);
    const r2 = rng.int(2, 9);
    const unit = rng.pick([12, 15, 20, 24, 30, 40]);
    const total = (r1 + r2) * unit;
    return {
      prompt:
        `Částku ${cz(total)} Kč rozdělíme v poměru ${r1} : ${r2}.\n` +
        `Vypočtěte obě části. Zapište celý postup řešení.`,
      parts: [
        open("a", "Menší/první část:", String(r1 * unit), Math.ceil(points / 2), { unit: "Kč" }),
        open("b", "Druhá část:", String(r2 * unit), Math.floor(points / 2), { unit: "Kč" }),
      ],
      solution:
        `Poměr ${r1} : ${r2} znamená celkem ${r1 + r2} dílů.\n` +
        `Jeden díl: ${cz(total)} : ${r1 + r2} = ${cz(unit)} Kč.\n` +
        `První část: ${cz(unit)} · ${r1} = ${cz(r1 * unit)} Kč, druhá: ${cz(unit)} · ${r2} = ${cz(r2 * unit)} Kč.\n` +
        `Kontrola: ${cz(r1 * unit)} + ${cz(r2 * unit)} = ${cz(total)} Kč.`,
    };
  }

  if (kind === 1) {
    const scale = rng.pick([500, 1_000, 2_000, 5_000, 25_000, 50_000]);
    const cmOnMap = rng.pick([2, 2.5, 3, 4, 4.5, 6, 8]);
    const meters = (cmOnMap * scale) / 100;
    return {
      prompt:
        `Na plánu v měřítku 1 : ${cz(scale)} je úsek dlouhý ${cz(cmOnMap)} cm.\n` +
        `Jaká je jeho skutečná délka v metrech? Zapište celý postup řešení.`,
      parts: [open("", "Skutečná délka:", String(meters), points, { unit: "m" })],
      solution:
        `1 cm na plánu = ${cz(scale)} cm ve skutečnosti.\n` +
        `${cz(cmOnMap)} · ${cz(scale)} = ${cz(cmOnMap * scale)} cm = ${cz(meters)} m (dělíme 100).`,
    };
  }

  const workers = rng.pick([4, 5, 6, 8, 10]);
  const days = rng.pick([12, 15, 18, 20, 24, 30]);
  const workUnits = workers * days;
  const newWorkers = rng.pick([2, 3, 4, 6, 12].filter((w) => w !== workers && workUnits % w === 0));
  const newDays = workUnits / newWorkers;
  return {
    prompt:
      `${workers} dělníků by práci dokončilo za ${days} ${plural(days, "den", "dny", "dní")}.\n` +
      `Za jak dlouho by stejnou práci dokončilo ${newWorkers} dělníků, pracují-li stejným tempem?\n` +
      `Zapište celý postup řešení.`,
    parts: [open("", "Doba:", String(newDays), points, { unit: "dní" })],
    solution:
      `Jde o nepřímou úměrnost — méně dělníků, více dní.\n` +
      `Celková práce: ${workers} · ${days} = ${workUnits} člověkodnů.\n` +
      `${workUnits} : ${newWorkers} = ${newDays} ${plural(newDays, "den", "dny", "dní")}.`,
  };
};

/* ------------------------------------------------------------------ */
/* 7. Číselné řady                                                     */
/* ------------------------------------------------------------------ */

function series(rng: Rng): { shown: number[]; next: number; rule: string } {
  const kind = rng.int(0, 3);
  if (kind === 0) {
    const a0 = rng.int(3, 30);
    const d = rng.int(3, 12) * (rng.chance(0.25) ? -1 : 1);
    const s = [0, 1, 2, 3, 4].map((i) => a0 + i * d);
    return { shown: s, next: a0 + 5 * d, rule: `každý další člen je o ${Math.abs(d)} ${d > 0 ? "větší" : "menší"}` };
  }
  if (kind === 1) {
    const a0 = rng.int(2, 6);
    const q = rng.int(2, 3);
    const s = [0, 1, 2, 3].map((i) => a0 * q ** i);
    return { shown: s, next: a0 * q ** 4, rule: `každý další člen je ${q}krát větší` };
  }
  if (kind === 2) {
    // druhé diference: přírůstek roste o konstantu
    const a0 = rng.int(1, 8);
    const d0 = rng.int(2, 6);
    const dd = rng.int(1, 4);
    const s = [a0];
    let d = d0;
    for (let i = 0; i < 4; i++) {
      s.push(s[s.length - 1] + d);
      d += dd;
    }
    const next = s[s.length - 1] + d;
    return { shown: s, next, rule: `přírůstky rostou vždy o ${dd} (${d0}, ${d0 + dd}, ${d0 + 2 * dd}, …)` };
  }
  // střídavě + a ·
  const a0 = rng.int(2, 9);
  const add = rng.int(3, 9);
  const mul = 2;
  const s = [a0];
  for (let i = 0; i < 4; i++) s.push(i % 2 === 0 ? s[s.length - 1] + add : s[s.length - 1] * mul);
  const next = s.length % 2 === 1 ? s[s.length - 1] + add : s[s.length - 1] * mul;
  return { shown: s, next, rule: `střídá se „+ ${add}“ a „· ${mul}“` };
}

export const posloupnost: MathGen = (rng, points) => {
  const pts = splitPoints(points, 2);
  const s1 = series(rng);
  const s2 = series(rng);
  return {
    prompt: "Doplňte číslo, které v řadě následuje:",
    parts: [
      open("a", `${s1.shown.join(", ")}, …`, String(s1.next), pts[0]),
      open("b", `${s2.shown.join(", ")}, …`, String(s2.next), pts[1]),
    ],
    solution:
      `a) Pravidlo: ${s1.rule}. Následuje ${s1.next}.\n` +
      `b) Pravidlo: ${s2.rule}. Následuje ${s2.next}.`,
  };
};

/* ------------------------------------------------------------------ */
/* 8. Převody jednotek                                                 */
/* ------------------------------------------------------------------ */

const CONVERSIONS: Array<(rng: Rng) => { q: string; a: string; why: string }> = [
  (rng) => {
    const v = rng.pick([1.5, 2.5, 3.25, 0.75, 4.2, 2.4]);
    return { q: `${cz(v)} h = ______ min`, a: String(v * 60), why: `1 h = 60 min, ${cz(v)} · 60 = ${cz(v * 60)} min` };
  },
  (rng) => {
    const v = rng.pick([0.35, 0.45, 1.2, 2.05, 0.8, 3.5]);
    return { q: `${cz(v)} m² = ______ cm²`, a: String(v * 10000), why: `1 m² = 10 000 cm², ${cz(v)} · 10 000 = ${cz(v * 10000)} cm²` };
  },
  (rng) => {
    const v = rng.pick([2.5, 1.75, 0.6, 4.2, 3.05]);
    return { q: `${cz(v)} km = ______ m`, a: String(v * 1000), why: `1 km = 1 000 m, ${cz(v)} · 1 000 = ${cz(v * 1000)} m` };
  },
  (rng) => {
    const v = rng.pick([1500, 2400, 750, 3200, 4800]);
    return { q: `${cz(v)} g = ______ kg`, a: String(v / 1000), why: `1 kg = 1 000 g, ${cz(v)} : 1 000 = ${cz(v / 1000)} kg` };
  },
  (rng) => {
    const v = rng.pick([0.5, 1.25, 2.4, 0.08, 3.6]);
    return { q: `${cz(v)} m³ = ______ l`, a: String(v * 1000), why: `1 m³ = 1 000 l, ${cz(v)} · 1 000 = ${cz(v * 1000)} l` };
  },
  (rng) => {
    const v = rng.pick([45, 90, 150, 210, 75]);
    return { q: `${v} min = ______ h`, a: String(v / 60), why: `${v} : 60 = ${cz(v / 60)} h` };
  },
  (rng) => {
    const v = rng.pick([2.5, 0.4, 1.8, 3.2, 0.06]);
    return { q: `${cz(v)} dm³ = ______ cm³`, a: String(v * 1000), why: `1 dm³ = 1 000 cm³, ${cz(v)} · 1 000 = ${cz(v * 1000)} cm³` };
  },
];

export const jednotky: MathGen = (rng, points) => {
  const pts = splitPoints(points, 2);
  const [c1, c2] = rng.sample(CONVERSIONS, 2).map((f) => f(rng));
  return {
    prompt: "Doplňte chybějící údaje:",
    parts: [open("a", c1.q, c1.a, pts[0]), open("b", c2.q, c2.a, pts[1])],
    solution: `a) ${c1.why}\nb) ${c2.why}`,
  };
};

/* ------------------------------------------------------------------ */
/* 9. Práce s tabulkou a s daty                                        */
/* ------------------------------------------------------------------ */

export const tabulka: MathGen = (rng, points) => {
  const pts = splitPoints(points, 3);
  const names = rng.sample(
    ["Adam", "Bára", "Cyril", "Dita", "Eva", "Filip", "Gita", "Honza", "Iva", "Jakub"],
    5,
  );
  const label = rng.pick([
    { what: "Počet bodů z testu", unit: "b" },
    { what: "Ušlá vzdálenost za týden", unit: "km" },
    { what: "Počet přečtených stran", unit: "" },
  ]);

  // hodnoty volíme tak, aby průměr vyšel jako celé číslo
  const mean = rng.int(12, 40);
  const offsets = rng.shuffle([-6, -3, 0, 3, 6]);
  const values = offsets.map((o) => mean + o);

  const max = Math.max(...values);
  const min = Math.min(...values);
  const aboveMean = values.filter((v) => v > mean).length;

  const rows = names.map((n, i) => `| ${n} | ${values[i]} |`).join("\n");
  const stimulus =
    `| Jméno | ${label.what}${label.unit ? ` (${label.unit})` : ""} |\n|---|---|\n${rows}`;

  return {
    stimulusTitle: "VÝCHOZÍ TABULKA",
    stimulus,
    prompt: "Na základě tabulky odpovězte:",
    parts: [
      open("a", "Jaký je aritmetický průměr uvedených hodnot?", String(mean), pts[0]),
      open("b", "Jaký je rozdíl mezi největší a nejmenší hodnotou?", String(max - min), pts[1]),
      open(
        "c",
        "Kolik hodnot je větších než aritmetický průměr?",
        String(aboveMean),
        pts[2],
      ),
    ],
    solution:
      `a) Součet: ${values.join(" + ")} = ${values.reduce((s, v) => s + v, 0)}. ` +
      `Průměr: ${values.reduce((s, v) => s + v, 0)} : 5 = ${mean}.\n` +
      `b) ${max} − ${min} = ${max - min}.\n` +
      `c) Nad průměrem ${mean} leží ${aboveMean} ${plural(aboveMean, "hodnota", "hodnoty", "hodnot")}.`,
  };
};

/* ------------------------------------------------------------------ */
/* 10. Obvod a obsah složeného obrazce                                 */
/* ------------------------------------------------------------------ */

/** Vykreslí obrazec ve tvaru L s okótovanými stranami. */
function lShapeSvg(a: number, b: number, c: number, d: number): string {
  const pad = 34;
  const scale = Math.min(300 / a, 200 / b);
  const W = a * scale, H = b * scale;
  const px = (x: number) => pad + x * scale;
  const py = (y: number) => pad + (b - y) * scale;
  const pts = [
    [0, 0], [a, 0], [a, b - d], [a - c, b - d], [a - c, b], [0, b],
  ].map(([x, y]) => `${px(x)},${py(y)}`).join(" ");

  const lbl = (x: number, y: number, t: string, anchor = "middle") =>
    `<text x="${px(x)}" y="${py(y)}" text-anchor="${anchor}" font-size="13" fill="currentColor">${t}</text>`;

  return svg(
    `<polygon points="${pts}" fill="rgba(99,102,241,0.10)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>` +
      lbl(a / 2, -0.55, `${a} cm`) +
      lbl(a + 0.5, (b - d) / 2, `${b - d} cm`, "start") +
      lbl(a - c / 2, b - d + 0.45, `${c} cm`) +
      lbl(a - c - 0.4, b - d / 2, `${d} cm`, "end") +
      lbl((a - c) / 2, b + 0.4, `${a - c} cm`) +
      lbl(-0.5, b / 2, `${b} cm`, "end"),
    W + pad * 2.2,
    H + pad * 2,
  );
}

export const obsah: MathGen = (rng, points) => {
  const pts = splitPoints(points, 2);
  const a = rng.int(9, 18);
  const b = rng.int(7, 14);
  const c = rng.int(3, a - 4);
  const d = rng.int(2, b - 3);

  const area = a * b - c * d;
  const perimeter = 2 * (a + b);

  return {
    figure: lShapeSvg(a, b, c, d),
    prompt:
      "Obrazec na obrázku je složen z obdélníků a všechny jeho úhly jsou pravé.\n" +
      "Vypočtěte jeho obvod a obsah.",
    parts: [
      open("a", "Obvod obrazce:", String(perimeter), pts[0], { unit: "cm" }),
      open("b", "Obsah obrazce:", String(area), pts[1], { unit: "cm²" }),
    ],
    solution:
      `a) Obvod sečteme po stranách: ${a} + ${b - d} + ${c} + ${d} + ${a - c} + ${b} = ${perimeter} cm.\n` +
      `   (Zkratka: u obrazce s vyříznutým rohem je obvod stejný jako u celého obdélníku ${a} × ${b}, tedy 2 · (${a} + ${b}) = ${perimeter} cm.)\n` +
      `b) Obsah = celý obdélník − vyříznutý obdélník = ${a} · ${b} − ${c} · ${d} = ${a * b} − ${c * d} = ${area} cm².`,
  };
};

/* ------------------------------------------------------------------ */
/* 11. Pythagorova věta                                                */
/* ------------------------------------------------------------------ */

function rightTriangleSvg(a: number, b: number, unknown: "a" | "b" | "c"): string {
  const pad = 36;
  const scale = Math.min(250 / Math.max(a, b), 170 / Math.max(a, b));
  const W = b * scale, H = a * scale;
  const x0 = pad, y0 = pad + H;
  const A = `${x0},${y0}`, B = `${x0 + W},${y0}`, C = `${x0},${pad}`;
  const m = 13;
  return svg(
    `<polygon points="${A} ${B} ${C}" fill="rgba(16,185,129,0.10)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M ${x0} ${y0 - m} L ${x0 + m} ${y0 - m} L ${x0 + m} ${y0}" fill="none" stroke="currentColor" stroke-width="1.2"/>` +
      `<text x="${x0 + W / 2}" y="${y0 + 20}" text-anchor="middle" font-size="13" fill="currentColor">${unknown === "b" ? "?" : b + " cm"}</text>` +
      `<text x="${x0 - 8}" y="${pad + H / 2}" text-anchor="end" font-size="13" fill="currentColor">${unknown === "a" ? "?" : a + " cm"}</text>` +
      `<text x="${x0 + W / 2 + 14}" y="${pad + H / 2 - 6}" text-anchor="start" font-size="13" fill="currentColor">${unknown === "c" ? "?" : "c"}</text>`,
    W + pad * 2.4,
    H + pad * 2,
  );
}

export const pythagoras: MathGen = (rng, points) => {
  const pts = splitPoints(points, 2);
  const [t1, t2, t3] = rng.pick(TRIPLES);
  const k = rng.pick([1, 1, 2, 3]);
  const a = t1 * k, b = t2 * k, c = t3 * k;
  const findHypotenuse = rng.chance(0.6);
  const area = (a * b) / 2;

  if (findHypotenuse) {
    return {
      figure: rightTriangleSvg(a, b, "c"),
      prompt:
        `Pravoúhlý trojúhelník má odvěsny dlouhé ${a} cm a ${b} cm.`,
      parts: [
        open("a", "Vypočtěte délku přepony.", String(c), pts[0], { unit: "cm" }),
        open("b", "Vypočtěte obsah trojúhelníku.", String(area), pts[1], { unit: "cm²" }),
      ],
      solution:
        `a) c² = a² + b² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, tedy c = √${c * c} = ${c} cm.\n` +
        `b) S = a · b : 2 = ${a} · ${b} : 2 = ${area} cm².`,
    };
  }

  return {
    figure: rightTriangleSvg(a, b, "a"),
    prompt: `Pravoúhlý trojúhelník má přeponu ${c} cm a jednu odvěsnu ${b} cm.`,
    parts: [
      open("a", "Vypočtěte délku druhé odvěsny.", String(a), pts[0], { unit: "cm" }),
      open("b", "Vypočtěte obvod trojúhelníku.", String(a + b + c), pts[1], { unit: "cm" }),
    ],
    solution:
      `a) a² = c² − b² = ${c}² − ${b}² = ${c * c} − ${b * b} = ${a * a}, tedy a = √${a * a} = ${a} cm.\n` +
      `b) o = ${a} + ${b} + ${c} = ${a + b + c} cm.`,
  };
};

/* ------------------------------------------------------------------ */
/* 12. Objem a povrch tělesa                                           */
/* ------------------------------------------------------------------ */

export const teleso: MathGen = (rng, points) => {
  const pts = splitPoints(points, 2);

  if (rng.chance(0.35)) {
    const a = rng.int(4, 12);
    return {
      prompt: `Krychle má hranu dlouhou ${a} cm.`,
      parts: [
        open("a", "Vypočtěte její objem.", String(a ** 3), pts[0], { unit: "cm³" }),
        open("b", "Vypočtěte její povrch.", String(6 * a * a), pts[1], { unit: "cm²" }),
      ],
      solution:
        `a) V = a³ = ${a}³ = ${a ** 3} cm³.\n` +
        `b) S = 6 · a² = 6 · ${a * a} = ${6 * a * a} cm².`,
    };
  }

  const a = rng.int(3, 15), b = rng.int(4, 14), c = rng.int(2, 12);
  const V = a * b * c;
  const S = 2 * (a * b + b * c + a * c);
  return {
    prompt: `Kvádr má rozměry ${a} cm, ${b} cm a ${c} cm.`,
    parts: [
      open("a", "Vypočtěte jeho objem.", String(V), pts[0], { unit: "cm³" }),
      open("b", "Vypočtěte jeho povrch.", String(S), pts[1], { unit: "cm²" }),
    ],
    solution:
      `a) V = a · b · c = ${a} · ${b} · ${c} = ${V} cm³.\n` +
      `b) S = 2 · (ab + bc + ac) = 2 · (${a * b} + ${b * c} + ${a * c}) = 2 · ${a * b + b * c + a * c} = ${S} cm².`,
  };
};

/* ------------------------------------------------------------------ */
/* 13. Konstrukční úloha                                               */
/* ------------------------------------------------------------------ */

export const konstrukce: MathGen = (rng, points) => {
  const selfPts = Math.max(1, points - 1);

  if (rng.chance(0.5)) {
    // zadání sus: c, α, β  -> γ dopočítatelné
    const alpha = rng.int(35, 75);
    const beta = rng.int(35, 180 - alpha - 35);
    const gamma = 180 - alpha - beta;
    const c = rng.int(5, 9);
    return {
      selfGraded: true,
      prompt:
        `Je dán trojúhelník ABC, ve kterém platí:\n` +
        `|AB| = ${c} cm,  α = ${alpha}°,  β = ${beta}°.`,
      parts: [
        open("a", "Vypočtěte velikost úhlu γ.", String(gamma), 1, { unit: "°" }),
        {
          id: "b",
          prompt:
            "Sestrojte trojúhelník ABC a zapište postup konstrukce. " +
            "(Tuto část si po odeslání ohodnoťte podle vzorového postupu.)",
          format: "construction",
          answer: "—",
          points: selfPts,
        },
      ],
      solution:
        `a) Součet vnitřních úhlů trojúhelníku je 180°, tedy γ = 180° − ${alpha}° − ${beta}° = ${gamma}°.\n` +
        `b) Postup konstrukce:\n` +
        `   1. AB;  |AB| = ${c} cm\n` +
        `   2. ↦AX;  |∡BAX| = ${alpha}°\n` +
        `   3. ↦BY;  |∡ABY| = ${beta}°, Y v téže polorovině jako X\n` +
        `   4. C;  C ∈ ↦AX ∩ ↦BY\n` +
        `   5. △ABC\n` +
        `   Hodnocení: 1 bod za zápis postupu, 2 body za správnou konstrukci, 1 bod za rýsování a označení.`,
    };
  }

  // zadání sss — musí platit trojúhelníková nerovnost
  let a = 0, b = 0, c = 0;
  do {
    a = rng.int(4, 9);
    b = rng.int(4, 9);
    c = rng.int(4, 9);
  } while (a + b <= c || a + c <= b || b + c <= a);

  return {
    selfGraded: true,
    prompt:
      `Je dán trojúhelník ABC, ve kterém platí:\n` +
      `|AB| = ${c} cm,  |BC| = ${a} cm,  |AC| = ${b} cm.`,
    parts: [
      open("a", "Vypočtěte obvod trojúhelníku ABC.", String(a + b + c), 1, { unit: "cm" }),
      {
        id: "b",
        prompt:
          "Sestrojte trojúhelník ABC a zapište postup konstrukce. " +
          "(Tuto část si po odeslání ohodnoťte podle vzorového postupu.)",
        format: "construction",
        answer: "—",
        points: selfPts,
      },
    ],
    solution:
      `a) o = ${c} + ${a} + ${b} = ${a + b + c} cm.\n` +
      `b) Postup konstrukce:\n` +
      `   1. AB;  |AB| = ${c} cm\n` +
      `   2. k;  k(A; ${b} cm)\n` +
      `   3. l;  l(B; ${a} cm)\n` +
      `   4. C;  C ∈ k ∩ l\n` +
      `   5. △ABC\n` +
      `   Ověření: trojúhelníková nerovnost platí (${a} + ${b} > ${c} atd.).\n` +
      `   Hodnocení: 1 bod za zápis postupu, 2 body za správnou konstrukci, 1 bod za rýsování a označení.`,
  };
};

/* ------------------------------------------------------------------ */
/* 14. Uzavřená úloha s výběrem z pěti možností                        */
/* ------------------------------------------------------------------ */

export const vyber: MathGen = (rng, points) => {
  if (rng.chance(0.5)) {
    // bod na přímce y = kx + q
    const k = rng.pick([-3, -2, -1, 2, 3, 4]);
    const q = rng.int(-6, 8);
    const x = rng.int(-4, 5);
    const y = k * x + q;
    const wrong = new Set<string>();
    while (wrong.size < 4) {
      const wx = rng.int(-5, 6);
      const wy = k * wx + q + rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      if (wy !== k * wx + q) wrong.add(`[${wx}; ${wy}]`);
    }
    const opts = [`[${x}; ${y}]`, ...Array.from(wrong)];
    return {
      prompt: `Který z uvedených bodů leží na přímce dané rovnicí y = ${k}x ${q >= 0 ? "+ " + q : "− " + -q}?`,
      parts: [choice("", "", opts, 0, points, rng)],
      solution:
        `Do rovnice dosadíme souřadnice bodu. Pro bod [${x}; ${y}] platí ` +
        `${k} · (${x}) ${q >= 0 ? "+ " + q : "− " + -q} = ${y} — rovnost platí, bod na přímce leží.\n` +
        `U ostatních bodů se levá a pravá strana nerovnají.`,
    };
  }

  // ekvivalentní úprava výrazu
  const a = rng.int(2, 7);
  const b = rng.int(2, 9);
  const correct = `${a * a}x² ${2 * a * b >= 0 ? "+" : "−"} ${Math.abs(2 * a * b)}x + ${b * b}`;
  const opts = [
    correct,
    `${a * a}x² + ${b * b}`,
    `${a * a}x² + ${a * b}x + ${b * b}`,
    `${a * a}x² + ${2 * a * b}x − ${b * b}`,
    `${a}x² + ${2 * a * b}x + ${b}`,
  ];
  return {
    prompt: `Který výraz je roven výrazu (${a}x + ${b})² pro každé reálné číslo x?`,
    parts: [choice("", "", opts, 0, points, rng)],
    solution:
      `Použijeme vzorec (A + B)² = A² + 2AB + B².\n` +
      `A = ${a}x, B = ${b}  ⟹  (${a}x)² + 2 · ${a}x · ${b} + ${b}² = ${correct}.`,
  };
};

/* ------------------------------------------------------------------ */
/* 15. Dichotomické úlohy ANO/NE                                       */
/* ------------------------------------------------------------------ */

type Claim = { text: string; truth: boolean; why: string };

function makeClaims(rng: Rng): Claim[] {
  const pool: Array<() => Claim> = [
    () => {
      const s = rng.int(4, 14);
      const real = s * s;
      const shown = rng.chance(0.5) ? real : real + rng.pick([-8, -5, 5, 9]);
      return {
        text: `Obsah čtverce o straně ${s} cm je ${shown} cm².`,
        truth: shown === real,
        why: `S = a² = ${s}² = ${real} cm².`,
      };
    },
    () => {
      const r = rng.int(3, 12);
      const real = 2 * r;
      const shown = rng.chance(0.5) ? real : real + rng.pick([-3, -1, 2, 4]);
      return {
        text: `Kružnice s poloměrem ${r} cm má průměr ${shown} cm.`,
        truth: shown === real,
        why: `Průměr je dvojnásobek poloměru: 2 · ${r} = ${real} cm.`,
      };
    },
    () => {
      const a = rng.int(20, 80), b = rng.int(20, 80);
      const real = 180 - a - b;
      const shown = rng.chance(0.5) ? real : real + rng.pick([-12, -6, 7, 15]);
      return {
        text: `V trojúhelníku s úhly ${a}° a ${b}° má třetí úhel velikost ${shown}°.`,
        truth: shown === real && real > 0,
        why: `Součet vnitřních úhlů je 180°: 180° − ${a}° − ${b}° = ${real}°.`,
      };
    },
    () => {
      const a = rng.int(3, 9), b = rng.int(3, 9);
      const real = 2 * (a + b);
      const shown = rng.chance(0.5) ? real : real + rng.pick([-6, -2, 3, 8]);
      return {
        text: `Obdélník o rozměrech ${a} cm a ${b} cm má obvod ${shown} cm.`,
        truth: shown === real,
        why: `o = 2 · (${a} + ${b}) = ${real} cm.`,
      };
    },
    () => {
      const n = rng.pick([12, 15, 18, 21, 24, 27, 33, 35, 49, 51]);
      const isPrime = (x: number) => {
        if (x < 2) return false;
        for (let i = 2; i * i <= x; i++) if (x % i === 0) return false;
        return true;
      };
      return {
        text: `Číslo ${n} je prvočíslo.`,
        truth: isPrime(n),
        why: isPrime(n)
          ? `${n} je dělitelné jen jedničkou a sebou samým.`
          : `${n} je dělitelné i jinými čísly než 1 a ${n} — není to prvočíslo.`,
      };
    },
    () => {
      const a = rng.int(2, 9);
      const real = a ** 3;
      const shown = rng.chance(0.5) ? real : real + rng.pick([-20, -9, 12, 30]);
      return {
        text: `Krychle s hranou ${a} cm má objem ${shown} cm³.`,
        truth: shown === real,
        why: `V = a³ = ${a}³ = ${real} cm³.`,
      };
    },
  ];
  return rng.sample(pool, 3).map((f) => f());
}

export const anone: MathGen = (rng, points) => {
  const claims = makeClaims(rng);
  const pts = splitPoints(points, claims.length);
  return {
    prompt: "Rozhodněte o každém tvrzení, zda je pravdivé (ANO), či nikoli (NE).",
    parts: claims.map((c, i) => ({
      id: L[i],
      prompt: c.text,
      format: "truefalse" as const,
      choices: [
        { key: "ANO", text: "ANO" },
        { key: "NE", text: "NE" },
      ],
      answer: c.truth ? "ANO" : "NE",
      points: pts[i],
    })),
    solution: claims
      .map((c, i) => `${L[i]}) ${c.truth ? "ANO" : "NE"} — ${c.why}`)
      .join("\n"),
  };
};

/* ------------------------------------------------------------------ */
/* 16. Nestandardní aplikační úloha                                    */
/* ------------------------------------------------------------------ */

export const logika: MathGen = (rng, points) => {
  const kind = rng.int(0, 2);

  if (kind === 0) {
    const rabbits = rng.int(4, 14);
    const chickens = rng.int(5, 18);
    const heads = rabbits + chickens;
    const legs = 4 * rabbits + 2 * chickens;
    return {
      prompt:
        `Na dvoře jsou slepice a králíci. Dohromady mají ${heads} hlav a ${legs} nohou.\n` +
        `Kolik je na dvoře králíků?`,
      parts: [open("", "Počet králíků:", String(rabbits), points)],
      solution:
        `Kdyby byla všechna zvířata slepice, měla by ${heads} · 2 = ${2 * heads} nohou.\n` +
        `Nohou je ale o ${legs} − ${2 * heads} = ${legs - 2 * heads} více, a každý králík přidá 2 nohy navíc.\n` +
        `Králíků je ${legs - 2 * heads} : 2 = ${rabbits}, slepic ${heads} − ${rabbits} = ${chickens}.`,
    };
  }

  if (kind === 1) {
    const son = rng.int(6, 14);
    const n = rng.int(2, 12);
    const father = 2 * son + n;
    return {
      prompt:
        `Otci je ${father} let, jeho synovi ${son} let.\n` +
        `Za kolik let bude otec právě dvakrát starší než syn?`,
      parts: [open("", "Za:", String(n), points, { unit: "let" })],
      solution:
        `Hledáme počet let x, pro který platí ${father} + x = 2 · (${son} + x).\n` +
        `${father} + x = ${2 * son} + 2x  ⟹  ${father} − ${2 * son} = x  ⟹  x = ${n}.\n` +
        `Zkouška: za ${n} let bude otci ${father + n} let a synovi ${son + n} let, a ${father + n} = 2 · ${son + n}.`,
    };
  }

  const price = rng.pick([7, 9, 11, 13]);
  const count = rng.int(6, 14);
  const paid = rng.pick([150, 200, 250, 300]);
  const total = price * count;
  const change = paid - total;
  const safeCount = change >= 0 ? count : Math.floor(paid / price);
  const safeTotal = price * safeCount;
  return {
    prompt:
      `Sešit stojí ${price} Kč. Kolik nejvíce sešitů se dá koupit za ${paid} Kč ` +
      `a kolik korun zbude?`,
    parts: [
      open("a", "Počet sešitů:", String(Math.floor(paid / price)), Math.ceil(points / 2)),
      open("b", "Zbude:", String(paid - price * Math.floor(paid / price)), Math.floor(points / 2), {
        unit: "Kč",
      }),
    ],
    solution:
      `${paid} : ${price} = ${Math.floor(paid / price)} (zbytek ${paid - price * Math.floor(paid / price)}).\n` +
      `Koupíme ${Math.floor(paid / price)} sešitů za ${price * Math.floor(paid / price)} Kč, ` +
      `zbude ${paid - price * Math.floor(paid / price)} Kč.` +
      (safeTotal !== total ? "" : ""),
  };
};

/** Rejstřík generátorů — klíč odpovídá poli `gen` v plánu testu. */
export const MATH_GENERATORS: Record<string, MathGen> = {
  vypocty,
  zlomky,
  rovnice,
  delitelnost,
  procenta,
  pomer,
  posloupnost,
  jednotky,
  tabulka,
  obsah,
  pythagoras,
  teleso,
  konstrukce,
  vyber,
  anone,
  logika,
};
