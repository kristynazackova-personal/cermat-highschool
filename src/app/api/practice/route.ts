import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, dbConfigured, ensureSchema } from "@/lib/server/db";
import { recordPractice } from "@/lib/server/practice";
import { practiceTask, scoreSingleTask } from "@/lib/cermat/build";
import type { Subject } from "@/lib/cermat/spec";

/**
 * Zápis jedné zkontrolované úlohy z procvičování.
 *
 * Server si úlohu ze semínka vygeneruje znovu a sám ji obodová — stejně jako
 * u odevzdaného testu se klientovi věří jen odpovědi, ne výsledek. Semínko
 * a zvolený okruh úlohu určují jednoznačně, takže vyjde přesně ta, kterou
 * žák viděl.
 *
 * Bez přihlášení nebo bez databáze se nic neukládá a vrací se stored: false;
 * procvičování má fungovat i tak.
 */
export async function POST(req: Request) {
  if (!dbConfigured()) return NextResponse.json({ stored: false });
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ stored: false });

  const { subject, seed, topic, answers, selfScore } = (await req.json()) ?? {};
  if (subject !== "matematika" && subject !== "cestina") {
    return NextResponse.json({ error: "chybný předmět" }, { status: 400 });
  }
  if (typeof seed !== "number" || !Number.isFinite(seed)) {
    return NextResponse.json({ error: "chybné semínko" }, { status: 400 });
  }
  const topicFilter = typeof topic === "string" && topic ? topic : null;

  const task = practiceTask(subject as Subject, seed, topicFilter);
  const r = scoreSingleTask(task, answers ?? {}, Number(selfScore) || 0);

  await ensureSchema();
  await recordPractice(db(), uid, {
    subject,
    seed,
    topicFilter,
    task,
    earned: r.earned,
    points: r.points,
    correctParts: r.correctParts,
    totalParts: r.totalParts,
  });
  return NextResponse.json({ stored: true, earned: r.earned, points: r.points });
}
