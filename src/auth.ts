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
