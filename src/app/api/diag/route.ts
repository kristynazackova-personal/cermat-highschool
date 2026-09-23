import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db, dbConfigured } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/** Tabulky, které přihlašování a ukládání odpovědí potřebují. */
const POTREBNE = ["users", "accounts", "sessions", "verification_token", "attempts", "attempt_tasks"];

/**
 * Z chybové hlášky se nesmí dostat ven přístupové údaje: v připojovacím
 * řetězci je heslo hned před zavináčem.
 */
function bezHesla(text: string): string {
  return text.replace(/\/\/[^@\s/]*@/g, "//…@").slice(0, 300);
}

async function stavDatabaze() {
  if (!dbConfigured()) return { nastavena: false as const };
  try {
    const { rows } = await db().query(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ANY($1)`,
      [POTREBNE],
    );
    const maji = rows.map((r) => String(r.table_name));
    return {
      nastavena: true as const,
      spojeni: "ok" as const,
      tabulky: maji,
      chybejici: POTREBNE.filter((t) => !maji.includes(t)),
    };
  } catch (e) {
    return {
      nastavena: true as const,
      spojeni: "chyba" as const,
      chyba: bezHesla(e instanceof Error ? e.message : String(e)),
    };
  }
}

/**
 * Na co se web sám považuje a co mu chybí.
 *
 * Když přihlášení přes Google skončí chybou, je to skoro vždycky jedna ze
 * tří věcí: adresa, kterou o sobě web tvrdí, chybějící podpisový klíč, nebo
 * nezaložené tabulky. Bez tohohle výpisu se to hádá přes několik nasazení.
 *
 * Ven jde jen to, JESTLI je proměnná nastavená, a jména tabulek — žádná
 * hodnota klíče ani přístupové údaje.
 */
export async function GET() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? null;
  const proto = h.get("x-forwarded-proto") ?? "https";

  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? null;
  const puvod = authUrl ?? (host ? `${proto}://${host}` : null);

  return NextResponse.json({
    hlavicky: {
      host: h.get("host"),
      "x-forwarded-host": h.get("x-forwarded-host"),
      "x-forwarded-proto": h.get("x-forwarded-proto"),
    },
    authUrlNastavena: Boolean(authUrl),
    puvod,
    navratovaAdresa: puvod ? `${puvod}/api/auth/callback/google` : null,
    promenne: {
      AUTH_SECRET: Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
      AUTH_GOOGLE_ID: Boolean(process.env.AUTH_GOOGLE_ID),
      AUTH_GOOGLE_SECRET: Boolean(process.env.AUTH_GOOGLE_SECRET),
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
    },
    databaze: await stavDatabaze(),
    poznamka:
      "„navratovaAdresa“ musí být v Google Cloud Console mezi Authorized " +
      "redirect URIs. Chybějící tabulky založí db/001_init.sql.",
  });
}
