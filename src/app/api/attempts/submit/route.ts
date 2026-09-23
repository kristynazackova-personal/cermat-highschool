import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/server/db";
import { submitAttempt } from "@/lib/server/attempts";
import { generateTest, scoreTest } from "@/lib/cermat/build";
import type { Subject } from "@/lib/cermat/spec";

/**
 * Odeslání testu. Server si test znovu vygeneruje ze semínka a obodová ho
 * sám — klientovi se věří jen odpovědi, ne výsledek.
 */
export async function POST(req: Request) {
  if (!dbConfigured()) return NextResponse.json({ stored: false });
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ stored: false });

  const { subject, seed, answers, selfScores } = (await req.json()) ?? {};
  if ((subject !== "matematika" && subject !== "cestina") || typeof seed !== "number") {
    return NextResponse.json({ error: "chybné vstupy" }, { status: 400 });
  }

  const test = generateTest(subject as Subject, seed);
  const score = scoreTest(test, answers ?? {}, selfScores ?? {});
  await submitAttempt(db(), uid, test, score, answers ?? {}, selfScores ?? {});
  return NextResponse.json({ stored: true, earned: score.earned, total: score.total });
}
