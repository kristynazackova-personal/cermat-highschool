"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function SignIn() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p>Jste přihlášeni jako {session.user.name ?? session.user.email}.</p>
        <Link
          href="/moje-testy"
          className="mt-4 inline-block rounded-xl px-5 py-3 text-sm font-semibold"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          Moje testy
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Přihlášení</h1>
      <p className="mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
        Po přihlášení se rozpracovaný test ukládá, takže se k němu můžete vrátit
        i na jiném zařízení, a v přehledu uvidíte, ve kterých okruzích ztrácíte
        nejvíc bodů.
      </p>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/moje-testy" })}
        className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold"
        style={{ background: "var(--accent)", color: "var(--bg)" }}
      >
        Přihlásit se přes Google
      </button>
      <p className="mt-6 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        Testy i procvičování fungují i bez přihlášení — jen se neukládají.
      </p>
    </div>
  );
}
