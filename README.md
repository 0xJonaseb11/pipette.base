# Pipette

[![GitHub stars](https://img.shields.io/github/stars/0xjonaseb11/pipette?style=flat-square)](https://github.com/0xjonaseb11/pipette) [![GitHub forks](https://img.shields.io/github/forks/0xjonaseb11/pipette?style=flat-square)](https://github.com/0xjonaseb11/pipette) [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com) [![Wagmi](https://img.shields.io/badge/Wagmi-7B2BF9?style=flat-square)](https://wagmi.sh) [![Base](https://img.shields.io/badge/Base-0052FF?style=flat-square&logo=base&logoColor=white)](https://base.org) [![Scaffold-ETH](https://img.shields.io/badge/Scaffold--ETH%202-8B5CF6?style=flat-square)](https://scaffoldeth.io)

Get testnet ETH on Base Sepolia. Connect wallet, link GitHub, claim. Amounts depend on a simple anti-sybil score.

- **What it does:** Wallet + GitHub auth, score from your GitHub profile, gasless claim (sign only), 24h cooldown, treasury checks.
- **Built with:** Next.js, React, TypeScript, RainbowKit, Wagmi, Supabase, Base Sepolia, Tailwind, daisyUI.

### Quick start

**Prerequisites:** Node 20+, Yarn, a [Supabase](https://supabase.com) project, a Base Sepolia wallet with testnet ETH (for the treasury).

1. **Install:** From repo root run `yarn install`, then `yarn start`. App runs at http://localhost:3000 (home and faucet pages load; claims need step 2 and 3).
2. **Env:** In `packages/nextjs/` copy `.env.example` to `.env.local`. 
- Set at least: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TREASURY_PRIVATE_KEY`. Optionally set `TREASURY_ADDRESS`, `DAILY_DISTRIBUTION_CAP_ETH`, `CLAIM_COOLDOWN_HOURS`.
3. **Supabase:** In your project’s SQL editor run the contents of `packages/nextjs/supabase/schema.sql`. 
- In Authentication → Providers enable GitHub and set the redirect URL to `http://localhost:3000/faucet` (or your app URL).
4. **Treasury:** Fund the wallet whose private key you set in `TREASURY_PRIVATE_KEY` with Base Sepolia ETH so the faucet can send claims.

### Scripts

| Command | Description |
| ------- | ----------- |
| `yarn start` | Dev server |
| `yarn next:build` | Build |
| `yarn next:lint` | Lint |
| `yarn format` | Format |

[CONTRIBUTING.md](CONTRIBUTING.md) · [LICENCE](LICENCE) (MIT)

----------

(c) 2026 Jonas Sebera
