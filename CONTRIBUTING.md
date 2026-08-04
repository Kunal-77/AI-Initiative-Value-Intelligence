# Contributing Guidelines

## Code Standards & Pull Request Checklist
1. All UI code must adhere strictly to `DESIGN_SYSTEM.md`.
2. Do not introduce raw color values; use HSL semantic tokens (`bg-card`, `text-foreground`, `border-border`).
3. Run `npm run type-check` in `apps/web` and verify 0 TypeScript errors before submitting PRs.
4. Run `pytest` in `apps/api` and verify all tests pass cleanly.
5. Provide clear git commit messages adhering to Conventional Commits format (`feat:`, `fix:`, `docs:`).
