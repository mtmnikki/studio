# Authentication Setup Guide

This guide will help you set up authentication so you can access the application.

## Prerequisites

1. Your Supabase project is already configured in `.env.local`
2. The application is built and ready to run

## Step 1: Run the Supabase Schema

Before you can log in, you need to set up the database schema including the authentication tables.

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (xeyfhlmflsibxzjsirav)
3. Navigate to **SQL Editor** in the left sidebar
4. Run the schema file: `supabase-schema-v3-with-rls.sql`

## Step 2: Create Your First User

You have two options to create a user:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **Authentication** > **Users** in the left sidebar
3. Click **Add user** > **Create new user**
4. Enter your email and password
5. Click **Create user**
6. **Important**: After creating the user, you need to add them to the `public.accounts` table:
   - Go to **SQL Editor**
   - Run this query (replace with your actual user details):
   ```sql
   -- Get the user ID first
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

   -- Insert into accounts table (use the ID from above)
   INSERT INTO public.accounts (id, email, role, pharmacy_name)
   VALUES (
     'paste-user-id-here',
     'your-email@example.com',
     'admin',  -- or 'user' for regular users
     'Harps Pharmacy #144'  -- only needed for non-admin users
   );
   ```

### Option B: Using Supabase Auth UI (Alternative)

1. Make sure your application is running (`npm run dev`)
2. Navigate to `/login`
3. If you have sign-up enabled, you can register a new account
4. After registering, follow step 6 from Option A to add the user to the accounts table

## Step 3: Verify Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. You should be automatically redirected to `/login`

4. Enter your email and password

5. If successful, you'll be redirected to `/dashboard`

## Troubleshooting

### "Invalid login credentials"
- Double-check your email and password
- Make sure you confirmed your email (if email confirmation is enabled in Supabase)
- Check Supabase dashboard to verify the user exists

### Stuck on loading screen
- Check browser console for errors
- Verify your `.env.local` has the correct Supabase URL and anon key
- Make sure the Supabase project is not paused

### Redirects to login immediately after signing in
- The user might not exist in the `public.accounts` table
- Run the SQL query from Step 2 to add them

### 401 Unauthorized errors on API calls
- Check that Row Level Security (RLS) policies are enabled
- Verify the user has the correct role in the `public.accounts` table
- For testing, you can temporarily disable RLS on a table to verify it's an RLS issue

## User Roles

### Admin Users
- Have full CRUD access to all tables
- Can access all pharmacy data
- Can delete records

### Regular Users
- Can only READ, INSERT, and UPDATE (no DELETE)
- Can only access claims where `pharmacy_of_service` matches their `pharmacy_name` in the accounts table
- Limited to their assigned pharmacy

## Quick Test User Setup

For quick testing, here's a complete SQL script to create an admin user:

```sql
-- This will be handled by the trigger when a user signs up via Auth
-- But if you created a user manually in the Auth dashboard, add them to accounts:

-- First, get the user ID from auth.users
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert into accounts (replace 'user-id-here' with actual ID)
INSERT INTO public.accounts (id, email, role, pharmacy_name)
VALUES (
  'user-id-here',
  'your-email@example.com',
  'admin',
  NULL  -- admin doesn't need pharmacy_name
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  pharmacy_name = EXCLUDED.pharmacy_name;
```

## Next Steps

Once authenticated, you can:
1. Navigate to **Import Data** to upload CSV files with AI-powered parsing
2. View claims in the **Dashboard**
3. Generate and download PDF statements for patients
4. Manage patients and pharmacies

## Environment Variables

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xeyfhlmflsibxzjsirav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-key  # Optional, for CSV parsing
```
