import { Pool } from "pg";

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
