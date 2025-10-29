# Quick Guide: Access Admin Panel

## Current Situation
The admin panel at `/admin` requires you to have `role: 'admin'` in your user metadata.

## How to Access Admin (Choose One Method)

### Method 1: Supabase Dashboard (Easiest) ⭐

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/utgzpkwetjrpwpswxqjb

2. **Click on Authentication → Users**

3. **Find your email and click on it**

4. **Scroll down to "Raw User Meta Data"**

5. **Add or update:**
   ```json
   {
     "role": "admin",
     "name": "Your Name"
   }
   ```

6. **Save and log out/in** of the app

7. **Visit:** http://localhost:3000/admin

### Method 2: SQL Query (Fastest)

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/utgzpkwetjrpwpswxqjb

2. **Click on SQL Editor**

3. **Run this query** (replace email with yours):
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{role}',
     '"admin"'
   )
   WHERE email = 'sunumanfred14@gmail.com';
   ```

4. **Log out and log back in**

5. **Visit:** http://localhost:3000/admin

### Method 3: Via Code (Most Control)

Create a file `scripts/grant-admin.mjs`:

```javascript
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false } }
)

const email = 'sunumanfred14@gmail.com' // Your email

const { data, error } = await supabase.auth.admin.listUsers()
const user = data.users.find(u => u.email === email)

if (!user) {
  console.error('User not found')
  process.exit(1)
}

await supabase.auth.admin.updateUserById(user.id, {
  user_metadata: { ...user.user_metadata, role: 'admin' }
})

console.log('✅ Admin access granted!')
```

Run: `node scripts/grant-admin.mjs`

## Verify It Worked

1. **Clear your browser cache or use incognito**
2. **Log out** (if logged in)
3. **Log back in** with your email
4. **Visit:** http://localhost:3000/admin
5. **You should see the admin dashboard!**

## Admin Panel Features

Once you have access, you can:

- View dashboard at `/admin`
- Manage stores at `/admin/stores` (to be added)
- Process withdrawals at `/admin/withdrawals`
- View all transactions at `/admin/transactions` (to be added)
- Manage users at `/admin/users` (to be added)

## Current Admin Pages

✅ **Admin Dashboard** (`/admin`)
- Overview of all stores
- Pending withdrawals count
- Total transactions
- Quick stats

✅ **Withdrawals** (`/admin/withdrawals`)
- View agent withdrawal requests
- Approve/reject withdrawals

## If You Get "Unauthorized"

The app detected you don't have admin role. This means:

1. You haven't updated your user metadata yet
2. You need to log out and log back in after updating
3. Check browser console for any errors

## Quick Test

After updating your role:

```bash
# In browser console or terminal
# Visit: http://localhost:3000/admin
```

You should see the admin dashboard!

---

**Recommendation:** Use **Method 1** (Supabase Dashboard) - it's the easiest and most reliable.

