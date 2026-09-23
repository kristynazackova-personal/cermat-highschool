import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O projektu",
  description: "Jak generátor cvičných testů funguje a co od něj čekat.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">O projektu</h1>

      <div className="mt-6 grid gap-6 leading-relaxed" style={{ color: "var(--muted)" }}>
        <p>
          Na přijímačky se dá cvičit na skutečných testech z minulých let — je jich ale
          konečný počet a po pár průchodech si je člověk spíš pamatuje, než počítá. Tenhle
          web řeší právě to: každé kliknutí vygeneruje celý test znovu, se stejnou stavbou
          jako ta skutečná zkouška, ale s jinými čísly, jinými větami a jiným pořadím
          nabídek.
        </p>

        <div>
          <h2 className="font-semibold" style={{ color: "var(--ink)" }}>
            Jak vznikají úlohy
          </h2>
          <p className="mt-2">
            Žádná umělá inteligence a žádné volání na server — test se skládá přímo ve
            vašem prohlížeči z generátorů napsaných na míru každému typu úlohy. Matematika
            počítá v přesné zlomkové aritmetice, takže výsledek nikdy nevznikne
            zaokrouhlením; geometrické úlohy si samy kreslí obrázek. U češtiny se jazykový
            obsah negeneruje šablonou — všechny věty, ukázky a nabídky jsou předem ověřené
            a generátor z nich vybírá a míchá pořadí. Šablona by v češtině snadno vyrobila
            tvar, který neexistuje, nebo otázku s víc než jednou správnou odpovědí.
          </p>
        </div>

        <div>
          <h2 className="font-semibold" style={{ color: "var(--ink)" }}>
            Kód testu
          </h2>
          <p className="mt-2">
            Každý test má krátký kód v adrese. Stejný kód vždycky vrátí tentýž test —
            takže si můžete odkaz uložit, poslat ho někomu, nebo se k testu vrátit a
            projít si ho znovu.
          </p>
        </div>

        <div>
          <h2 className="font-semibold" style={{ color: "var(--ink)" }}>
            Co generátor neumí
          </h2>
          <p className="mt-2">
            Konstrukční úlohy z geometrie se rýsují na papír, takže je stroj neopraví —
            web u nich ukáže vzorový postup i bodování a vy si body přiznáte sami. Slohové
            a otevřené úlohy s delší odpovědí se ve skutečné zkoušce hodnotí podle klíče,
            který tady zastupuje komentovaný postup řešení.
          </p>
          <p className="mt-2">
            A hlavně: tohle není zadání Cermatu. Je to cvičná pomůcka postavená podle
            veřejně vydané <em>Specifikace požadavků</em>. Skutečná zadání z minulých let
            si stáhněte u zdroje — odkazy najdete na stránce{" "}
            <Link href="/co-se-ucit" className="underline underline-offset-4" style={{ color: "var(--accent)" }}>
              Co se učit
            </Link>
            .
          </p>
        </div>

        <div
          className="mt-2 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          {/*
            Obyčejný <img> na předem zmenšený WebP, ne next/image: jde o jediný
            malý portrét v pevné velikosti, takže optimalizace za běhu by nic
            nepřinesla — a stránka díky tomu zůstane čistě statická i kdyby se
            web někdy exportoval jako statické soubory.
          */}
          <img
            src="/kristyna.webp"
            alt="Kristýna Zacková"
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            className="h-24 w-24 shrink-0 rounded-full object-cover"
            style={{ border: "1px solid var(--line)" }}
          />
          <div>
            <p className="font-semibold" style={{ color: "var(--ink)" }}>
              Kristýna Zacková
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              Web vznikl a je udržován jako volně dostupná pomůcka k přípravě
              na jednotné přijímací zkoušky.
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <a
                href="https://kristynazackova.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
                style={{ color: "var(--accent)" }}
              >
                kristynazackova.com
              </a>
              <a
                href="https://www.linkedin.com/in/k-zackova/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
                style={{ color: "var(--accent)" }}
              >
                LinkedIn
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
