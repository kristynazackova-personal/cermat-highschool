import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/server/db";
import { openAttempt, saveAnswers, loadAttempt } from "@/lib/server/attempts";

/** Otevření testu (nebo navázání na rozdělaný) a průběžné ukládání odpovědí. */

async function userId() {
  if (!dbConfigured()) return null;
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function POST(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ stored: false }, { status: 200 });

  const body = await req.json();
  const { subject, seed, code, minutes } = body ?? {};
  if (typeof subject !== "string" || typeof code !== "string") {
    return NextResponse.json({ error: "chybné vstupy" }, { status: 400 });
  }
  const attempt = await openAttempt(db(), uid, {
    subject,
    seed: Number(seed),
    code,
    minutes: Number(minutes) || 60,
  });
  return NextResponse.json({ stored: true, attempt });
}

export async function PATCH(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ stored: false }, { status: 200 });

  const body = await req.json();
  const { code, answers, selfScores } = body ?? {};
  if (typeof code !== "string") {
    return NextResponse.json({ error: "chybné vstupy" }, { status: 400 });
  }
  const ok = await saveAnswers(db(), uid, code, answers ?? {}, selfScores ?? {});
  return NextResponse.json({ stored: ok });
}

export async function GET(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ attempt: null });

  const code = new URL(req.url).searchParams.get("kod");
  if (!code) return NextResponse.json({ attempt: null });
  return NextResponse.json({ attempt: await loadAttempt(db(), uid, code) });
}
