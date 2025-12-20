---
description: how to verify docs are up to date
---

# Workflow: Audit Documentation

## Purpose
Run docs audit to ensure code and documentation are aligned.

## Steps

// turbo
1. Run the audit script
```bash
npm run docs:audit
```

2. Review STATUS.md for warnings/errors
```bash
cat STATUS.md
```

3. If warnings found, check specific items:
   - Missing docs → Create them
   - Undocumented actions → Update ROADMAP or BLUEPRINT
   - Version mismatch → Update dates

// turbo
4. Commit STATUS.md if regenerated
```bash
git add STATUS.md && git commit -m "docs: update STATUS.md"
```

## When to Run
- Before every PR merge
- Weekly during development
- Before releases
