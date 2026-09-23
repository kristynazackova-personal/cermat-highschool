import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Na co se web sám považuje.
 *
 * Když přihlášení přes Google skončí chybou „redirect_uri_mismatch“, je
 * skoro vždycky na vině adresa, kterou si web o sobě myslí: Googlu pak
 * pošle návratovou adresu, kterou nikdo nezaregistroval. Bez tohohle
 * výpisu se to hádá přes několik nasazení, s ním je to jedno zavolání.
 *
 * Vypisují se jen hlavičky o směrování a to, JESTLI je proměnná nastavená —
 * žádná hodnota klíče ani tajemství tudy neprojde.
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
    poznamka:
      "Hodnota v „navratovaAdresa“ musí být v Google Cloud Console zapsaná " +
      "mezi Authorized redirect URIs, znak po znaku.",
  });
}
