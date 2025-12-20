#!/usr/bin/env npx tsx
/**
 * 📋 DOCUMENTATION AUDIT SCRIPT
 * 
 * Compares actual code with documentation to find discrepancies.
 * Run: npm run docs:audit
 * 
 * Checks:
 * 1. Server Actions vs ROADMAP/BLUEPRINT mentions
 * 2. DB Migrations vs documented schema
 * 3. Test coverage
 * 4. Missing docs
 */

import * as fs from 'fs'
import * as path from 'path'

const ROOT = process.cwd()

interface AuditResult {
    category: string
    item: string
    status: 'ok' | 'warn' | 'error'
    message: string
}

const results: AuditResult[] = []

function log(result: AuditResult) {
    const icon = result.status === 'ok' ? '✅' : result.status === 'warn' ? '⚠️' : '❌'
    console.log(`${icon} [${result.category}] ${result.item}: ${result.message}`)
    results.push(result)
}

// ============================================================
// 1. AUDIT SERVER ACTIONS
// ============================================================
function auditActions() {
    console.log('\n📦 AUDITING SERVER ACTIONS...\n')

    const actionsDir = path.join(ROOT, 'src/lib/actions')
    if (!fs.existsSync(actionsDir)) {
        log({ category: 'Actions', item: 'Directory', status: 'error', message: 'src/lib/actions not found' })
        return
    }

    const actionFiles = fs.readdirSync(actionsDir)
        .filter(f => f.endsWith('.ts') && !f.includes('.test.'))

    // Read ROADMAP and BLUEPRINT for comparison
    const roadmap = fs.readFileSync(path.join(ROOT, 'ROADMAP.md'), 'utf-8').toLowerCase()
    const blueprint = fs.existsSync(path.join(ROOT, 'docs/SYSTEM_BLUEPRINT.md'))
        ? fs.readFileSync(path.join(ROOT, 'docs/SYSTEM_BLUEPRINT.md'), 'utf-8').toLowerCase()
        : ''

    const moduleMap: Record<string, string[]> = {}

    for (const file of actionFiles) {
        const content = fs.readFileSync(path.join(actionsDir, file), 'utf-8')
        const functions = content.match(/export async function (\w+)/g) || []
        const funcNames = functions.map(f => f.replace('export async function ', ''))

        moduleMap[file] = funcNames

        // Check if module is mentioned in docs
        const baseName = file.replace('-actions.ts', '').replace('-', ' ')
        const inRoadmap = roadmap.includes(baseName) || roadmap.includes(file)
        const inBlueprint = blueprint.includes(baseName) || blueprint.includes(file)

        if (!inRoadmap && !inBlueprint) {
            log({
                category: 'Actions',
                item: file,
                status: 'warn',
                message: `${funcNames.length} functions, NOT DOCUMENTED in ROADMAP or BLUEPRINT`
            })
        } else {
            log({
                category: 'Actions',
                item: file,
                status: 'ok',
                message: `${funcNames.length} functions, documented`
            })
        }
    }

    console.log(`\n   Total: ${actionFiles.length} action files, ${Object.values(moduleMap).flat().length} functions`)
}

// ============================================================
// 2. AUDIT MIGRATIONS
// ============================================================
function auditMigrations() {
    console.log('\n🗄️  AUDITING DATABASE MIGRATIONS...\n')

    const migrationsDir = path.join(ROOT, 'supabase/migrations')
    if (!fs.existsSync(migrationsDir)) {
        log({ category: 'Migrations', item: 'Directory', status: 'error', message: 'supabase/migrations not found' })
        return
    }

    const migrations = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort()

    // Group by date
    const byDate: Record<string, string[]> = {}
    for (const m of migrations) {
        const date = m.slice(0, 8)
        if (!byDate[date]) byDate[date] = []
        byDate[date].push(m)
    }

    // Recent migrations (last 7 days)
    const recent = migrations.filter(m => {
        const date = m.slice(0, 8)
        const migDate = new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return migDate > weekAgo
    })

    if (recent.length > 0) {
        log({
            category: 'Migrations',
            item: 'Recent',
            status: 'ok',
            message: `${recent.length} migrations in last 7 days`
        })
    }

    console.log(`   Total: ${migrations.length} migrations`)
    console.log(`   Recent: ${recent.join(', ') || 'None'}`)
}

// ============================================================
// 3. AUDIT TESTS
// ============================================================
function auditTests() {
    console.log('\n🧪 AUDITING TESTS...\n')

    // Check for test files
    const scriptsDir = path.join(ROOT, 'scripts')
    const testScripts = fs.existsSync(scriptsDir)
        ? fs.readdirSync(scriptsDir).filter(f => f.startsWith('test-') && f.endsWith('.ts'))
        : []

    // Check for vitest tests
    const srcDir = path.join(ROOT, 'src')
    let vitestTests: string[] = []

    function findTests(dir: string) {
        if (!fs.existsSync(dir)) return
        const items = fs.readdirSync(dir)
        for (const item of items) {
            const fullPath = path.join(dir, item)
            const stat = fs.statSync(fullPath)
            if (stat.isDirectory() && !item.includes('node_modules')) {
                findTests(fullPath)
            } else if (item.includes('.test.') || item.includes('.spec.')) {
                vitestTests.push(fullPath.replace(ROOT + '/', ''))
            }
        }
    }
    findTests(srcDir)

    log({
        category: 'Tests',
        item: 'Integration Scripts',
        status: testScripts.length > 0 ? 'ok' : 'warn',
        message: `${testScripts.length} scripts in /scripts/`
    })

    log({
        category: 'Tests',
        item: 'Unit Tests',
        status: vitestTests.length > 0 ? 'ok' : 'warn',
        message: `${vitestTests.length} test files in /src/`
    })

    console.log(`   Scripts: ${testScripts.join(', ') || 'None'}`)
}

// ============================================================
// 4. AUDIT DOCS
// ============================================================
function auditDocs() {
    console.log('\n📚 AUDITING DOCUMENTATION...\n')

    const requiredDocs = [
        { file: 'AGENT.md', critical: true },
        { file: 'ROADMAP.md', critical: true },
        { file: 'README.md', critical: true },
        { file: 'docs/SYSTEM_BLUEPRINT.md', critical: true },
        { file: 'docs/99_changelog.md', critical: false },
        { file: 'docs/03_auth.md', critical: false },
        { file: 'docs/05_testing.md', critical: false },
        { file: 'docs/06_conventions.md', critical: false },
        { file: '.agent/workflows', critical: false },
    ]

    for (const doc of requiredDocs) {
        const exists = fs.existsSync(path.join(ROOT, doc.file))
        log({
            category: 'Docs',
            item: doc.file,
            status: exists ? 'ok' : (doc.critical ? 'error' : 'warn'),
            message: exists ? 'Exists' : 'MISSING'
        })
    }
}

// ============================================================
// 5. AUDIT CONSISTENCY
// ============================================================
function auditConsistency() {
    console.log('\n🔗 AUDITING CROSS-DOCUMENT CONSISTENCY...\n')

    const roadmap = fs.readFileSync(path.join(ROOT, 'ROADMAP.md'), 'utf-8')
    const blueprint = fs.existsSync(path.join(ROOT, 'docs/SYSTEM_BLUEPRINT.md'))
        ? fs.readFileSync(path.join(ROOT, 'docs/SYSTEM_BLUEPRINT.md'), 'utf-8')
        : ''

    // Check for features marked complete in ROADMAP
    const completedInRoadmap = (roadmap.match(/✅ COMPLETADO/g) || []).length

    // Check BLUEPRINT phase status
    const blueprintComplete = (blueprint.match(/✅ Fase/g) || []).length
    const blueprintPending = (blueprint.match(/📋 Fase|🔄 Fase/g) || []).length

    log({
        category: 'Consistency',
        item: 'ROADMAP',
        status: 'ok',
        message: `${completedInRoadmap} features marked complete`
    })

    log({
        category: 'Consistency',
        item: 'BLUEPRINT',
        status: 'ok',
        message: `${blueprintComplete} phases complete, ${blueprintPending} pending`
    })

    // Check for version dates
    const blueprintVersion = blueprint.match(/Versión:\s*[\d.]+/)?.[0] || 'Unknown'
    const blueprintDate = blueprint.match(/Fecha:\s*[\d\w\s]+/)?.[0] || 'Unknown'

    log({
        category: 'Consistency',
        item: 'BLUEPRINT Version',
        status: 'ok',
        message: `${blueprintVersion}, ${blueprintDate}`
    })
}

// ============================================================
// GENERATE STATUS.md
// ============================================================
function generateStatus() {
    console.log('\n📝 GENERATING STATUS.md...\n')

    const okCount = results.filter(r => r.status === 'ok').length
    const warnCount = results.filter(r => r.status === 'warn').length
    const errorCount = results.filter(r => r.status === 'error').length

    const statusContent = `# 📊 JUNTAY System Status

> Auto-generated by \`npm run docs:audit\` on ${new Date().toISOString().split('T')[0]}

## Health Summary

| Status | Count |
|--------|-------|
| ✅ OK | ${okCount} |
| ⚠️ Warnings | ${warnCount} |
| ❌ Errors | ${errorCount} |

## Details

${results.map(r => {
        const icon = r.status === 'ok' ? '✅' : r.status === 'warn' ? '⚠️' : '❌'
        return `- ${icon} **${r.category}/${r.item}**: ${r.message}`
    }).join('\n')}

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Action files | ${fs.readdirSync(path.join(ROOT, 'src/lib/actions')).filter(f => f.endsWith('.ts')).length} |
| Migrations | ${fs.readdirSync(path.join(ROOT, 'supabase/migrations')).filter(f => f.endsWith('.sql')).length} |
| Test scripts | ${fs.readdirSync(path.join(ROOT, 'scripts')).filter(f => f.startsWith('test-')).length} |
| Doc files | ${fs.readdirSync(path.join(ROOT, 'docs')).filter(f => f.endsWith('.md')).length} |

---

*Run \`npm run docs:audit\` to regenerate this file.*
`

    fs.writeFileSync(path.join(ROOT, 'STATUS.md'), statusContent)
    console.log('   ✅ STATUS.md generated')
}

// ============================================================
// MAIN
// ============================================================
console.log('╔══════════════════════════════════════════╗')
console.log('║     JUNTAY DOCUMENTATION AUDIT           ║')
console.log('╚══════════════════════════════════════════╝')

auditActions()
auditMigrations()
auditTests()
auditDocs()
auditConsistency()
generateStatus()

// Summary
console.log('\n╔══════════════════════════════════════════╗')
console.log('║               SUMMARY                     ║')
console.log('╚══════════════════════════════════════════╝')

const okCount = results.filter(r => r.status === 'ok').length
const warnCount = results.filter(r => r.status === 'warn').length
const errorCount = results.filter(r => r.status === 'error').length

console.log(`\n✅ OK: ${okCount}`)
console.log(`⚠️ Warnings: ${warnCount}`)
console.log(`❌ Errors: ${errorCount}`)

if (errorCount > 0) {
    console.log('\n🔴 CRITICAL ISSUES FOUND - Fix before production!')
    process.exit(1)
} else if (warnCount > 0) {
    console.log('\n🟡 Some warnings found - Consider addressing them')
    process.exit(0)
} else {
    console.log('\n🟢 All checks passed!')
    process.exit(0)
}
