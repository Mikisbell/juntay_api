
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createAdminUser() {
    const email = 'admin@piloto.pe'
    const password = 'admin' // Simple password for local dev

    console.log(`🚀 Checking user ${email}...`)

    // Check if user exists (by listing users, limited to 1 for this email)
    // Note: listUsers() doesn't support filtering by email directly in all versions, 
    // but admin.createUser will fail if exists, or update.

    // Attempt to create user
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'Admin Sistema'
        }
    })

    if (error) {
        if (error.message.includes('already registered') || error.status === 422) {
            // User exists, try updating password
            console.log('User exists. Updating password...')
            // We need the user ID to update. Fetch user by email not directly supported in simple API, 
            // so we'll list users to find the ID.

            // Actually, we can't search by email easily without listUsers
            const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
            if (listError) throw listError

            const existingUser = listData.users.find(u => u.email === email)

            if (existingUser) {
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                    existingUser.id,
                    { password: password, user_metadata: { full_name: 'Admin Sistema' } }
                )
                if (updateError) {
                    console.error('❌ Failed to update user:', updateError.message)
                } else {
                    console.log('✅ User password updated to "admin"')
                }
            } else {
                console.error('❌ Could not find user to update despite 422 error.')
            }

        } else {
            console.error('❌ Error creating user:', error.message)
        }
    } else {
        console.log(`✅ User created successfully! ID: ${data.user.id}`)
        console.log(`📧 Email: ${email}`)
        console.log(`🔑 Password: ${password}`)
    }
}

createAdminUser().catch(console.error)
