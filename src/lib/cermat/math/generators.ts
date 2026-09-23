import type { Rng } from "../rng";
import type { Choice, Part } from "../types";
import { Frac, cz, gcd, plural, svg, TRIPLES } from "./helpers";

export type GenResult = {
  prompt: string;
  parts: Part[];
  solution: string;
  figure?: string;
  stimulus?: string;
  stimulusTitle?: string;
  offer?: Choice[];
  selfGraded?: boolean;
};

/**
 * Sdílený kontext testu. Tři uzavřené úlohy (12–14) se vybírají jednou,
 * aby se v jednom testu nemohly zopakovat — generátory jsou volané
 * samostatně a bez toho by každá sáhla do fondu nezávisle.
 */
export type MathCtx = { closed: ClosedTask[] };

export type MathGen = (rng: Rng, points: number, ctx: MathCtx) => GenResult;

const KEYS = ["A", "B", "C", "D", "E", "F"];

/** Rozdělí body mezi podúlohy tak, aby součet seděl. */
function splitPoints(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  const out = Array(count).fill(base);
  let rest = total - base * count;
  for (let i = 0; rest > 0; i++, rest--) out[i] += 1;
  return out;
}

/** Otevřená podúloha, zapisuje se jen výsledek. */
function open(id: string, prompt: string, answer: string, points: number, o: Partial<Part> = {}): Part {
  return { id, prompt, format: "open-result", answer, points, ...o };
}

/** Otevřená podúloha, v záznamovém archu se vyžaduje celý postup. */
function work(id: string, prompt: string, answer: string, points: number, o: Partial<Part> = {}): Part {
  return { id, prompt, format: "open-work", answer, points, ...o };
}

/** Uzavřená podúloha; nabídka se zamíchá, ale záchytná možnost zůstává poslední. */
function choicePart(
  rng: Rng,
  id: string,
  prompt: string,
  correct: string,
  wrong: string[],
  fallback: string | null,
  points: number,
): Part {
  const tagged = rng.shuffle([{ text: correct, ok: true }, ...wrong.map((t) => ({ text: t, ok: false }))]);
  if (fallback) tagged.push({ text: fallback, ok: false });
  return {
    id,
    prompt,
    format: "choice",
    choices: tagged.map((o, i) => ({ key: KEYS[i], text: o.text })),
    answer: KEYS[tagged.findIndex((o) => o.ok)],
    points,
  };
}

/**
 * Uzavřená úloha, u níž správná hodnota NENÍ v nabídce — správně je záchytná
 * možnost („E) jiný obsah“). Skutečné testy to dělají, takže vyloučením
 * čtyř možností se úloha uhodnout nedá.
 */
function choiceFallback(
  rng: Rng,
  id: string,
  prompt: string,
  wrong: string[],
  fallback: string,
  points: number,
): Part {
  const tagged = rng.shuffle(wrong.map((t) => ({ text: t, ok: false })));
  tagged.push({ text: fallback, ok: true });
  return {
    id,
    prompt,
    format: "choice",
    choices: tagged.map((o, i) => ({ key: KEYS[i], text: o.text })),
    answer: KEYS[tagged.length - 1],
    points,
  };
}

/** Zápis zlomku se znaménkem minus podle českého úzu. */
function f(x: Frac): string {
  return x.toString().replace("-", "−");
}
/** Číslo se znaménkem minus podle českého úzu. */
function n(x: number, d = 4): string {
  return cz(x, d).replace("-", "−");
}

/* ================================================================== */
/* 1. Krátký úvodní výpočet                                            */
/* ================================================================== */

export const uvod: MathGen = (rng, points) => {
  const kind = rng.int(0, 2);

  if (kind === 0) {
    const m2 = rng.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.4]);
    const cm2 = rng.pick([20, 50, 120, 250, 400, 600]);
    const big = m2 * 10000;
    if (big > cm2) {
      return {
        prompt:
          `Vypočtěte, o kolik cm² je plocha o obsahu ${cz(m2)} m² větší ` +
          `než plocha o obsahu ${cz(cm2)} cm².`,
        parts: [open("", "", String(big - cm2), points, { unit: "cm²" })],
        solution:
          `${cz(m2)} m² = ${cz(m2)} · 10 000 = ${cz(big)} cm² (1 m² = 10 000 cm²).\n` +
          `${cz(big)} − ${cz(cm2)} = ${cz(big - cm2)} cm².`,
      };
    }
  }

  if (kind === 1) {
    const first = rng.int(180, 320) / 100; // v metrech
    const thirdCm = Math.round(first * 100) + rng.int(15, 140);
    return {
      prompt:
        `Filipův první hod byl dlouhý ${cz(first)} m, třetí hod ${cz(thirdCm)} cm.\n` +
        `Vypočtěte, o kolik cm byl třetí hod delší než první.`,
      parts: [open("", "", String(thirdCm - Math.round(first * 100)), points, { unit: "cm" })],
      solution:
        `${cz(first)} m = ${cz(first * 100)} cm (1 m = 100 cm).\n` +
        `${cz(thirdCm)} − ${cz(first * 100)} = ${cz(thirdCm - first * 100)} cm.`,
    };
  }

  const litry = rng.pick([1.5, 2.5, 0.75, 3.2, 1.25]);
  const ml = rng.pick([150, 250, 400, 600, 90]);
  const bigMl = litry * 1000;
  return {
    prompt:
      `Vypočtěte, o kolik ml je objem ${cz(litry)} l větší než objem ${cz(ml)} ml.`,
    parts: [open("", "", String(bigMl - ml), points, { unit: "ml" })],
    solution:
      `${cz(litry)} l = ${cz(bigMl)} ml (1 l = 1 000 ml).\n` +
      `${cz(bigMl)} − ${cz(ml)} = ${cz(bigMl - ml)} ml.`,
  };
};

/* ================================================================== */
/* 2. Zlomky a desetinná čísla (poslední část s postupem)              */
/* ================================================================== */

export const zlomky: MathGen = (rng, points) => {
  const pts = splitPoints(points, 3); // 4 b -> 2/1/1, srovnáme na 1/1/2
  const [p1, p2, p3] = [1, 1, points - 2];
  void pts;

  const dens = [3, 4, 5, 6, 8, 9, 10, 12];

  // 2.1  k · (−a/b) + c/d
  const b1 = rng.pick(dens);
  const d1 = rng.pick(dens.filter((x) => x !== b1));
  const A = new Frac(rng.int(1, b1 - 1), b1);
  const B = new Frac(rng.int(1, d1 - 1), d1);
  const k1 = rng.int(2, 5);
  const r1 = new Frac(k1).mul(A).mul(new Frac(-1)).add(B);

  // 2.2  1 : a/b − c/d : k
  const b2 = rng.pick(dens);
  const d2 = rng.pick(dens.filter((x) => x !== b2));
  const C = new Frac(rng.int(1, b2 - 1) + b2, b2); // > 1, ať dělení dává hezký výsledek
  const D = new Frac(rng.int(1, d2 - 1), d2);
  const k2 = rng.int(2, 6);
  const r2 = new Frac(1).div(C).sub(D.div(new Frac(k2)));

  // 2.3  (m − a/b) : (k · c/d − j)     — se zápisem postupu
  const b3 = rng.pick(dens);
  const d3 = rng.pick(dens.filter((x) => x !== b3));
  const E = new Frac(rng.int(1, b3 - 1), b3);
  const G = new Frac(rng.int(1, d3 - 1), d3);
  const m3 = rng.int(1, 3);
  const k3 = rng.int(2, 5);
  let j3 = rng.int(1, 3);
  let den3 = new Frac(k3).mul(G).sub(new Frac(j3));
  if (den3.num === 0) {
    j3 += 1;
    den3 = new Frac(k3).mul(G).sub(new Frac(j3));
  }
  const num3 = new Frac(m3).sub(E);
  const r3 = num3.div(den3);

  return {
    prompt: "Vypočtěte a výsledek zapište zlomkem v základním tvaru nebo celým číslem:",
    parts: [
      open("1", `${k1} · (−${A.toString()}) + ${B.toString()} =`, r3Fix(r1), p1, {
        accept: decAccept(r1),
      }),
      open("2", `1 : ${C.toString()} − ${D.toString()} : ${k2} =`, r3Fix(r2), p2, {
        accept: decAccept(r2),
      }),
      work(
        "3",
        `(${m3} − ${E.toString()}) : (${k3} · ${G.toString()} − ${j3}) =`,
        r3Fix(r3),
        p3,
        { accept: decAccept(r3) },
      ),
    ],
    solution:
      `2.1  ${k1} · (−${A.toString()}) = ${f(new Frac(k1).mul(A).mul(new Frac(-1)))}; ` +
      `po sečtení s ${B.toString()} vyjde ${f(r1)}.\n` +
      `2.2  1 : ${C.toString()} = ${f(new Frac(1).div(C))} a ${D.toString()} : ${k2} = ${f(D.div(new Frac(k2)))}; ` +
      `rozdíl je ${f(r2)}.\n` +
      `2.3  Čitatel: ${m3} − ${E.toString()} = ${f(num3)}. Jmenovatel: ${k3} · ${G.toString()} − ${j3} = ${f(den3)}.\n` +
      `     Dělení zlomkem znamená násobení jeho převrácenou hodnotou: ${f(num3)} · ${f(new Frac(den3.den, den3.num))} = ${f(r3)}.\n` +
      `     U podúlohy 2.3 se hodnotí i zápis postupu — samotný výsledek nestačí.`,
  };
};

/** Výsledek jako zlomek v základním tvaru, se správným znaménkem minus. */
function r3Fix(x: Frac): string {
  return x.toString();
}
/** Desetinný tvar jako alternativní přijímaná odpověď. */
function decAccept(x: Frac): string[] {
  const d = x.toDecimal(6);
  return d ? [d, d.replace(",", ".")] : [];
}

/* ================================================================== */
/* 3. Úpravy výrazů (poslední část s postupem)                         */
/* ================================================================== */

export const vyrazy: MathGen = (rng, points) => {
  const p3 = points - 2;

  // 3.1  ax − bx · c − d · (−ex)  =  (a − bc + de)x
  const a1 = rng.int(2, 9), b1 = rng.int(2, 5), c1 = rng.int(2, 4);
  const d1 = rng.int(2, 4), e1 = rng.int(1, 4);
  const k1 = a1 - b1 * c1 + d1 * e1;
  const ans1 = k1 === 0 ? "0" : k1 === 1 ? "x" : k1 === -1 ? "−x" : `${n(k1)}x`;

  // 3.2  rozklad na součin
  let prompt2: string, ans2: string, acc2: string[], why2: string;
  if (rng.chance(0.5)) {
    // vzorec a² − b²:  m² − kn + kn · (1 − jn)  =  m² − (dn)²
    const d = rng.pick([2, 3, 4, 5]);
    const divisors = [];
    for (let i = 1; i <= d * d; i++) if ((d * d) % i === 0) divisors.push(i);
    const k = rng.pick(divisors.filter((x) => x > 1 && x < d * d));
    const j = (d * d) / k;
    const m = rng.pick([1, 1, 2, 3]);
    prompt2 = `Upravte a rozložte na součin užitím vzorce:\n${m * m} − ${k}n + ${k}n · (1 − ${j}n) =`;
    ans2 = `(${m} + ${d}n)(${m} − ${d}n)`;
    acc2 = [
      `(${m}+${d}n)(${m}-${d}n)`,
      `(${m}-${d}n)(${m}+${d}n)`,
      `(${d}n+${m})(${m}-${d}n)`,
      `(${m}+${d}n)·(${m}-${d}n)`,
    ];
    why2 =
      `Nejprve roznásobíme: ${m * m} − ${k}n + ${k}n − ${k * j}n² = ${m * m} − ${d * d}n².\n` +
      `To je rozdíl druhých mocnin, tedy podle vzorce a² − b² = (a + b)(a − b): (${m} + ${d}n)(${m} − ${d}n).`;
  } else {
    // vytknutí:  (a − kb) · b − b² + k·b²  =  b(a − b)
    const k = rng.int(2, 5);
    prompt2 = `Upravte a rozložte na součin vytknutím:\n(a − ${k}b) · b − b² + ${k}b² =`;
    ans2 = "b(a − b)";
    acc2 = ["b(a-b)", "(a-b)b", "b·(a-b)", "-b(b-a)"];
    why2 =
      `Roznásobíme: ab − ${k}b² − b² + ${k}b² = ab − b².\n` +
      `Vytkneme b: ab − b² = b(a − b).`;
  }

  // 3.3  (ay + by)(y − 1) + (1 − ky)(ky + 1)  =  1 − k²y,  je-li a + b = k²
  const k3 = rng.pick([2, 3, 4]);
  const sq = k3 * k3;
  const a3 = rng.int(1, sq - 1);
  const b3 = sq - a3;
  const ans3 = `1 − ${sq}y`;

  return {
    prompt: "",
    parts: [
      open(
        "1",
        `Upravte na co nejjednodušší tvar bez závorek:\n${a1}x − ${b1}x · ${c1} − ${d1} · (−${e1}x) =`,
        ans1,
        1,
        { accept: [`${k1}x`, `${k1}·x`] },
      ),
      open("2", prompt2, ans2, 1, { accept: acc2 }),
      work(
        "3",
        `Upravte na co nejjednodušší tvar bez závorek:\n` +
          `(${a3 === 1 ? "" : a3}y + ${b3 === 1 ? "" : b3}y) · (y − 1) + (1 − ${k3}y) · (${k3}y + 1) =`,
        ans3,
        p3,
        { accept: [`1-${sq}y`, `−${sq}y + 1`, `-${sq}y+1`] },
      ),
    ],
    solution:
      `3.1  ${a1}x − ${b1 * c1}x + ${d1 * e1}x = ${ans1}.\n` +
      `3.2  ${why2}\n` +
      `3.3  První součin: (${a3} + ${b3})y · (y − 1) = ${sq}y² − ${sq}y.\n` +
      `     Druhý součin je podle vzorce (1 − ${k3}y)(1 + ${k3}y) = 1 − ${sq}y².\n` +
      `     Dohromady: ${sq}y² − ${sq}y + 1 − ${sq}y² = ${ans3}.\n` +
      `     U podúlohy 3.3 se hodnotí i zápis postupu.`,
  };
};

/* ================================================================== */
/* 4. Rovnice a soustava rovnic (obojí s postupem)                     */
/* ================================================================== */

export const rovnice: MathGen = (rng, points) => {
  const half = Math.floor(points / 2);

  // 4.1  p · (ax + b) + c = p · (d − ex)
  const root = rng.pick([-4, -3, -2, -1, 0.5, 1, 1.5, 2, 3, -0.5]);
  const pf = rng.pick([new Frac(1, 2), new Frac(1, 2), new Frac(1, 4), new Frac(3, 2)]);
  const a = rng.int(2, 5), b = rng.int(1, 6), d = rng.int(1, 8), e = rng.int(1, 5);
  // c = p·d − p·b − p(a+e)·root
  const c = pf.mul(new Frac(d)).sub(pf.mul(new Frac(b))).sub(pf.mul(new Frac(a + e)).mul(fracOf(root)));
  const cTxt = c.isInt ? cz(c.value) : f(c);
  const eq1 = `${pf.toString()} · (${a}x + ${b}) ${c.value >= 0 ? "+" : "−"} ${cTxt.replace("−", "")} = ${pf.toString()} · (${d} − ${e}x)`;

  if (rng.chance(0.55)) {
    // 4.2 jako soustava — klíč Cermatu uznává 1 bod za jednu správnou neznámou,
    // proto ji dělíme na dvě samostatná pole po 1 bodu.
    const x0 = rng.int(-6, 8);
    const y0 = rng.int(-8, 7);
    const a1 = rng.int(1, 5);
    const b1 = rng.pick([-3, -2, -1, 1, 2, 3]);
    const a2 = rng.chance(0.5) ? a1 : rng.int(1, 5);
    let b2 = rng.pick([-3, -2, -1, 1, 2, 3]);
    if (a1 * b2 - a2 * b1 === 0) b2 = b1 + 1;
    const c1 = a1 * x0 + b1 * y0;
    const c2 = a2 * x0 + b2 * y0;
    const line = (A: number, B: number, C: number) =>
      `${A === 1 ? "" : A}x ${B >= 0 ? "+" : "−"} ${Math.abs(B) === 1 ? "" : Math.abs(B)}y = ${n(C)}`;

    return {
      prompt: "V záznamovém archu uveďte v obou částech úlohy celý postup řešení (zkoušku nezapisujte).",
      parts: [
        work("1", `Řešte rovnici:\n${eq1}`, `x = ${n(root)}`, points - half, {
          accept: [n(root), String(root), cz(root)],
        }),
        work(
          "2",
          `Řešte soustavu rovnic:\n${line(a1, b1, c1)}\n${line(a2, b2, c2)}\n\nZapište x:`,
          String(x0),
          Math.ceil(half / 2),
          { accept: [`x = ${x0}`] },
        ),
        work("3", "Zapište y:", String(y0), Math.floor(half / 2), { accept: [`y = ${y0}`] }),
      ],
      solution:
        `4.1  Roznásobíme závorky, neznámé převedeme na jednu stranu a čísla na druhou.\n` +
        `     x = ${n(root)}\n` +
        `4.2  Sečtením či odečtením rovnic vyloučíme jednu neznámou (koeficienty u x jsou ` +
        `${a1 === a2 ? "stejné, takže rovnice stačí odečíst" : "různé, rovnice proto nejprve vynásobíme"}).\n` +
        `     x = ${x0}, y = ${y0}\n` +
        `     Zkouška: po dosazení platí obě rovnice.\n` +
        `     Klíč Cermatu dává 1 bod i tehdy, je-li správně vypočtena jen jedna z neznámých.`,
    };
  }

  // 4.2 jako rovnice se zlomky:  (m + y)/q = r − (s + ty)/(q·u)
  const y0 = rng.int(-8, 10);
  const q = rng.pick([2, 3, 4, 5]);
  const u = rng.pick([2, 3, 4]);
  const Q = q * u;
  const m = rng.int(1, 9);
  const t = rng.int(2, 6);
  const sVal = rng.int(1, 9);
  // (m + y)/q + (s + t y)/Q = r   ->  r = ((m+y)·u + s + t·y)/Q
  const rNum = (m + y0) * u + sVal + t * y0;
  const rFrac = new Frac(rNum, Q);
  const eq2 =
    `(${m} + y) / ${q} = ${rFrac.isInt ? cz(rFrac.value) : f(rFrac)} − (${sVal} + ${t}y) / ${Q}`;

  return {
    prompt: "V záznamovém archu uveďte v obou částech úlohy celý postup řešení (zkoušku nezapisujte).",
    parts: [
      work("1", `Řešte rovnici:\n${eq1}`, `x = ${n(root)}`, points - half, {
        accept: [n(root), String(root), cz(root)],
      }),
      work("2", `Řešte rovnici:\n${eq2}`, `y = ${y0}`, half, { accept: [String(y0)] }),
    ],
    solution:
      `4.1  Roznásobíme závorky, neznámé převedeme na jednu stranu a čísla na druhou.\n` +
      `     x = ${n(root)}\n` +
      `4.2  Obě strany vynásobíme společným jmenovatelem ${Q}, tím se zlomky odstraní.\n` +
      `     y = ${y0}\n` +
      `     Zkouška: po dosazení se levá strana rovná pravé.`,
  };
};

function fracOf(x: number): Frac {
  return Number.isInteger(x) ? new Frac(x) : new Frac(Math.round(x * 2), 2);
}

/* ================================================================== */
/* 5. Procenta ve slovní úloze                                         */
/* ================================================================== */

export const procenta: MathGen = (rng, points, ctx) => {
  const p1 = 1, p2 = points - 1;
  const base = rng.pick([200, 250, 300, 400, 500]);
  const perBase = rng.pick([20, 25, 30, 40, 50]);
  const mult = rng.int(2, 6);
  const total = base * mult;
  const correct = perBase * mult;
  const over = rng.pick([20, 25, 50, 75, 100, 150, 200]);
  const used = correct + (correct * over) / 100;

  if (!Number.isInteger(used)) {
    // spadne na bezpečnou variantu s celočíselným výsledkem
    const used2 = correct * 2;
    return {
      stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
      stimulus:
        `František dal do svého salátu obsahujícího ${cz(total)} g rajčat celkem ${cz(used2)} g cukru.\n` +
        `Podle receptu však do salátu patří na každých ${cz(base)} g rajčat pouze ${cz(perBase)} g cukru.`,
      prompt: "Vypočtěte,",
      parts: [
        open("1", "kolik gramů cukru měl dát František podle receptu do svého salátu,", String(correct), p1, { unit: "g" }),
        open("2", "o kolik procent více cukru dal do salátu, než měl dát podle receptu.", "100", p2, { unit: "%" }),
      ],
      solution:
        `5.1  ${cz(total)} : ${cz(base)} = ${mult}, tedy ${mult} · ${cz(perBase)} = ${cz(correct)} g cukru.\n` +
        `5.2  Dal ${cz(used2)} g místo ${cz(correct)} g, tedy o ${cz(correct)} g více. ` +
        `${cz(correct)} je 100 % z ${cz(correct)}, cukru dal tedy o 100 % více.`,
    };
  }

  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus:
      `František dal do svého salátu obsahujícího ${cz(total)} g rajčat celkem ${cz(used)} g cukru.\n` +
      `Podle receptu však do salátu patří na každých ${cz(base)} g rajčat pouze ${cz(perBase)} g cukru.`,
    prompt: "Vypočtěte,",
    parts: [
      open("1", "kolik gramů cukru měl dát František podle receptu do svého salátu,", String(correct), p1, { unit: "g" }),
      open("2", "o kolik procent více cukru dal do salátu, než měl dát podle receptu.", String(over), p2, { unit: "%" }),
    ],
    solution:
      `5.1  ${cz(total)} g rajčat je ${cz(total)} : ${cz(base)} = ${mult}násobek receptové dávky, ` +
      `takže cukru patří ${mult} · ${cz(perBase)} = ${cz(correct)} g.\n` +
      `5.2  Navíc dal ${cz(used)} − ${cz(correct)} = ${cz(used - correct)} g. ` +
      `1 % z ${cz(correct)} je ${cz(correct / 100)} g, tedy ${cz(used - correct)} : ${cz(correct / 100)} = ${over} %.`,
  };
};

/* ================================================================== */
/* 6. Vyjádření slovní úlohy výrazem s proměnnou                       */
/* ================================================================== */

export const modelovani: MathGen = (rng, points, ctx) => {
  const pts = [1, 1, points - 2];
  const cheap = rng.pick([20, 25, 30, 40, 50]);
  const up = rng.pick([25, 50, 75, 100, 150]);
  const dear = cheap + (cheap * up) / 100;
  if (!Number.isInteger(dear)) return modelovani(rng, points, ctx);

  const cheapCount = rng.int(80, 260);
  const dearCount = rng.int(80, 260);
  const total = cheapCount + dearCount;
  const revenue = cheap * cheapCount + dear * dearCount;

  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus:
      `Na vánočním jarmarku prodávali ve stánku pouze čaj a punč.\n` +
      `Čaj prodávali za ${cz(cheap)} korun a cena punče byla o ${up} % vyšší než cena čaje.`,
    prompt: "",
    parts: [
      open("1", "Vypočtěte v korunách cenu jednoho punče.", String(dear), pts[0], { unit: "Kč" }),
      open(
        "2",
        `Počet čajů, které ve stánku prodali, označíme x.\n` +
          `Vyjádřete výrazem s proměnnou x, kolik korun utržili za všechny prodané čaje.`,
        `${cheap}x`,
        pts[1],
        { accept: [`${cheap}·x`, `x·${cheap}`, `${cheap} x`] },
      ),
      open(
        "3",
        `Ve stánku prodali celkem ${cz(total)} nápojů a utržili za ně dohromady ${cz(revenue)} korun.\n` +
          `Vypočtěte, kolik čajů ve stánku prodali.`,
        String(cheapCount),
        pts[2],
      ),
    ],
    solution:
      `6.1  ${up} % z ${cz(cheap)} Kč je ${cz((cheap * up) / 100)} Kč, punč tedy stojí ` +
      `${cz(cheap)} + ${cz((cheap * up) / 100)} = ${cz(dear)} Kč.\n` +
      `6.2  Za x čajů po ${cz(cheap)} Kč utrží ${cheap}x korun.\n` +
      `6.3  Punčů prodali (${cz(total)} − x), takže ${cheap}x + ${dear}(${cz(total)} − x) = ${cz(revenue)}.\n` +
      `     ${cheap}x + ${cz(dear * total)} − ${dear}x = ${cz(revenue)}  ⟹  ${cz(dear - cheap)}x = ${cz(dear * total - revenue)}  ⟹  x = ${cz(cheapCount)}.\n` +
      `     Prodali ${cz(cheapCount)} čajů a ${cz(dearCount)} punčů.`,
  };
};

/* ================================================================== */
/* 7. Tělesa a objemy                                                  */
/* ================================================================== */

export const telesa: MathGen = (rng, points, ctx) => {
  const p1 = 1, p2 = points - 1;

  if (rng.chance(0.5)) {
    const a = rng.int(2, 6);
    const V = a ** 3;
    const [kx, ky, kz] = [rng.int(2, 4), rng.int(2, 4), rng.int(2, 5)];
    const bigV = V * kx * ky * kz;
    return {
      stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
      stimulus:
        `Velký kvádr je složen z ${kx} · ${ky} · ${kz} shodných krychlí.\n` +
        `Objem jedné takové krychle je ${cz(V)} cm³.`,
      prompt: "Vypočtěte",
      parts: [
        open("1", "v cm délku hrany jedné krychle,", String(a), p1, { unit: "cm" }),
        open("2", "v cm³ objem celého kvádru.", String(bigV), p2, { unit: "cm³" }),
      ],
      solution:
        `7.1  Hrana krychle je třetí odmocnina objemu: ${a} · ${a} · ${a} = ${cz(V)}, tedy a = ${a} cm.\n` +
        `7.2  Krychlí je ${kx} · ${ky} · ${kz} = ${kx * ky * kz}, objem kvádru je ${kx * ky * kz} · ${cz(V)} = ${cz(bigV)} cm³.\n` +
        `     (Rozměry kvádru jsou ${a * kx} cm, ${a * ky} cm a ${a * kz} cm — součin dá totéž.)`,
    };
  }

  // obdélník se šedou částí: strana z obvodu, pak obsah šedé části
  const ab = rng.int(8, 20);
  const bc = rng.int(4, 14);
  const obvod = 2 * (ab + bc);
  const dil = rng.pick([2, 3, 4]);
  const grey = (ab * bc) / dil;
  if (!Number.isInteger(grey)) return telesa(rng, points, ctx);

  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus:
      `Obdélník ABCD má obvod ${cz(obvod)} cm a stranu BC dlouhou ${cz(bc)} cm.\n` +
      `Šedý obdélník má tutéž výšku a jeho šířka je ${dil}krát menší než strana AB.`,
    prompt: "Vypočtěte",
    parts: [
      open("1", "v cm délku strany AB obdélníku ABCD,", String(ab), p1, { unit: "cm" }),
      open("2", "v cm² obsah šedého obdélníku.", String(grey), p2, { unit: "cm²" }),
    ],
    solution:
      `7.1  Obvod = 2 · (AB + BC), tedy AB = ${cz(obvod)} : 2 − ${cz(bc)} = ${cz(obvod / 2)} − ${cz(bc)} = ${cz(ab)} cm.\n` +
      `7.2  Šířka šedého obdélníku je ${cz(ab)} : ${dil} = ${cz(ab / dil)} cm, obsah tedy ${cz(ab / dil)} · ${cz(bc)} = ${cz(grey)} cm².`,
  };
};

/* ================================================================== */
/* 8. Trojúhelník — nerovnost nebo úhly                                */
/* ================================================================== */

/** Trojúhelník s Thaletovou kružnicí a osou vnitřního úhlu při B. */
function thalesSvg(alpha: number): string {
  const R = 95, ML = 40, MT = 30, MB = 34, MR = 40;
  const cx = ML + R, cy = MT + R;
  const A = [cx - R, cy], B = [cx + R, cy];
  const rad = (d: number) => (d * Math.PI) / 180;
  const C = [cx + R * Math.cos(rad(180 - 2 * alpha)) * -1, cy - R * Math.sin(rad(2 * alpha))];
  // C na kružnici pod úhlem 2α měřeno od B
  C[0] = cx + R * Math.cos(rad(2 * alpha));
  C[1] = cy - R * Math.sin(rad(2 * alpha));
  const phi = (90 - alpha) / 2;
  // průsečík osy z B s kolmicí x = C[0]
  const t = (B[0] - C[0]) / Math.cos(rad(phi));
  const P = [C[0], B[1] - t * Math.sin(rad(phi))];

  const txt = (x: number, y: number, s: string, anchor = "middle", size = 12) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="currentColor">${s}</text>`;

  return svg(
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="currentColor" stroke-width="1" opacity="0.45"/>` +
      `<polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}" fill="rgba(16,185,129,0.10)" stroke="currentColor" stroke-width="1.7"/>` +
      `<line x1="${C[0]}" y1="${MT - 12}" x2="${C[0]}" y2="${cy + 34}" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>` +
      `<line x1="${B[0]}" y1="${B[1]}" x2="${C[0] - 26}" y2="${B[1] - (B[0] - C[0] + 26) * Math.tan(rad(phi))}" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>` +
      `<circle cx="${cx}" cy="${cy}" r="2.4" fill="currentColor"/>` +
      txt(cx, cy + 16, "S") +
      txt(A[0] - 10, A[1] + 5, "A") +
      txt(B[0] + 10, B[1] + 5, "B") +
      txt(C[0] - 11, C[1] - 6, "C") +
      txt(C[0] + 16, MT - 4, "q", "start") +
      txt(C[0] - 34, P[1] - 8, "o", "end") +
      txt(C[0] + 6, P[1] - 6, "100°".replace("100", String(90 + phi)), "start", 11) +
      txt(A[0] + 26, A[1] - 7, "α", "middle", 12) +
      txt(B[0] - 28, B[1] - 10, "φ", "middle", 12),
    ML + 2 * R + MR,
    MT + R + MB + 26,
  );
}

export const trojuhelnik: MathGen = (rng, points) => {
  const pts = splitPoints(points, 2);

  if (rng.chance(0.5)) {
    // trojúhelníková nerovnost
    let a = rng.int(4, 15), b = rng.int(16, 40);
    if (a > b) [a, b] = [b, a];
    const minC = b - a + 1;
    const maxC = a + b - 1;
    return {
      stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
      stimulus:
        `Délky dvou stran trojúhelníku ABC jsou a = ${a} cm, b = ${b} cm.\n` +
        `Obvod trojúhelníku ABC v cm je vyjádřen celým číslem.`,
      prompt: "Určete, kolik cm musí měřit strana c trojúhelníku ABC, aby byl jeho obvod",
      parts: [
        open("1", "nejmenší možný,", String(minC), pts[0], { unit: "cm" }),
        open("2", "největší možný.", String(maxC), pts[1], { unit: "cm" }),
      ],
      solution:
        `Podle trojúhelníkové nerovnosti musí platit b − a < c < a + b, tedy ${b - a} < c < ${a + b}.\n` +
        `8.1  Nejmenší celé číslo v tomto rozmezí je c = ${minC} cm (obvod ${a + b + minC} cm).\n` +
        `8.2  Největší celé číslo je c = ${maxC} cm (obvod ${a + b + maxC} cm).\n` +
        `Krajní hodnoty ${b - a} a ${a + b} nevyhovují — trojúhelník by se zploštil do úsečky.`,
    };
  }

  // úhly: S leží na AB (Thaletova kružnice) ⟹ úhel při C je pravý
  const phi = rng.pick([5, 10, 15, 20, 25, 30, 35]);
  const marked = 90 + phi;
  const alpha = 90 - 2 * phi;
  return {
    stimulusTitle: "VÝCHOZÍ TEXT A OBRÁZEK K ÚLOZE",
    stimulus:
      `Na obrázku je trojúhelník ABC.\n` +
      `Přímka o je osou jeho vnitřního úhlu při vrcholu B.\n` +
      `Přímka q prochází vrcholem C a je kolmá ke straně AB tohoto trojúhelníku.\n` +
      `Na straně AB leží střed S kružnice k opsané trojúhelníku ABC.\n` +
      `Úhel, který v obrázku svírají přímky o a q, má velikost ${marked}°.`,
    figure: thalesSvg(alpha),
    prompt: "Vypočtěte ve stupních velikost úhlu (velikosti neměřte, obrázek je pouze ilustrativní)",
    parts: [
      open("1", "φ,", String(phi), pts[0], { unit: "°" }),
      open("2", "α.", String(alpha), pts[1], { unit: "°" }),
    ],
    solution:
      `Přímka q je kolmá k AB, svírá s ní tedy 90°. Přímka o svírá s AB úhel φ.\n` +
      `V trojúhelníku, který o, q a AB vytnou, platí 90° + φ + (180° − ${marked}°) = 180°, tedy φ = ${phi}°.\n` +
      `8.1  φ = ${phi}°\n` +
      `Protože o je osa úhlu při B, je |∡ABC| = 2φ = ${2 * phi}°.\n` +
      `Střed S kružnice opsané leží na straně AB, takže AB je průměr — podle Thaletovy věty je úhel při C pravý.\n` +
      `8.2  α = 180° − 90° − ${2 * phi}° = ${alpha}°`,
  };
};

/* ================================================================== */
/* 9. a 10. Konstrukční úlohy                                          */
/* ================================================================== */

/** Zadané prvky konstrukce: body a přímky v obecné poloze. */
function givensSvg(
  items: Array<
    | { t: "point"; x: number; y: number; label: string }
    | { t: "line"; x1: number; y1: number; x2: number; y2: number; label: string }
  >,
  w = 320,
  h = 210,
): string {
  let body = "";
  for (const it of items) {
    if (it.t === "point") {
      body +=
        `<circle cx="${it.x}" cy="${it.y}" r="3" fill="currentColor"/>` +
        `<text x="${it.x + 8}" y="${it.y - 6}" font-size="13" fill="currentColor">${it.label}</text>`;
    } else {
      body +=
        `<line x1="${it.x1}" y1="${it.y1}" x2="${it.x2}" y2="${it.y2}" stroke="currentColor" stroke-width="1.5"/>` +
        `<text x="${it.x2 - 4}" y="${it.y2 - 8}" font-size="13" fill="currentColor">${it.label}</text>`;
    }
  }
  return svg(body, w, h);
}

type ConstructionTask = {
  stimulus: string;
  figure: string;
  prompt: string;
  postup: string[];
  hodnoceni: string;
};

function constructionVariants(rng: Rng): ConstructionTask[] {
  const jitter = (v: number, d: number) => v + rng.int(-d, d);

  return [
    {
      stimulus: "V rovině leží bod A a přímky b, c.",
      figure: givensSvg([
        { t: "line", x1: 20, y1: jitter(40, 10), x2: 300, y2: jitter(70, 10), label: "b" },
        { t: "line", x1: 30, y1: jitter(180, 12), x2: 300, y2: jitter(150, 12), label: "c" },
        { t: "point", x: jitter(110, 20), y: jitter(115, 10), label: "A" },
      ]),
      prompt:
        "Bod A je vrchol trojúhelníku ABC.\n" +
        "Strana AB tohoto trojúhelníku je kolmá k přímce b a vrchol B leží na přímce b.\n" +
        `Strana BC je o ${rng.int(2, 4)} cm delší než strana AB a vrchol C leží na přímce c.\n` +
        "Sestrojte vrcholy B, C trojúhelníku ABC, označte je písmeny a trojúhelník narýsujte.\n" +
        "Najděte všechna řešení.",
      postup: [
        "p; p ⊥ b, A ∈ p",
        "B; B ∈ p ∩ b",
        "|AB| změříme",
        "k; k(B; |AB| + rozdíl)",
        "C₁, C₂; C ∈ k ∩ c",
        "△ABC₁, △ABC₂",
      ],
      hodnoceni:
        "3 b — obě řešení sestrojena přesně a označena. " +
        "2 b — jedno z řešení chybí, nebo je kolmice nepřesná. " +
        "1 b — kolmice nepřesná a současně další nedostatek. 0 b — zcela chybná konstrukce.",
    },
    {
      stimulus: "V rovině leží body A, O, P.",
      figure: givensSvg([
        { t: "point", x: jitter(70, 15), y: jitter(150, 15), label: "A" },
        { t: "point", x: jitter(150, 15), y: jitter(120, 12), label: "O" },
        { t: "point", x: jitter(250, 15), y: jitter(60, 12), label: "P" },
      ]),
      prompt:
        "Bod A je vrchol pravidelného šestiúhelníku ABCDEF.\n" +
        "Přímka OP je osa strany AB tohoto šestiúhelníku.\n" +
        "Na polopřímce OP leží střed souměrnosti S šestiúhelníku ABCDEF.\n" +
        "Sestrojte vrcholy B, C, D, E, F šestiúhelníku, označte je písmeny a šestiúhelník narýsujte.",
      postup: [
        "o; o = přímka OP (osa strany AB)",
        "B; B je obrazem bodu A v osové souměrnosti podle o",
        "S; S ∈ ↦OP, |SA| = |AB| (střed pravidelného šestiúhelníku)",
        "k; k(S; |SA|)",
        "C, D, E, F; postupným nanášením délky |AB| na kružnici k",
        "šestiúhelník ABCDEF",
      ],
      hodnoceni:
        "2 b — správná konstrukce i označení. 1 b — mírná nepřesnost v jedné části. 0 b — zcela chybná konstrukce.",
    },
    {
      stimulus: "V rovině leží body A, B, D.",
      figure: givensSvg([
        { t: "point", x: jitter(80, 15), y: jitter(60, 10), label: "A" },
        { t: "point", x: jitter(230, 15), y: jitter(70, 10), label: "B" },
        { t: "point", x: jitter(150, 20), y: jitter(175, 12), label: "D" },
      ]),
      prompt:
        "Body A a B jsou vrcholy pravoúhlého trojúhelníku ABC s pravým úhlem při vrcholu C.\n" +
        "Body B a D jsou vrcholy pravoúhlého trojúhelníku BCD s pravým úhlem při vrcholu C.\n" +
        "(Vrcholy B a C jsou společnými vrcholy obou trojúhelníků.)\n" +
        "Sestrojte vrchol C, označte ho písmenem a narýsujte trojúhelníky ABC a BCD.",
      postup: [
        "k₁; Thaletova kružnice nad průměrem AB",
        "k₂; Thaletova kružnice nad průměrem BD",
        "C; C ∈ k₁ ∩ k₂, C ≠ B",
        "△ABC, △BCD",
      ],
      hodnoceni:
        "3 b — obě Thaletovy kružnice a správný průsečík. 2 b — jedna kružnice nepřesná. " +
        "1 b — sestrojena jen jedna kružnice. 0 b — zcela chybná konstrukce.",
    },
    {
      stimulus: "V rovině leží bod A a přímka o.",
      figure: givensSvg([
        { t: "line", x1: 30, y1: jitter(170, 12), x2: 295, y2: jitter(55, 12), label: "o" },
        { t: "point", x: jitter(95, 15), y: jitter(75, 12), label: "A" },
      ]),
      prompt:
        "Bod A je vrchol rovnoběžníku ABCD.\n" +
        "Přímka o je osou souměrnosti tohoto rovnoběžníku a leží na ní vrcholy B, D.\n" +
        "Úhlopříčka BD rovnoběžníku ABCD je dvakrát delší než úhlopříčka AC.\n" +
        "Sestrojte vrcholy B, C, D, označte je písmeny a rovnoběžník narýsujte.",
      postup: [
        "p; p ⊥ o, A ∈ p",
        "S; S ∈ p ∩ o (střed rovnoběžníku)",
        "C; C ∈ p, |SC| = |SA|, C ≠ A",
        "|AC| = 2 · |SA|, tedy |BD| = 4 · |SA|",
        "B, D; B, D ∈ o, |SB| = |SD| = 2 · |SA|",
        "rovnoběžník ABCD (kosočtverec)",
      ],
      hodnoceni:
        "2 b — kosočtverec s úhlopříčkou BD na ose o a se správným poměrem úhlopříček. " +
        "1 b — kosočtverec sestrojen, ale poměr délek úhlopříček nesouhlasí. 0 b — jinak.",
    },
  ];
}

function buildConstruction(rng: Rng, points: number, variant: ConstructionTask): GenResult {
  return {
    selfGraded: true,
    stimulusTitle: "VÝCHOZÍ TEXT A OBRÁZEK K ÚLOZE",
    stimulus: variant.stimulus,
    figure: variant.figure,
    prompt: variant.prompt + "\nRýsujte na papír; po vyhodnocení si konstrukci sami ohodnoťte.",
    parts: [
      {
        id: "",
        prompt: "Zapište postup konstrukce:",
        format: "construction",
        answer: "—",
        points,
      },
    ],
    solution:
      "Postup konstrukce:\n" +
      variant.postup.map((s, i) => `   ${i + 1}. ${s}`).join("\n") +
      `\n\nHodnocení: ${variant.hodnoceni}`,
  };
}

/** Úloha 9 — rozhoduje semínko; úloha 10 dostane jinou variantu. */
export const konstrukce1: MathGen = (rng, points) => {
  const v = constructionVariants(rng);
  return buildConstruction(rng, points, v[rng.int(0, 1)]);
};

export const konstrukce2: MathGen = (rng, points) => {
  const v = constructionVariants(rng);
  return buildConstruction(rng, points, v[rng.int(2, 3)]);
};

/* ================================================================== */
/* 11. Dichotomická úloha A/N nad diagramem                            */
/* ================================================================== */

/** Kruhový diagram se čtyřmi výsečemi. Popisky leží vně kruhu a nesmí se oříznout. */
function pieSvg(parts: Array<{ label: string; pct: number }>): string {
  const R = 72, cx = 190, cy = 120, W = 380, H = 254;
  const fills = [
    "rgba(99,102,241,0.30)",
    "rgba(16,185,129,0.30)",
    "rgba(245,158,11,0.32)",
    "rgba(148,163,184,0.32)",
  ];
  let angle = -90;
  let body = "";

  parts.forEach((p, i) => {
    const sweep = (p.pct / 100) * 360;
    const a0 = (angle * Math.PI) / 180;
    const a1 = ((angle + sweep) * Math.PI) / 180;
    const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    body +=
      `<path d="M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${sweep > 180 ? 1 : 0} 1 ${x1} ${y1} Z" ` +
      `fill="${fills[i % 4]}" stroke="currentColor" stroke-width="1.2"/>`;

    // popisek vně výseče; zarovnání podle toho, na které straně kruhu leží
    const am = ((angle + sweep / 2) * Math.PI) / 180;
    const c = Math.cos(am), sn = Math.sin(am);
    const lx = cx + (R + 16) * c;
    const ly = cy + (R + 16) * sn;
    const anchor = c > 0.25 ? "start" : c < -0.25 ? "end" : "middle";
    const dy = sn > 0.45 ? 14 : sn < -0.45 ? -7 : 4;
    body +=
      `<text x="${lx}" y="${ly + dy}" text-anchor="${anchor}" font-size="12" ` +
      `fill="currentColor">${p.label}</text>`;
    angle += sweep;
  });

  return svg(body, W, H);
}

export const anone: MathGen = (rng, points, _ctx) => {
  // podíly musí dát 100 % a dvě položky mají stejnou hmotnost
  const pEqual = rng.pick([10, 12, 15, 18, 20]);
  const pRice = rng.pick([30, 35, 40]);
  const pSugar = 100 - pRice - 2 * pEqual;
  if (pSugar <= 5) return anone(rng, points, _ctx);

  const unit = rng.pick([3, 4, 6, 9, 12]);
  const total = unit * 100 / gcd(unit, 1); // celková hmotnost tak, aby 1 % bylo celé
  const T = rng.pick([200, 300, 400, 600, 900]);
  const t = (p: number) => (T / 100) * p;
  void unit; void total;
  if (!Number.isInteger(t(pEqual)) || !Number.isInteger(t(pRice)) || !Number.isInteger(t(pSugar)))
    return anone(rng, points, _ctx);

  const parts = [
    { label: `rýže ${pRice} %`, pct: pRice },
    { label: "cukr", pct: pSugar },
    { label: `káva ${pEqual} %`, pct: pEqual },
    { label: "banány", pct: pEqual },
  ];

  // tři tvrzení, každé ověřitelné výpočtem
  const fracClaim = rng.pick([
    { txt: "dvě pětiny", val: 40 },
    { txt: "třetinu", val: 100 / 3 },
    { txt: "čtvrtinu", val: 25 },
    { txt: "polovinu", val: 50 },
  ]);
  const c1 = Math.abs(2 * pEqual - fracClaim.val) < 1e-9;

  const g = gcd(pEqual, pRice);
  const trueRatio = `${pEqual / g} : ${pRice / g}`;
  const shownRatio = rng.chance(0.5) ? trueRatio : `${pEqual / g + 1} : ${pRice / g}`;
  const c2 = shownRatio === trueRatio;

  const trueRice = t(pRice);
  const shownRice = rng.chance(0.5) ? trueRice : trueRice + rng.pick([-30, -12, 15, 24]);
  const c3 = shownRice === trueRice;

  const claims = [
    {
      text: `Káva a banány tvoří dohromady ${fracClaim.txt} celkové hmotnosti nákladu.`,
      truth: c1,
      why: `Káva a banány mají dohromady ${2 * pEqual} % celkové hmotnosti; ${fracClaim.txt} je ${cz(fracClaim.val)} %.`,
    },
    {
      text: `Poměr hmotnosti kávy ku hmotnosti rýže je ${shownRatio}.`,
      truth: c2,
      why: `Káva ${pEqual} %, rýže ${pRice} %, po zkrácení ${trueRatio}.`,
    },
    {
      text: `Loď veze ${cz(shownRice)} tun rýže.`,
      truth: c3,
      why: `Celkem ${cz(T)} t, rýže ${pRice} % z ${cz(T)} = ${cz(trueRice)} t.`,
    },
  ];

  return {
    stimulusTitle: "VÝCHOZÍ TEXT A DIAGRAM K ÚLOZE",
    stimulus:
      `Náklad na lodi se skládá pouze ze čtyř druhů zboží – rýže, cukru, kávy a banánů.\n` +
      `Loď veze ${cz(t(pEqual))} tun banánů a ${cz(t(pEqual))} tun kávy.\n` +
      `Diagram udává, jaký podíl na celkové hmotnosti nákladu mají jednotlivé druhy zboží.`,
    figure: pieSvg(parts),
    prompt: "Rozhodněte o každém z následujících tvrzení, zda je pravdivé (A), či nikoli (N).",
    parts: claims.map((c, i) => ({
      id: String(i + 1),
      prompt: c.text,
      format: "truefalse" as const,
      choices: [
        { key: "A", text: "A" },
        { key: "N", text: "N" },
      ],
      answer: c.truth ? "A" : "N",
      points: 0, // hodnotí se skupinově, viz ScoringMode "stepped"
    })),
    solution:
      `Banány i káva mají po ${pEqual} %, což je ${cz(t(pEqual))} t — z toho plyne celková hmotnost ` +
      `${cz(T)} t (${cz(t(pEqual))} : ${pEqual} · 100).\n` +
      claims.map((c, i) => `11.${i + 1}  ${c.truth ? "A" : "N"} — ${c.why}`).join("\n") +
      `\n\nHodnocení této úlohy není lineární: 3 správně → ${points} b, 2 správně → ${points / 2} b, ` +
      `1 nebo 0 správně → 0 b.`,
  };
};

/* ================================================================== */
/* 12.–14. Uzavřené úlohy s nabídkou A–E                               */
/* ================================================================== */

type ClosedTask = {
  stimulus?: string;
  prompt: string;
  value: number;
  /** Jak se hodnota vypíše v nabídce. */
  fmt: (v: number) => string;
  /** Nesprávné hodnoty — musí být různé a různé od správné. */
  wrong: number[];
  fallback: string;
  why: string;
  topic: "cislo" | "geometrie";
};

function closedPool(rng: Rng): ClosedTask[] {
  const out: ClosedTask[] = [];

  // rozšíření parkoviště: n míst = 1/k loni, p % letos
  {
    const n = rng.pick([12, 15, 18, 20, 24]);
    const k = rng.pick([20, 25, 40, 50]);
    const p = rng.pick([4, 5, 8, 10]);
    const last = n * k;
    const now = (n / p) * 100;
    if (Number.isInteger(now) && now > last) {
      out.push({
        stimulus:
          `Na parkovišti je ${n} míst vyhrazeno pro zásobování.\n` +
          `Zatímco loni tato místa představovala jednu ${k === 20 ? "dvacetinu" : k === 25 ? "dvacetipětinu" : k === 40 ? "čtyřicetinu" : "padesátinu"} celkové kapacity parkoviště,\n` +
          `letos díky rozšíření parkoviště představují tato místa pouze ${p} % celkové kapacity.`,
        prompt: "O kolik parkovacích míst se díky rozšíření parkoviště zvětšila jeho celková kapacita?",
        value: now - last,
        fmt: (v) => `o ${cz(v)} míst`,
        wrong: [now - last + 25, now - last - 25, Math.round((now - last) / 2)],
        fallback: "o jiný počet míst",
        why:
          `Loni: ${n} · ${k} = ${cz(last)} míst. Letos: ${n} je ${p} %, tedy 1 % = ${cz(n / p)} a kapacita ${cz(now)} míst.\n` +
          `Rozdíl: ${cz(now)} − ${cz(last)} = ${cz(now - last)} míst.`,
        topic: "cislo",
      });
    }
  }

  // obsah rovnoramenného trojúhelníku ze základny a obvodu
  {
    const [h, half, leg] = rng.pick(TRIPLES).slice() as [number, number, number];
    const base = 2 * half;
    const perim = base + 2 * leg;
    const area = (base * h) / 2;
    out.push({
      stimulus: `Rovnoramenný trojúhelník KLM se základnou LM délky ${base} cm má obvod ${perim} cm.`,
      prompt: "Jaký je obsah trojúhelníku KLM?",
      value: area,
      fmt: (v) => `${cz(v)} cm²`,
      wrong: [area * 2, base * leg, Math.round(area + leg * 2)],
      fallback: "jiný obsah",
      why:
        `Ramena: (${perim} − ${base}) : 2 = ${leg} cm. Výška k základně půlí základnu, ` +
        `takže v = √(${leg}² − ${half}²) = √${leg * leg - half * half} = ${h} cm.\n` +
        `S = ${base} · ${h} : 2 = ${cz(area)} cm².`,
      topic: "geometrie",
    });
  }

  // rozdíl výšek dvou hranolů daný rozdílem povrchů
  {
    const a = rng.pick([2, 3, 4, 5]);
    const dh = rng.int(2, 8);
    const dS = 4 * a * dh;
    out.push({
      stimulus:
        `První i druhý pravidelný čtyřboký hranol mají podstavnou hranu délky a = ${a} cm.\n` +
        `První hranol má o ${cz(dS)} cm² větší povrch než druhý hranol.`,
      prompt: "O kolik cm se liší výšky obou hranolů?",
      value: dh,
      fmt: (v) => `o ${cz(v)} cm`,
      wrong: [dh + 2, dh - 1, dh * 2],
      fallback: "o jiný počet cm",
      why:
        `Povrch je S = 2a² + 4a·v. Podstavy jsou stejné, takže rozdíl povrchů dělá jen plášť:\n` +
        `4 · ${a} · Δv = ${cz(dS)}  ⟹  Δv = ${cz(dS)} : ${4 * a} = ${dh} cm.`,
      topic: "geometrie",
    });
  }

  // povrch krychle s vyříznutými rohovými krychličkami
  {
    const A = rng.pick([8, 10, 12]);
    const m = rng.pick([2, 3, 4]);
    const cuts = rng.pick([2, 3, 4]);
    // vyříznutím rohové krychličky se povrch nemění: uberou se 3 stěny, přibudou 3
    const S = 6 * A * A;
    out.push({
      stimulus:
        `Z krychle o hraně délky ${A} cm byly vyříznuty ${cuts} shodné malé krychličky ` +
        `o hraně délky ${m} cm, a to vždy v rohu velké krychle.`,
      prompt: "Jaký je povrch nového tělesa?",
      value: S,
      fmt: (v) => `${cz(v)} cm²`,
      wrong: [S - cuts * 3 * m * m, S + cuts * 3 * m * m, S - cuts * m * m],
      fallback: "jiný povrch",
      why:
        `Vyříznutím rohové krychličky se odeberou tři čtvercové plošky o obsahu ${m}² cm² ` +
        `a současně se odkryjí tři stejně velké plošky uvnitř.\n` +
        `Povrch se proto nezmění: S = 6 · ${A}² = ${cz(S)} cm².`,
      topic: "geometrie",
    });
  }

  // cena druhého dílu: součet a rozdíl
  {
    const sum = rng.pick([300, 340, 420, 500]);
    const diff = rng.pick([20, 36, 60, 80]);
    const second = (sum - diff) / 2;
    if (Number.isInteger(second)) {
      out.push({
        stimulus:
          `Oba díly románu stály dohromady ${cz(sum)} korun.\n` +
          `První díl byl o ${cz(diff)} korun dražší než druhý díl.`,
        prompt: "Kolik korun stál druhý díl románu?",
        value: second,
        fmt: (v) => `${cz(v)} korun`,
        wrong: [second + diff, second + diff / 2, sum / 2],
        fallback: "jiná cena",
        why:
          `Kdyby byly díly stejně drahé, stály by dohromady ${cz(sum)} − ${cz(diff)} = ${cz(sum - diff)} Kč.\n` +
          `Druhý díl tedy stál ${cz(sum - diff)} : 2 = ${cz(second)} Kč (první ${cz(second + diff)} Kč).`,
        topic: "cislo",
      });
    }
  }

  // objem hranolu s trojúhelníkovou podstavou
  {
    const [c1, c2] = rng.pick(TRIPLES).slice(0, 2) as [number, number];
    const v = rng.int(3, 9);
    const V = ((c1 * c2) / 2) * v;
    out.push({
      stimulus:
        `Kolmý hranol má podstavu ve tvaru pravoúhlého trojúhelníku s odvěsnami ` +
        `${c1} cm a ${c2} cm. Výška hranolu je ${v} cm.`,
      prompt: "Jaký je objem hranolu?",
      value: V,
      fmt: (x) => `${cz(x)} cm³`,
      wrong: [V * 2, c1 * c2 * v, Math.round(V / 2)],
      fallback: "jiný objem",
      why:
        `Obsah podstavy: ${c1} · ${c2} : 2 = ${cz((c1 * c2) / 2)} cm².\n` +
        `V = S · v = ${cz((c1 * c2) / 2)} · ${v} = ${cz(V)} cm³.`,
      topic: "geometrie",
    });
  }

  // kolik pětic vytvořily děti
  {
    const groups = rng.int(9, 16);
    const rest = rng.int(1, 4);
    const total = groups * 5 + rest;
    out.push({
      stimulus:
        `Děti se pokusily rozdělit do pětic. Dětí bylo celkem ${total} ` +
        `a ${rest} ${plural(rest, "dítě zůstalo", "děti zůstaly", "dětí zůstalo")} bez skupiny.`,
      prompt: "Kolik pětic děti vytvořily?",
      value: groups,
      fmt: (x) => `${cz(x)} pětic`,
      wrong: [groups + 1, groups - 1, groups + 2],
      fallback: "jiný počet pětic",
      why: `(${total} − ${rest}) : 5 = ${cz(total - rest)} : 5 = ${groups} pětic.`,
      topic: "cislo",
    });
  }

  return out;
}

/**
 * Vybere `count` navzájem různých nesprávných hodnot, všechny různé
 * od správné. Nabídka, v níž se dvě možnosti shodují, by úlohu prozradila.
 */
function distinctWrong(rng: Rng, correct: number, hints: number[], count: number): number[] {
  const seen = new Set<number>([correct]);
  const out: number[] = [];
  for (const h of hints) {
    if (h > 0 && !seen.has(h)) {
      seen.add(h);
      out.push(h);
    }
    if (out.length === count) return out;
  }
  let step = 1;
  while (out.length < count && step < 200) {
    for (const cand of [correct + step, correct - step]) {
      if (cand > 0 && !seen.has(cand) && out.length < count) {
        seen.add(cand);
        out.push(cand);
      }
    }
    step += rng.int(1, 3);
  }
  return out;
}

/** Vyrobí uzavřenou úlohu; občas je správně až záchytná možnost. */
function buildClosed(rng: Rng, t: ClosedTask, points: number): GenResult {
  // v jednom případě ze čtyř správná hodnota v nabídce vůbec není
  const hidden = rng.chance(0.25);
  const wrong = distinctWrong(rng, t.value, t.wrong, hidden ? 4 : 3);
  const part = hidden
    ? choiceFallback(rng, "", "", wrong.map(t.fmt), t.fallback, points)
    : choicePart(rng, "", "", t.fmt(t.value), wrong.map(t.fmt), t.fallback, points);

  return {
    stimulusTitle: t.stimulus ? "VÝCHOZÍ TEXT K ÚLOZE" : undefined,
    stimulus: t.stimulus,
    prompt: t.prompt,
    parts: [part],
    solution:
      `${t.why}\n` +
      (hidden
        ? `Správná hodnota ${t.fmt(t.value)} v nabídce A–D není — správně je proto záchytná možnost „${t.fallback}“.`
        : `Správně je ${t.fmt(t.value)}.`),
  };
}

/** Sestaví kontext testu — tři různé uzavřené úlohy z fondu. */
export function makeMathCtx(rng: Rng): MathCtx {
  const pool = closedPool(rng);
  return { closed: rng.shuffle(pool).slice(0, 3) };
}

export const vyber1: MathGen = (rng, points, ctx) => buildClosed(rng, ctx.closed[0], points);
export const vyber2: MathGen = (rng, points, ctx) => buildClosed(rng, ctx.closed[1], points);
export const vyber3: MathGen = (rng, points, ctx) => buildClosed(rng, ctx.closed[2], points);

/* ================================================================== */
/* 15. Přiřazovací úloha se společnou nabídkou A–F                     */
/* ================================================================== */

export const prirazovani: MathGen = (rng, points) => {
  const per = points / 3;

  // tři krátké úlohy, jejichž výsledky jsou v téže jednotce a navzájem různé
  const build = (): Array<{ text: string; value: number; why: string }> | null => {
    const heavier = rng.pick([20, 24, 25, 30, 36]);
    const up = rng.pick([20, 25, 50]);
    const lighter = heavier / (1 + up / 100);

    const picked = rng.pick([40, 50, 60, 65, 75]);
    const totalBerries = rng.pick([20, 30, 40, 50]);
    const leftover = (totalBerries * (100 - picked)) / 100;

    const bagsTotal = rng.pick([30, 36, 42, 48]);
    const bagDiff = rng.pick([4, 6, 8, 10]);
    const smallerBag = (bagsTotal - bagDiff) / 2;

    const vals = [lighter, leftover, smallerBag];
    if (!vals.every((v) => Number.isInteger(v) && v > 0)) return null;
    if (new Set(vals).size !== 3) return null;

    return [
      {
        text: `Bedna s jablky váží ${cz(heavier)} kg a je o ${up} % těžší než bedna s hruškami. Kolik kg váží bedna s hruškami?`,
        value: lighter,
        why: `${cz(heavier)} kg je ${100 + up} % hmotnosti hrušek, tedy 1 % = ${cz(heavier / (100 + up))} kg a 100 % = ${cz(lighter)} kg.`,
      },
      {
        text: `Z nasbíraných jahod jsme ${picked} % použili na výrobu džemu, zbytek jsme snědli. Nasbírali jsme ${cz(totalBerries)} kg jahod. Kolik kg jsme snědli?`,
        value: leftover,
        why: `Snědli jsme ${100 - picked} % z ${cz(totalBerries)} kg, tedy ${cz(leftover)} kg.`,
      },
      {
        text: `Celková hmotnost dvou zavazadel je ${cz(bagsTotal)} kg. Jedno je o ${cz(bagDiff)} kg těžší než druhé. Kolik kg váží lehčí zavazadlo?`,
        value: smallerBag,
        why: `(${cz(bagsTotal)} − ${cz(bagDiff)}) : 2 = ${cz(smallerBag)} kg.`,
      },
    ];
  };

  let tasks = build();
  for (let i = 0; i < 40 && !tasks; i++) tasks = build();
  if (!tasks) {
    tasks = [
      { text: "Bedna s jablky váží 20 kg a je o 25 % těžší než bedna s hruškami. Kolik kg váží bedna s hruškami?", value: 16, why: "20 : 1,25 = 16 kg." },
      { text: "Z 30 kg jahod jsme 60 % použili na džem. Kolik kg jsme snědli?", value: 12, why: "40 % z 30 kg = 12 kg." },
      { text: "Dvě zavazadla váží 42 kg, jedno je o 6 kg těžší. Kolik váží lehčí?", value: 18, why: "(42 − 6) : 2 = 18 kg." },
    ];
  }

  // nabídka: tři správné hodnoty + dvě nesprávné + záchytná možnost
  const correct = tasks.map((t) => t.value);
  const extras = new Set<number>();
  let guard = 0;
  while (extras.size < 2 && guard++ < 60) {
    const v = rng.int(Math.max(1, Math.min(...correct) - 6), Math.max(...correct) + 8);
    if (!correct.includes(v)) extras.add(v);
  }
  const values = [...correct, ...Array.from(extras)].sort((a, b) => a - b);
  const offer: Choice[] = values.map((v, i) => ({ key: KEYS[i], text: `${cz(v)} kg` }));
  offer.push({ key: KEYS[values.length], text: "jiný počet kg" });

  return {
    prompt: "Přiřaďte ke každé úloze (15.1–15.3) odpovídající výsledek (A–F).",
    offer,
    parts: tasks.map((t, i) => ({
      id: String(i + 1),
      prompt: t.text,
      format: "match" as const,
      answer: offer[values.indexOf(t.value)].key,
      points: per,
    })),
    solution:
      tasks
        .map((t, i) => `15.${i + 1}  ${cz(t.value)} kg — ${t.why}`)
        .join("\n") + `\n\nZa každou správně přiřazenou podúlohu ${per} body.`,
  };
};

/* ================================================================== */
/* 16. Nestandardní aplikační úloha — simulace děje v čase             */
/* ================================================================== */

export const nestandardni: MathGen = (rng, points, ctx) => {
  const addEvery1 = rng.int(1, 2); // Jas přidá tolik míčků každou sekundu
  const dokEvery = rng.pick([2, 3]);
  const dokAmount = rng.int(2, 4);
  const patEvery = rng.pick([4, 5, 6]);
  const patAmount = rng.int(3, 6);

  const delta = (s: number) =>
    addEvery1 + (s % dokEvery === 0 ? dokAmount : 0) - (s % patEvery === 0 ? patAmount : 0);

  const LIMIT = 4000;
  const counts: number[] = [0];
  const deltas: number[] = [0];
  for (let s = 1; s <= LIMIT; s++) {
    const d = delta(s);
    deltas.push(d);
    counts.push(counts[s - 1] + d);
  }

  const atSecond = rng.pick([12, 14, 15, 16, 18, 20]);
  const target = rng.pick([25, 30, 35, 40]);
  const firstOver = counts.findIndex((c, i) => i > 0 && c > target);

  // třetí podúloha: kolikátá sekunda, v níž se počet změnil právě o zvolenou hodnotu
  const changeValue = addEvery1 + dokAmount; // sekunda, kdy přidávají oba a Pat nebere
  const nth = 30;
  let seen = 0;
  let nthSecond = -1;
  for (let s = 1; s <= LIMIT; s++) {
    if (deltas[s] === changeValue) {
      seen++;
      if (seen === nth) {
        nthSecond = s;
        break;
      }
    }
  }
  if (firstOver <= 0 || nthSecond < 0 || counts[atSecond] <= 0) return nestandardni(rng, points, ctx);

  const pts = [1, 1, points - 2];

  return {
    stimulusTitle: "VÝCHOZÍ TEXT K ÚLOZE",
    stimulus:
      `Po spuštění automatu začali dva roboti Jas a Dok plnit prázdnou nádobu míčky\n` +
      `a třetí robot Pat začal míčky odebírat.\n` +
      `Jas dal do nádoby v každé sekundě ${addEvery1} ${plural(addEvery1, "míček", "míčky", "míčků")},\n` +
      `Dok dal do nádoby v každé ${dokEvery === 2 ? "druhé" : "třetí"} sekundě ${dokAmount} ${plural(dokAmount, "míček", "míčky", "míčků")} najednou\n` +
      `a Pat v každé ${patEvery === 4 ? "čtvrté" : patEvery === 5 ? "páté" : "šesté"} sekundě z nádoby ${patAmount} ${plural(patAmount, "míček", "míčky", "míčků")} najednou odebral.`,
    prompt: "",
    parts: [
      open("1", `Určete počet míčků v nádobě na konci ${atSecond}. sekundy po spuštění automatu.`, String(counts[atSecond]), pts[0]),
      open("2", `Určete, v kolikáté sekundě po spuštění počet míčků v nádobě poprvé překročil ${target}.`, String(firstOver), pts[1]),
      open(
        "3",
        `V některých sekundách se oproti předchozí sekundě změnil počet míčků v nádobě celkem o ${changeValue}.\n` +
          `Určete počet míčků v nádobě v okamžiku, kdy k této změně došlo právě po třicáté.`,
        String(counts[nthSecond]),
        pts[2],
      ),
    ],
    solution:
      `Děj se opakuje s periodou ${dokEvery * patEvery} sekund — stačí spočítat jednu periodu a pak násobit.\n` +
      `Za ${dokEvery * patEvery} sekund přibude ${counts[dokEvery * patEvery]} ${plural(counts[dokEvery * patEvery], "míček", "míčky", "míčků")}.\n` +
      `16.1  Na konci ${atSecond}. sekundy je v nádobě ${counts[atSecond]} ${plural(counts[atSecond], "míček", "míčky", "míčků")}.\n` +
      `16.2  Hranici ${target} počet poprvé překročí ve ${firstOver}. sekundě (tehdy je v nádobě ${counts[firstOver]}).\n` +
      `16.3  Změna o ${changeValue} nastane v každé sekundě, kdy přidávají Jas i Dok a Pat neodebírá.\n` +
      `      Po třicáté k ní dojde v ${nthSecond}. sekundě a v nádobě je tehdy ${counts[nthSecond]} ${plural(counts[nthSecond], "míček", "míčky", "míčků")}.`,
  };
};

/** Rejstřík generátorů — klíč odpovídá poli `gen` v plánu testu. */
export const MATH_GENERATORS: Record<string, MathGen> = {
  uvod,
  zlomky,
  vyrazy,
  rovnice,
  procenta,
  modelovani,
  telesa,
  trojuhelnik,
  konstrukce1,
  konstrukce2,
  anone,
  vyber1,
  vyber2,
  vyber3,
  prirazovani,
  nestandardni,
};
