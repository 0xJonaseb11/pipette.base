# Contributing to Pipette

Thanks for contributing to Pipette — the Base Sepolia developer faucet.

This guide covers how we work: commit conventions, pull request quality, and the contribution workflow.

## About the project

Pipette is a controlled ETH distribution platform on Base Sepolia for developers. It uses GitHub OAuth for identity, anti-sybil scoring, and a treasury refill flow. See the [README](README.md) for setup and architecture.

## Commit conventions

We use a **type-prefixed** commit style so history stays clear and consistent.

### Format

```
[type]: short description
```

- **Lowercase** after the colon; no period at the end.
- **Present tense** when it makes sense (e.g. “add rate limit”, “fix claim validation”).
- Keep the **summary line under ~72 characters**; add a body only if you need to explain why.

### Types we use

| Type     | Use for |
|----------|--------|
| `feat`   | New feature or user-facing change |
| `fix`    | Bug fix |
| `chore`  | Tooling, config, abuse protection, nonce/verification logic |
| `update` | Backend services, schema, UI scaffolding, refactors |
| `refs`   | Merge conflicts, branch/reference cleanup |
| `docs`   | README, CONTRIBUTING, or other docs only |

### Examples

```text
[chore]: abuse protection + nonce verification
[update]: ui scaffolding
[update]: backend service + tightening schema
[fix]: build errors post service tightening
[refs]: merge conflicts
[feat]: admin analytics dashboard
[docs]: add env var table to README
```

Use these types and this format for every commit so PRs and history stay easy to follow.

## Pull requests

### Before opening a PR

- Search existing issues and PRs to avoid duplicates.
- One PR should focus on **one concern** (one feature, one fix, or one refactor), not mixed.
- Run `yarn next:build` and fix any failures; the pre-commit hook runs lint and type-check.

### PR quality

We merge PRs that are easy to review and maintain. Please:

1. **Title**  
   Use a short, accurate title (can match your best commit message, e.g. `[update]: faucet claim button states`).

2. **Description**  
   - What changed and why (bullet points are fine).  
   - Link the issue if there is one.  
   - Screenshots or steps for UI/flow changes.

3. **Commits**  
   - Follow the [commit conventions](#commit-conventions) above.  
   - Prefer a few clear commits over one large or many tiny ones.

4. **Code**  
   - Match existing style (Prettier/ESLint); the repo config is the source of truth.  
   - No commented-out code or debug logs unless they’re temporary and called out in the PR.

### Process

We use a **fork-and-pull** workflow:

1. Fork the repo and clone your fork.
2. Create a branch with a descriptive name (e.g. `update/faucet-claim-flow`).
3. Make changes and commit using the conventions above.
4. Push to your fork and open a PR against the target branch.
5. Address review feedback and keep the PR up to date (rebase or merge as the team prefers).

PRs are merged when approved; we may squash commits on merge to keep main history clean.

## Issues

- **Bugs / features:** Open an issue with clear context: what you did, what you expected, and what happened. Steps to reproduce and screenshots help a lot.
- **Working on an issue:** Comment or assign yourself, then open a PR that references the issue. Use a commit message that matches the work (e.g. `[fix]: claim cooldown for pending users`).

## Code style and tooling

- Use the project’s Prettier and ESLint configs; run `yarn format` and `yarn lint` (or the package-specific scripts) before pushing.
- TypeScript: strict mode, no `any`; use the shared types under `packages/nextjs/types` where applicable.
- If you add env vars or config, update `.env.example` and the README (or other docs) so others can run the app.

---

If something in this guide is unclear or you’d like to extend it, open an issue or suggest a change in a PR.
