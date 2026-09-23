-- Schéma pro účty a ukládání pokusů.
--
-- Tabulky users / accounts / sessions / verification_token jsou dané
-- Auth.js adaptérem @auth/pg-adapter — názvy tabulek i sloupců (včetně
-- camelCase v uvozovkách) musí sedět přesně, jinak adaptér selže.
-- Ověřeno proti zdroji adaptéru, ne proti paměti: createUser vkládá
-- pouze (name, email, "emailVerified", image) a id si nechává vrátit,
-- takže id MUSÍ mít v databázi výchozí hodnotu.

BEGIN;

-- gen_random_uuid() je od PostgreSQL 13 součástí jádra, rozšíření pgcrypto
-- není potřeba (a na některých instancích ani není k dispozici).

/* ------------------------------------------------------------------ */
/* Auth.js                                                             */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text,
  email           text UNIQUE,
  "emailVerified" timestamptz,
  image           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                text NOT NULL,
  provider            text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token       text,
  access_token        text,
  expires_at          bigint,
  id_token            text,
  scope               text,
  session_state       text,
  token_type          text,
  UNIQUE (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires        timestamptz NOT NULL,
  "sessionToken" text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS verification_token (
  identifier text NOT NULL,
  expires    timestamptz NOT NULL,
  token      text NOT NULL,
  PRIMARY KEY (identifier, token)
);

/* ------------------------------------------------------------------ */
/* Pokusy                                                              */
/* ------------------------------------------------------------------ */

-- Jeden řádek = jeden test, který si žák otevřel. Drží průběžný stav
-- (aby šlo pokračovat po zavření prohlížeče) i konečný výsledek.
CREATE TABLE IF NOT EXISTS attempts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject      text NOT NULL CHECK (subject IN ('matematika', 'cestina')),
  -- semínko stačí k rekonstrukci celého testu, zadání se neukládá
  seed         bigint NOT NULL,
  code         text   NOT NULL,
  started_at   timestamptz NOT NULL DEFAULT now(),
  -- konec času jako OKAMŽIK, ne zbývající sekundy: po obnovení stránky
  -- se nesmí odpočet spustit znovu od začátku
  deadline_at  timestamptz NOT NULL,
  submitted_at timestamptz,
  earned       numeric(4,1),
  total        numeric(4,1),
  -- průběžné odpovědi pro pokračování: {"3.2": "400", "11.1": "A", …}
  answers      jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- body přiznané u konstrukčních úloh, které hodnotí žák sám
  self_scores  jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Týž kód testu u téhož žáka je týž pokus — otevření sdíleného odkazu
-- podruhé má navázat, ne založit duplicitní řádek.
CREATE UNIQUE INDEX IF NOT EXISTS attempts_user_code_uniq
  ON attempts (user_id, code);

CREATE INDEX IF NOT EXISTS attempts_user_recent
  ON attempts (user_id, submitted_at DESC NULLS FIRST);

-- Výsledek po ÚLOHÁCH, ne po podúlohách. U skupinově hodnocených úloh
-- (A/N, „vypište N slov“, seřazení) se body přidělují za celou úlohu,
-- takže součet přes podúlohy by dal jiné číslo než skutečné hodnocení.
-- Tahle tabulka je zrnem pro analytiku: „které okruhy dělají potíže“.
CREATE TABLE IF NOT EXISTS attempt_tasks (
  attempt_id    uuid NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  task_n        int  NOT NULL,
  gen           text NOT NULL,   -- klíč generátoru z plánu testu
  topic         text NOT NULL,   -- tematický okruh specifikace
  scoring       text NOT NULL CHECK (scoring IN ('per-part','stepped','errors','all-or-nothing')),
  points        numeric(4,1) NOT NULL,
  earned        numeric(4,1) NOT NULL,
  correct_parts int NOT NULL,
  total_parts   int NOT NULL,
  PRIMARY KEY (attempt_id, task_n)
);

CREATE INDEX IF NOT EXISTS attempt_tasks_gen ON attempt_tasks (gen);
CREATE INDEX IF NOT EXISTS attempt_tasks_topic ON attempt_tasks (topic);

/* ------------------------------------------------------------------ */
/* Procvičování                                                        */
/* ------------------------------------------------------------------ */

-- Jeden řádek = jedna zkontrolovaná úloha z procvičování. Není to pokus
-- o test: úlohy chodí po jedné, bez časového limitu a bez celkového
-- výsledku, takže se do attempts nevejdou. Sloupce popisující úlohu jsou
-- ale schválně stejné jako v attempt_tasks — přehled „kde ztrácím body“
-- pak obě zdroje sečte jedním dotazem.
CREATE TABLE IF NOT EXISTS practice_answers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject       text NOT NULL CHECK (subject IN ('matematika', 'cestina')),
  -- semínko a zvolený okruh stačí k rekonstrukci úlohy, zadání se neukládá
  seed          bigint NOT NULL,
  topic_filter  text,
  task_n        int  NOT NULL,
  gen           text NOT NULL,
  topic         text NOT NULL,
  scoring       text NOT NULL CHECK (scoring IN ('per-part','stepped','errors','all-or-nothing')),
  points        numeric(4,1) NOT NULL,
  earned        numeric(4,1) NOT NULL,
  correct_parts int NOT NULL,
  total_parts   int NOT NULL,
  answered_at   timestamptz NOT NULL DEFAULT now()
);

-- Táž úloha u téhož žáka je týž řádek. Dvojí odeslání (překliknutí, opakování
-- požadavku po výpadku sítě) tak nenafoukne statistiku. Okruh může chybět,
-- a NULL se v indexu sám sobě nerovná, proto prázdný řetězec.
CREATE UNIQUE INDEX IF NOT EXISTS practice_answers_task_uniq
  ON practice_answers (user_id, subject, seed, COALESCE(topic_filter, ''));

CREATE INDEX IF NOT EXISTS practice_answers_recent
  ON practice_answers (user_id, answered_at DESC);

COMMIT;
