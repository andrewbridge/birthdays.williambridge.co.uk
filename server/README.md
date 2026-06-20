# Making It — payout backend

The cash API behind the [Making It](../making-it/) clicker. Handles SMS-OTP auth
and one-time Wise payouts for achievements. One file: [`making-it-achievements.ts`](./making-it-achievements.ts).

Targets the **new Deno Deploy** (`console.deno.com`). Deploy Classic is shut down
on **2026-07-20**, so do not use the deprecated `deployctl`. The code uses
`Deno.serve` + `Deno.openKv`, both supported on the new platform.

## Contract

All POST, JSON. CORS is an allowlist (apex, `www`, `birthdays.` subdomain, and
any `localhost` port).

| Endpoint  | Body                          | Does                                                            |
|-----------|-------------------------------|----------------------------------------------------------------|
| `/auth`   | `{ phoneNumber }`             | Texts an OTP — only to `AUTHORIZED_PHONE`.                      |
| `/verify` | `{ phoneNumber, code }`       | Returns `{ token }` (Deno KV, 24h).                            |
| `/sync`   | `{ token, ids: [...] }`       | Pays each known id once (Wise), records a KV receipt.          |

Payout amounts are **server-side and canonical** (the `ACHIEVEMENTS` map). The
client can only claim ids; each pays at most once. Ids mirror
[`making-it/assets/game/achievements.mjs`](../making-it/assets/game/achievements.mjs).

## Secrets

Never committed. Locally they live in `server/.env` (gitignored); on Deploy they
are dashboard secrets. See [`.env.example`](./.env.example) for the full list:
`AUTHORIZED_PHONE`, `PRELUDE_API_KEY`, `WISE_API_KEY`, `WISE_PROFILE_ID`,
`WISE_TARGET_ACCOUNT`, and the optional `NTFY_TOPIC`.

### Funding (manual, by design)

Personal Wise accounts can no longer fund transfers via the API — PSD2/SCA requires
in-app approval. So `/sync` only **creates** each transfer (quote → transfer); it
sits in Wise *"awaiting your money"* until you fund it once from the Wise app or
website. The transfer id is logged on creation for reconciliation. The game tells
William the cash is on its way; you just tap to send it in Wise.

To know the moment one needs funding, set `NTFY_TOPIC` to a private, hard-to-guess
topic and subscribe to it in the [ntfy](https://ntfy.sh) app. On each successful
transfer creation the server pushes a "Pay William £X" alert with the reference and
transfer id. Leave `NTFY_TOPIC` blank to disable notifications.

## Local dev

```bash
cd server
cp .env.example .env   # fill in real values
deno task dev          # runs with --unstable-kv + --env-file, watch mode, on :8000
deno task check        # type-check
deno task clear-kv     # wipe payout receipts so an achievement can re-pay
deno task clear-kv --all  # wipe everything, incl. auth token (forces re-OTP)
```

Set `KV_PATH=./local-kv.sqlite3` in `.env` so the server and `clear-kv` share one
on-disk store. (`KV_PATH` is local-only — leave it unset on Deno Deploy, where the
managed KV is auto-provisioned.) `clear-kv` keeps the 24h auth token by default so
re-testing a payout doesn't need a fresh real SMS OTP each time.

Smoke test (server returns 405 on GET, 401 for an unknown phone, and reflects an
allowlisted Origin on preflight):

```bash
curl -i -X OPTIONS -H "Origin: https://birthdays.williambridge.co.uk" localhost:8000/sync
curl -s -X POST -H "Content-Type: application/json" -d '{"phoneNumber":"<wrong>"}' localhost:8000/auth
```

## Deploy (new platform, `deno deploy` CLI)

The CLI ships with `deno` ≥ ~2.8 (`deno deploy --help`). Run from **inside this
`server/` directory** so only the single file is uploaded, not the static site.

```bash
cd server

# 1. First time: create the app (interactive — sets org/app/entrypoint).
#    Set the entrypoint to: making-it-achievements.ts
deno deploy create

# 2. Push secrets from your local .env into the app.
deno deploy env load .env
#    (or one at a time: deno deploy env add WISE_API_KEY "…")

# 3. Deploy to production.
deno deploy --prod

# Handy: deno deploy logs   |   deno deploy env list
```

**KV:** `Deno.openKv()` is auto-provisioned per app on the new platform (fresh,
isolated — the old Classic receipts are intentionally *not* migrated). If the
dashboard prompts you to attach a KV store, do so. The `deno deploy database`
command is for SQL databases and isn't needed here.

**Alternative — GitHub integration:** instead of the CLI, connect this repo as an
app in the dashboard with entrypoint `server/making-it-achievements.ts`; builds
run automatically on push, no Actions YAML.

## After deploying

Copy the app's URL (e.g. `https://making-it-xxxx.deno.dev`) into `SERVER_ENDPOINT`
in [`making-it/assets/config.mjs`](../making-it/assets/config.mjs). Then do the
£1 dry-run from the plan: unlock "Your First Real Pound", cash out with the
authorised phone, confirm one deposit lands and a second `/sync` pays nothing.
