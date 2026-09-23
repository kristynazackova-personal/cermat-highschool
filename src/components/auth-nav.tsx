"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

/** Přihlášení v hlavičce. Když přihlašování není nastavené, nic se nezobrazí. */
export default function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-xs" style={{ color: "var(--muted)" }} aria-hidden>…</span>;
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("google")}
        className="rounded-lg border px-3 py-1.5 text-sm font-medium"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        Přihlásit se
      </button>
    );
  }

  const label = session.user.name ?? session.user.email ?? "účet";

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/moje-testy"
        className="hidden text-sm hover:underline underline-offset-4 sm:inline"
        title={label}
      >
        Moje testy
      </Link>
      <button
        type="button"
        onClick={() => signOut()}
        className="text-sm hover:underline underline-offset-4"
        style={{ color: "var(--muted)" }}
      >
        Odhlásit
      </button>
    </div>
  );
}
