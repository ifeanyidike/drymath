import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!serviceRoleKey || serviceRoleKey === 'your_service_role_key_here') {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY in your .env file')
  console.error('Get it from: Supabase Dashboard → Settings → API → service_role (secret)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function confirmUser() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx tsx scripts/confirm-user.ts <email>')
    process.exit(1)
  }

  // Get user by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError.message)
    process.exit(1)
  }

  const user = users.users.find((u) => u.email === email)

  if (!user) {
    console.error(`User with email "${email}" not found in Supabase Auth`)
    process.exit(1)
  }

  // Update user to confirm email
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  })

  if (error) {
    console.error('Error confirming user:', error.message)
    process.exit(1)
  }

  console.log(`User "${email}" has been confirmed!`)
  console.log('You can now login with this account.')
}

confirmUser()
