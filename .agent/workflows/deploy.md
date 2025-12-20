---
description: how to deploy to production
---

# Workflow: Deploy to Production

## Purpose
Safe deployment process with all checks.

## Pre-Deployment Checks

// turbo
1. Run all tests
```bash
npm test
```

// turbo
2. Run linter
```bash
npm run lint
```

// turbo
3. Run type check
```bash
npx tsc --noEmit
```

// turbo
4. Build production
```bash
npm run build
```

// turbo
5. Run docs audit (should be 0 errors)
```bash
npm run docs:audit
```

6. Review STATUS.md for critical issues
```bash
cat STATUS.md | grep "❌"
```

## Deployment Steps

7. Tag release
```bash
git tag -a v2025.12.XX -m "Release notes"
git push origin --tags
```

8. Deploy to staging first
   - Verify critical flows work
   - Check logs for errors

9. Deploy to production
   - Monitor error rate
   - Check key metrics

## Post-Deployment

10. Update docs/99_changelog.md with release notes

11. Run docs audit to regenerate STATUS.md
```bash
npm run docs:audit
git add STATUS.md docs/99_changelog.md
git commit -m "docs: update for release vX.X.X"
```

## Rollback (if needed)

```bash
# Revert to previous version
git revert HEAD
npm run build
# Redeploy
```
