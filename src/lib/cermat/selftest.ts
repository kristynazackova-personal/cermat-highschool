/**
 * Kontrola generátoru. Spouští se příkazem `npm test`.
 *
 * Ověřuje na tisících vygenerovaných testů, že:
 *  - plán sedí na parametry zkoušky (počet úloh, součet bodů),
 *  - body podúloh se sečtou na bodovou dotaci úlohy,
 *  - každá uzavřená úloha má právě jednu správnou odpověď v nabídce,
 *  - vzorové řešení projde vlastním vyhodnocením na plný počet bodů,
 *  - v nabídkách se neopakují dvě shodné možnosti.
 */
import { generateTest, scoreTest } from "./build";
import { verifyBlueprint, type Subject } from "./spec";
import { Rng } from "./rng";

let failures = 0;
const seen = new Set<string>();

function fail(msg: string) {
  if (seen.has(msg)) return;
  seen.add(msg);
  failures++;
  console.error("  ✗ " + msg);
}

function check(label: string, ok: boolean, detail = "") {
  if (!ok) fail(`${label}${detail ? " — " + detail : ""}`);
}

console.log("Kontrola plánu testu");
for (const s of ["matematika", "cestina"] as Subject[]) {
  const v = verifyBlueprint(s);
  check(
    `plán ${s}`,
    v.ok,
    `úloh ${v.tasks}/${v.expectedTasks}, bodů ${v.points}/${v.expectedPoints}`,
  );
  console.log(`  ${v.ok ? "✓" : "✗"} ${s}: ${v.tasks} úloh, ${v.points} bodů`);
}

const RUNS = Number(process.env.RUNS ?? 2000);
console.log(`\nKontrola ${RUNS} vygenerovaných testů z každého předmětu`);

for (const subject of ["matematika", "cestina"] as Subject[]) {
  const rnd = new Rng(20260923);
  for (let i = 0; i < RUNS; i++) {
    const seed = rnd.int(0, 2 ** 30);
    const test = generateTest(subject, seed);

    check(`${subject}: součet bodů testu`, test.totalPoints === 50, `${test.totalPoints}`);
    check(`${subject}: počet úloh`, test.tasks.length === (subject === "matematika" ? 16 : 30));

    const perfect: Record<string, string> = {};
    const selfScores: Record<string, number> = {};

    for (const task of test.tasks) {
      const sum = task.parts.reduce((s, p) => s + p.points, 0);
      check(
        `${subject}/úloha ${task.n}: body podúloh se nesečtou na dotaci úlohy`,
        sum === task.points,
        `${sum} ≠ ${task.points}`,
      );
      check(`${subject}/úloha ${task.n}: prázdné zadání`, task.prompt.trim().length > 0);
      check(`${subject}/úloha ${task.n}: chybí řešení`, task.solution.trim().length > 0);

      for (const part of task.parts) {
        const key = `${task.n}.${part.id}`;

        if (part.format === "choice" || part.format === "truefalse") {
          check(`${subject}/úloha ${task.n}: uzavřená úloha bez nabídky`, !!part.choices);
          const keys = part.choices!.map((c) => c.key);
          check(
            `${subject}/úloha ${task.n}: správná odpověď není v nabídce`,
            keys.includes(part.answer),
          );
          const texts = part.choices!.map((c) => c.text.trim());
          check(
            `${subject}/úloha ${task.n}: v nabídce jsou dvě shodné možnosti`,
            new Set(texts).size === texts.length,
            texts.join(" | "),
          );
          check(
            `${subject}/úloha ${task.n}: prázdná možnost v nabídce`,
            texts.every((t) => t.length > 0),
          );
        } else if (part.format === "construction") {
          selfScores[key] = part.points;
        } else {
          check(
            `${subject}/úloha ${task.n}: otevřená úloha bez odpovědi`,
            part.answer.trim().length > 0,
          );
        }

        perfect[key] = part.answer;
      }
    }

    check(
      `${subject}: chybí výchozí text k úlohám na porozumění`,
      subject === "matematika" ? !test.intro : !!test.intro && test.intro.text.length > 200,
    );

    // stejný výchozí text (věta, souvětí, ukázka) se nesmí v testu objevit dvakrát
    const stimuli = test.tasks.map((t) => t.stimulus).filter((x): x is string => !!x);
    check(
      `${subject}: tentýž výchozí text použit u dvou úloh`,
      new Set(stimuli).size === stimuli.length,
      `seed ${seed}`,
    );

    // vzorové řešení musí projít na plný počet bodů
    const score = scoreTest(test, perfect, selfScores);
    check(
      `${subject}: vzorové řešení nedává plný počet bodů`,
      score.earned === 50,
      `${score.earned}/50 (seed ${seed})`,
    );
  }
  console.log(`  ✓ ${subject}: ${RUNS} testů zkontrolováno`);
}

// determinismus — stejné semínko musí dát tentýž test
const a = JSON.stringify(generateTest("matematika", 424242));
const b = JSON.stringify(generateTest("matematika", 424242));
check("generátor není deterministický", a === b);
const c = JSON.stringify(generateTest("matematika", 424243));
check("různá semínka dávají tentýž test", a !== c);
console.log("  ✓ determinismus");

console.log(failures === 0 ? "\n✓ Vše v pořádku." : `\n✗ Nalezeno ${failures} problémů.`);
process.exit(failures === 0 ? 0 : 1);
