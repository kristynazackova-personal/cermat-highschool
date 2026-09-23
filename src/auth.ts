import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import PostgresAdapter from "@auth/pg-adapter";
import { db } from "@/lib/server/db";

/**
 * Přihlašování je VOLITELNÉ. Bez databáze a bez klíčů od Googlu web
 * funguje přesně jako dřív — generuje testy, procvičování i kartičky,
 * jen si nic nepamatuje. Díky tomu nasazení nespadne, když proměnné
 * chybí, a dá se rozjet postupně.
 */
/**
 * Adresa, na které web běží, se dá nastavit proměnnou AUTH_URL. Když ale
 * ukazuje na localhost, je to vždycky omyl — v nasazení takovou adresu
 * Google jako návratovou nepřijme (odmítne ji jako neplatnou) a přihlášení
 * skončí chybou dřív, než se kdo stihne přihlásit. V takovém případě je
 * lepší proměnnou ignorovat a odvodit adresu z hlaviček, které posílá
 * Railway; `trustHost` níž je přesně na tohle.
 *
 * Děje se to před voláním NextAuth(), protože právě tam se proměnné čtou.
 */
/**
 * Které proměnné se zahodily. Bez téhle stopy nejde ve výpisu rozeznat
 * „proměnná nebyla nastavená“ od „byla nastavená špatně a zahodili jsme ji“ —
 * v obou případech je pak prázdná, a to jednou svedlo hledání špatným směrem.
 */
export const zahozeneAdresy: string[] = [];

function zahodMylnouAdresu(jmeno: "AUTH_URL" | "NEXTAUTH_URL") {
  const v = process.env[jmeno];
  if (!v) return;
  let host: string;
  try {
    host = new URL(v).hostname;
  } catch {
    // nesmyslná hodnota je k ničemu stejně jako localhost
    delete process.env[jmeno];
    zahozeneAdresy.push(jmeno);
    return;
  }
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "0.0.0.0") {
    delete process.env[jmeno];
    zahozeneAdresy.push(jmeno);
  }
}

if (process.env.NODE_ENV === "production") {
  zahodMylnouAdresu("AUTH_URL");
  zahodMylnouAdresu("NEXTAUTH_URL");
}

export const authEnabled = Boolean(
  process.env.DATABASE_URL &&
    process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Adaptér se vytváří až při použití, aby se bez DATABASE_URL nic nespouštělo.
  adapter: authEnabled ? PostgresAdapter(db()) : undefined,
  providers: authEnabled
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
          // stačí základní rozsah: bez citlivých oprávnění nevyžaduje
          // Google ověření aplikace a odpadá limit 100 uživatelů
          authorization: { params: { scope: "openid email profile" } },
        }),
      ]
    : [],
  // Session v databázi (tabulka sessions), ne v cookie — adaptér to očekává.
  session: { strategy: authEnabled ? "database" : "jwt" },
  // Mimo Vercel je potřeba potvrdit, že hostiteli věříme (Railway).
  trustHost: true,
  pages: { signIn: "/prihlaseni" },
  callbacks: {
    session({ session, user }) {
      if (user?.id) session.user.id = user.id;
      return session;
    },
  },
});
