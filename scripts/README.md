# Setup Scripts

## Admin Setup

After running the database migration and signing up for an account, you can make yourself an admin:

```bash
npx tsx scripts/setup-admin.ts your-email@example.com
```

This will set your user role to "admin" and grant you access to the admin dashboard.

## Prerequisites

1. Run the database migration in Supabase
2. Sign up at http://localhost:3001/signup
3. Run the admin setup script with your email

