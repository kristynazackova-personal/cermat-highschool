"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Session se načítá až v prohlížeči. Kdyby ji četl kořenový layout na
 * serveru, přestal by být celý web staticky generovaný — a to za přihlašovací
 * tlačítko v hlavičce nestojí.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
