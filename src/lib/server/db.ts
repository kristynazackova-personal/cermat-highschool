import { Pool } from "pg";
import { SCHEMA_SQL } from "./schema";

/**
 * Minimální rozhraní, které potřebují datové funkce i Auth.js adaptér.
 * Díky němu jde tentýž kód spustit proti Neonu i proti lokální databázi
 * v testech — SQL se tak dá ověřit, aniž by se sahalo na produkci.
 */
export type Queryable = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

let pool: Pool | null = null;

/** Sdílený pool. Na Railway běží dlouhoběžící proces, takže se vyplatí. */
export function db(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "Chybí proměnná DATABASE_URL. Na Railway ji nastav v Variables, " +
          "lokálně v .env.local.",
      );
    }
    pool = new Pool({
      connectionString,
      // Neon vyžaduje TLS; certifikát je od veřejné autority
      ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: true },
      max: 5,
    });
  }
  return pool;
}

/** Je vůbec databáze nakonfigurovaná? Web má fungovat i bez ní. */
export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let schema: Promise<boolean> | null = null;

/**
 * Založí chybějící tabulky, nejvýš jednou za běh procesu.
 *
 * Bez tohohle kroku vypadá web nasazený a funkční, jenže přihlášení přes
 * Google doběhne až k návratu a tam spadne na hlášce o chybné konfiguraci —
 * adaptér sahá na tabulku, která neexistuje. Na chybu se přijde až po
 * přihlášení, tedy nejpozději, jak to jde.
 *
 * Schéma je celé psané s IF NOT EXISTS a běží v transakci, takže opakované
 * spuštění ani souběh dvou instancí nic nepřepíše.
 *
 * Když založení selže, web se kvůli tomu nezastaví: generování testů na
 * databázi nezávisí a má fungovat dál. Co přesně chybí, řekne /api/diag.
 */
export function ensureSchema(): Promise<boolean> {
  if (!schema) {
    schema = db()
      .query(SCHEMA_SQL)
      .then(() => true)
      .catch((e) => {
        console.error("Nepodařilo se založit schéma databáze:", e);
        // další požadavek to smí zkusit znovu — třeba byla databáze jen chvíli
        // nedostupná a ruční zásah by nebyl potřeba
        schema = null;
        return false;
      });
  }
  return schema;
}
