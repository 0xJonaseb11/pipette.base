# Pipette

[![GitHub stars](https://img.shields.io/github/stars/0xjonaseb11/pipette?style=flat-square)](https://github.com/0xjonaseb11/pipette) [![GitHub forks](https://img.shields.io/github/forks/0xjonaseb11/pipette?style=flat-square)](https://github.com/0xjonaseb11/pipette) [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com) [![Wagmi](https://img.shields.io/badge/Wagmi-7B2BF9?style=flat-square)](https://wagmi.sh) [![Base](https://img.shields.io/badge/Base-0052FF?style=flat-square&logo=base&logoColor=white)](https://base.org) [![Scaffold-ETH](https://img.shields.io/badge/Scaffold--ETH%202-8B5CF6?style=flat-square)](https://scaffoldeth.io)

Base Sepolia faucet. Connect wallet, link GitHub, claim testnet ETH. Amounts depend on anti-sybil score.

**Stack:** Next.js, React, TypeScript, RainbowKit, Wagmi, Supabase, Base Sepolia, Tailwind, daisyUI.

---

### Quick start

Need: Node 20+, Yarn, [Supabase](https://supabase.com) project, Base Sepolia wallet with testnet ETH (treasury).

**1. Install and run**

```sh
yarn install
yarn start
```

Open http://localhost:3000. Faucet claims need steps 2–4.

**2. Env** (in `packages/nextjs/`)

```sh
cp .env.example .env.local
```

Edit `.env.local`. Required:

```sh
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key (server only)
TREASURY_PRIVATE_KEY=              # Base Sepolia wallet private key (treasury)
```

Optional:

```sh
TREASURY_ADDRESS=                  # Same wallet; validated against key
DAILY_DISTRIBUTION_CAP_ETH=1.0     # Max ETH per day
CLAIM_COOLDOWN_HOURS=24            # Hours between claims per user
```

**3. Supabase**

- SQL editor: run `packages/nextjs/supabase/schema.sql`.
- Auth → Providers: enable GitHub, redirect URL `http://localhost:3000/faucet`.

**4. Treasury**

Fund the `TREASURY_PRIVATE_KEY` wallet with Base Sepolia ETH.

**5. Treasury refill (optional, automated)**

- **Vercel:** Set `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, `TREASURY_ADDRESS`, and `CRON_SECRET` in the project. The app runs a cron job every 24 hours (`0 5 * * *` UTC) that requests faucet funds from Coinbase CDP to the treasury.
- **Manual or external cron:** Run `cd packages/nextjs && npx tsx scripts/refillTreasury.ts` with the same env vars (and `TREASURY_ADDRESS`). CDP rate limit: 0.0001 ETH per request, 0.1 ETH per 24h per address.

---

### Scripts

| Command | Description |
| ------- | ----------- |
| `yarn start` | Dev server |
| `yarn next:build` | Build |
| `yarn next:lint` | Lint |
| `yarn format` | Format |
| `cd packages/nextjs && npx tsx scripts/refillTreasury.ts` | Request CDP faucet funds to treasury (env: CDP_API_KEY_ID, CDP_API_KEY_SECRET, TREASURY_ADDRESS) |

[CONTRIBUTING.md](CONTRIBUTING.md) · [LICENCE](LICENCE) (MIT)

----------

(c) 2026 Jonas Sebera
