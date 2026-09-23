# Databáze

Neon Postgres. Schéma je v `001_init.sql` a je **ověřené spuštěním proti
skutečnému Postgresu**, ne jen přečtené — migrace projde, vloží uživatele
přesně tak, jak to dělá Auth.js adaptér, naváže na existující pokus podle
kódu testu a obě omezení `CHECK` drží.

## Spuštění migrace

```bash
psql "$DATABASE_URL" -f db/001_init.sql
```

Bez psql jde obsah souboru vložit do SQL editoru v konzoli Neonu.
Migrace je idempotentní (`IF NOT EXISTS`), takže se dá pustit znovu.

## Proč to vypadá takhle

**`users` / `accounts` / `sessions` / `verification_token`** jsou dané
Auth.js adaptérem `@auth/pg-adapter`. Názvy tabulek i sloupců včetně
camelCase v uvozovkách (`"userId"`, `"emailVerified"`, `"sessionToken"`)
musí sedět přesně. Ověřeno proti zdroji adaptéru: `createUser` vkládá jen
`(name, email, "emailVerified", image)` a `id` si nechává vrátit — proto
musí mít `id` výchozí hodnotu v databázi.

`gen_random_uuid()` je od PostgreSQL 13 v jádře; rozšíření `pgcrypto`
není potřeba a jeho zbytečné vyžadování migraci rozbíjelo.

**`attempts`** je jeden řádek na test, který si žák otevřel. Drží
průběžné odpovědi (`answers`), aby šlo pokračovat po zavření prohlížeče.
Zadání se neukládá — na rekonstrukci celého testu stačí `seed`.

Čas se ukládá jako `deadline_at`, tedy OKAMŽIK konce, ne zbývající
sekundy. Jinak by obnovení stránky spustilo odpočet znovu od začátku
a test by šlo natahovat donekonečna.

Unikátní index na `(user_id, code)` znamená, že otevření téhož kódu
podruhé naváže na týž pokus místo založení duplicity — což je přesně to,
co sdílení testu odkazem potřebuje.

**`attempt_tasks`** drží výsledek po ÚLOHÁCH, ne po podúlohách. To není
detail: u skupinově hodnocených úloh (A/N, „vypište N slov“, seřazení)
se body přidělují za celou úlohu, takže součet přes podúlohy by dal jiné
číslo než skutečné hodnocení. Tahle tabulka je zrnem pro analytiku
„které okruhy dělají potíže“.

## Kde co běží

Proměnné patří do **Railway → Variables** (tam je aplikace čte za běhu) a pro
lokální vývoj do `.env.local`. Vývoj proti produkční databázi není potřeba:
datová vrstva se ověřuje proti Postgresu spuštěnému v procesu
(`npm run test:db`), takže se na ostrá data nesahá.

Chybí-li `DATABASE_URL` nebo klíče od Googlu, **přihlašování se samo vypne**
a web funguje jako dřív — generuje testy, procvičování i kartičky, jen si nic
nepamatuje. Nasazení tím pádem nespadne, když proměnné ještě nejsou.

## Proměnné prostředí

| Proměnná | K čemu |
|---|---|
| `DATABASE_URL` | Neon připojovací řetězec (pooled) |
| `AUTH_SECRET` | podpis sezení, `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | OAuth client ID z Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | OAuth client secret |
| `AUTH_TRUST_HOST` | `true` — nutné mimo Vercel, tedy i na Railway |
| `AUTH_URL` | `https://cermat-highschool-production.up.railway.app` — nepovinné, ale spolehlivější než odvozování z hlaviček |

### Callback URL pro Google Cloud Console

Do pole **Authorized redirect URIs** patří přesně tohle, znak po znaku:

```
https://cermat-highschool-production.up.railway.app/api/auth/callback/google
```

a pro místní vývoj ještě:

```
http://localhost:3000/api/auth/callback/google
```

Pole **Authorized JavaScript origins** zůstává prázdné — Auth.js používá
serverové přesměrování, ne tokenový tok v prohlížeči.

Nejčastější příčina chyby `redirect_uri_mismatch` je překlep v adrese:
zdvojené `https://`, lomítko navíc na konci nebo otazník za adresou.
