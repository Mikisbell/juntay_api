/**
 * E2E Test: Onboarding Flow
 * 
 * Tests the onboardNewTenant server action directly
 */

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config()

import { onboardNewTenant } from '../src/lib/actions/onboarding-actions'

async function testOnboarding() {
    console.log('='.repeat(50))
    console.log('ONBOARDING E2E TEST')
    console.log('='.repeat(50))

    const testData = {
        companyName: `Test Empresa ${Date.now()}`,
        adminEmail: `test-${Date.now()}@juntay.com`,
        adminPassword: 'TestPass123!'
        // RUC omitted to avoid unique constraint
    }

    console.log('\n📝 Test Data:')
    console.log(JSON.stringify(testData, null, 2))

    console.log('\n⏳ Running onboardNewTenant()...')

    try {
        const result = await onboardNewTenant(testData)

        console.log('\n📊 Result:')
        console.log(JSON.stringify(result, null, 2))

        if (result.success) {
            console.log('\n✅ ONBOARDING SUCCESS!')
            console.log(`   Company ID: ${result.companyId}`)
            console.log(`   Admin ID: ${result.adminId}`)
        } else {
            console.log('\n❌ ONBOARDING FAILED!')
            console.log(`   Error: ${result.error}`)
        }

    } catch (err) {
        console.error('\n💥 EXCEPTION:', err)
    }

    console.log('\n' + '='.repeat(50))
}

testOnboarding()
