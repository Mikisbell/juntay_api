---
description: how to add a new feature
---

# Workflow: Add New Feature

## Purpose
Ensure new features are properly documented and tested.

## Steps

1. Check ROADMAP.md for context
```bash
cat ROADMAP.md | grep -A 10 "feature name"
```

2. Check if related actions exist
```bash
ls src/lib/actions/ | grep "feature"
```

3. Create/modify server actions in `src/lib/actions/`

4. Create/modify UI components in `src/components/`

5. If database changes needed, create migration:
```bash
# Create migration file
touch supabase/migrations/$(date +%Y%m%d)_feature_name.sql
```

// turbo
6. Run tests
```bash
npm test
```

// turbo
7. Run lint
```bash
npm run lint
```

// turbo
8. Build to verify
```bash
npm run build
```

9. Update documentation:
   - Add to ROADMAP.md if new feature
   - Update SYSTEM_BLUEPRINT.md if architectural
   - Add to docs/99_changelog.md

// turbo
10. Run docs audit
```bash
npm run docs:audit
```

11. Commit with descriptive message
```bash
git add -A && git commit -m "feat: add feature-name

- Actions: feature-actions.ts
- Components: FeatureComponent.tsx
- Migration: YYYYMMDD_feature.sql
- Tests: feature.test.ts"
```
