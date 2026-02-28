# Pipette

[![GitHub stars](https://img.shields.io/github/stars/0xjonaseb11/pipette?style=flat-square)](https://github.com/0xjonaseb11/pipette) [![GitHub forks](https://img.shields.io/github/forks/0xjonaseb11/pipette?style=flat-square)](https://github.com/0xjonaseb11/pipette) [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com) [![Wagmi](https://img.shields.io/badge/Wagmi-7B2BF9?style=flat-square)](https://wagmi.sh) [![Base](https://img.shields.io/badge/Base-0052FF?style=flat-square&logo=base&logoColor=white)](https://base.org) [![Scaffold-ETH](https://img.shields.io/badge/Scaffold--ETH%202-8B5CF6?style=flat-square)](https://scaffoldeth.io)

Get testnet ETH on Base Sepolia. Connect wallet, link GitHub, claim. Amounts depend on a simple anti-sybil score.

- **What it does:** Wallet + GitHub auth, score from your GitHub profile, gasless claim (sign only), 24h cooldown, treasury checks.
- **Built with:** Next.js, React, TypeScript, RainbowKit, Wagmi, Supabase, Base Sepolia, Tailwind, daisyUI.

### Quick start

1. Node 20+, Yarn. Run `yarn install` and `yarn start` from repo root. Open http://localhost:3000.
2. In `packages/nextjs/`: copy `.env.example` to `.env.local`, set Supabase URL/keys and `TREASURY_PRIVATE_KEY`, run `supabase/schema.sql` in Supabase, enable GitHub in Auth.

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
