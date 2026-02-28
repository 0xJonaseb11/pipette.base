# Pipette

[![GitHub stars](https://img.shields.io/github/stars/0xjonaseb11/pipette?style=flat-square)](https://github.com/0xjonaseb11/pipette)
[![GitHub forks](https://img.shields.io/github/forks/0xjonaseb11/pipette?style=flat-square)](https://github.com/0xjonaseb11/pipette)

[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Wagmi](https://img.shields.io/badge/Wagmi-7B2BF9?style=flat-square)](https://wagmi.sh)
[![Base](https://img.shields.io/badge/Base-0052FF?style=flat-square&logo=base&logoColor=white)](https://base.org)
[![Scaffold-ETH](https://img.shields.io/badge/Scaffold--ETH%202-8B5CF6?style=flat-square)](https://scaffoldeth.io)

Base Sepolia developer faucet. Connect your wallet, link GitHub, and claim testnet ETH. Eligibility and amounts are based on a simple anti-sybil score so builders can get funds without mainnet gas.

**Features:** Wallet + GitHub (RainbowKit, Supabase Auth), anti-sybil scoring from GitHub profile, gasless claim (sign message, receive ETH on Base Sepolia), 24h cooldown and treasury checks.

**Stack:** Next.js 14, React, TypeScript, RainbowKit, Wagmi, Supabase, Base Sepolia, Tailwind, daisyUI.

---

## Quick start

- Node 20+, Yarn. From repo root: `yarn install` then `yarn start`. Open [http://localhost:3000](http://localhost:3000).
- Config: copy `packages/nextjs/.env.example` to `.env.local` in that folder. Set Supabase URL/keys, `TREASURY_PRIVATE_KEY`, and optionally `TREASURY_ADDRESS`, caps, and cooldown. Run `packages/nextjs/supabase/schema.sql` in Supabase and enable GitHub in Auth providers.

---

## Scripts (repo root)

| Command | Description |
| ------- | ----------- |
| `yarn start` | Dev server |
| `yarn next:build` | Production build |
| `yarn next:lint` | Lint |
| `yarn format` | Format code |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit conventions and PRs.

**License:** MIT. See [LICENCE](LICENCE).
