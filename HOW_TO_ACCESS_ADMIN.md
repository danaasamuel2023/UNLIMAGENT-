# How to Access Admin Panel

## Current Setup
The admin panel is located at `/admin` and currently requires:
1. **Authentication** (user must be logged in)
2. **Role checking** (implemented but needs user role configuration)

## Steps to Access Admin

### Option 1: Update User Role in Supabase (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `utgzpkwetjrpwpswxqjb`

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Go to "Users"

3. **Find Your User**
   - Locate the user you want to make admin
   - Click on the user to edit

4. **Update User Metadata**
   - Click on "Edit User" or "Raw User Metadata"
   - Add or update the `role` field:
   ```json
   {
     "role": "admin",
     "name": "Your Name"
   }
   ```
   - Click "Save"

5. **Access Admin Panel**
   - Go to: http://localhost:3000/admin
   - You should now have access!

### Option 2: Create a Script to Grant Admin Access

Create a file called `scripts/grant-admin-access.ts`:

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

async function grantAdminAccess() {
  const supabase = createAdminClient()
  
  // Replace with your user email
  const userEmail = 'your-email@example.com'
  
  // Get user
  const { data: users, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  const user = users.users.find(u => u.email === userEmail)
  
  if (!user) {
    console.error('User not found')
    return
  }
  
  // Update user metadata
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        ...user.user_metadata,
        role: 'admin'
      }
    }
  )
  
  if (updateError) {
    console.error('Error updating user:', updateError)
    return
  }
  
  console.log('✅ Admin access granted!')
}

grantAdminAccess()
```

### Option 3: SQL Command in Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Run this query (replace the email with yours):

```sql
-- Update user role to admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

## Verify Admin Access

1. **Log out** of the application (if logged in)
2. **Log back in** with your admin account
3. **Navigate to**: http://localhost:3000/admin
4. You should see the admin dashboard

## Admin Dashboard Features

The admin dashboard at `/admin` includes:
- ✅ **Dashboard** (`/admin`)
  - Total Stores
  - Pending Withdrawals
  - Total Transactions
  - Pending Stores
  
- ✅ **Withdrawals** (`/admin/withdrawals`)
  - View and manage agent withdrawal requests
  - Approve or reject withdrawals

## Current Protection

The admin routes are protected in `middleware.ts`:
- Users must be authenticated
- Currently checks `user` existence
- Should also check `user.user_metadata.role === 'admin'`

## Recommended: Add Role Check to Middleware

Update `middleware.ts` to check for admin role:

```typescript
// Protect admin routes
if (url.pathname.startsWith('/admin')) {
  if (!user) {
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  
  // Check if user is admin
  const role = user.user_metadata?.role || 'customer'
  if (role !== 'admin') {
    url.pathname = '/unauthorized'
    return NextResponse.redirect(url)
  }
}
```

## Quick Test

After updating your user role to admin:

1. Clear your browser cache or use incognito mode
2. Log in again
3. Visit: http://localhost:3000/admin
4. You should see the admin dashboard

## Troubleshooting

### "Unauthorized" Error
- Check if your user metadata has `role: 'admin'`
- Try logging out and logging back in
- Clear browser cookies

### Can't Update User in Supabase
- Make sure you have admin access to the Supabase project
- Use the SQL editor as an alternative

### Still Redirecting to Login
- Check browser console for errors
- Verify middleware is checking roles correctly
- Ensure you're logged in

## Next Steps

1. ✅ Update middleware to check admin role
2. ✅ Create unauthorized page for non-admin access
3. ✅ Add more admin features as needed
4. ✅ Add admin user management in the admin dashboard

---

**Note:** The admin panel is currently accessible to any authenticated user. Add role checking for production use.

