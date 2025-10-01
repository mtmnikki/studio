# 🚀 Firebase → Supabase + Vercel Migration Guide

## ✅ Migration Complete!

Your billing platform has been **fully migrated** from Firebase to Supabase + Vercel! Here's what was done:

---

## 📦 What Changed

### **Removed**
- ❌ Firebase SDK (`firebase` package)
- ❌ Firebase Auth
- ❌ Firestore Database
- ❌ Firebase Storage
- ❌ Firebase Data Connect (Google-specific)
- ❌ Genkit AI (Google-specific)
- ❌ All Firebase configuration files
- ❌ `src/firebase/` directory
- ❌ `src/ai/` directory
- ❌ `src/dataconnect-generated/` directory

### **Added**
- ✅ Supabase SDK (`@supabase/supabase-js`, `@supabase/ssr`)
- ✅ Supabase Auth
- ✅ Supabase PostgreSQL Database
- ✅ Supabase Storage
- ✅ Supabase Realtime subscriptions
- ✅ Next.js middleware for auth
- ✅ `src/lib/supabase/` utilities
- ✅ `src/middleware.ts` for session management

---

## 🎯 Setup Instructions

### **Step 1: Create Supabase Project**

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `jenn-billing-studio` (or your choice)
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**

### **Step 2: Get API Credentials**

1. In your Supabase dashboard, go to **Settings → API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`, keep this secret!)

### **Step 3: Update Environment Variables**

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

### **Step 4: Run Database Schema**

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` in your project root
4. Copy and paste the entire contents into the SQL Editor
5. Click **"Run"** or press `Ctrl/Cmd + Enter`
6. Verify tables were created: Go to **Table Editor** and you should see:
   - `patients`
   - `pharmacies`
   - `notes`
   - `claims`

### **Step 5: Configure Storage**

The schema automatically creates a storage bucket called `files`. To verify:

1. In Supabase dashboard, go to **Storage**
2. You should see a bucket named **"files"**
3. (Optional) Adjust policies if needed

### **Step 6: Create First User**

1. In Supabase dashboard, go to **Authentication → Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: your email address
   - **Password**: your password (min 6 characters)
4. Click **"Create user"**

---

## 🧪 Testing Locally

1. Install dependencies (if you haven't):
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:9002](http://localhost:9002)

4. Go to `/login` and sign in with the user you created

5. Test the following:
   - ✅ Login/Logout
   - ✅ Dashboard loads
   - ✅ Navigate to Patients, Pharmacies, Notes
   - ✅ File Library (Storage page)
   - ✅ Import Data

---

## 🚀 Deploying to Vercel

### **Option 1: Via Vercel Dashboard (Easiest)**

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Add New..." → "Project"**
3. Import your Git repository
4. In **"Configure Project"**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click **"Environment Variables"**
6. Add the following:
   - `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)
7. Click **"Deploy"**

### **Option 2: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

---

## 📚 Database Schema Overview

### **Tables**

| Table | Description | Key Fields |
|-------|-------------|------------|
| `patients` | Patient records | `id`, `first_name`, `last_name`, `email`, `phone` |
| `pharmacies` | Pharmacy information | `id`, `name`, `npi`, `status`, `services` |
| `notes` | User notes | `id`, `title`, `content`, `tags`, `pinned` |
| `claims` | Billing claims | `id`, `check_date`, `patient_id`, `amount`, `paid`, `payment_status` |

### **Storage**

- **Bucket**: `files`
- **Purpose**: Store uploaded documents, statements, exports
- **Access**: Authenticated users only

---

## 🔧 Updated File Structure

```
src/
├── lib/
│   └── supabase/
│       ├── client.ts          # Browser Supabase client
│       ├── server.ts          # Server Supabase client
│       ├── middleware.ts      # Session management
│       └── hooks.ts           # React hooks for Supabase
├── hooks/
│   ├── use-claims.ts          # Claims CRUD operations
│   ├── use-patients.ts        # Patients CRUD operations
│   ├── use-pharmacies.ts      # Pharmacies CRUD operations
│   └── use-notes.ts           # Notes CRUD operations
├── middleware.ts              # Next.js auth middleware
└── app/
    ├── (app)/
    │   ├── layout.tsx         # Authenticated layout
    │   ├── dashboard/
    │   ├── patients/
    │   ├── pharmacies/
    │   ├── notes/
    │   ├── import/
    │   └── storage/           # File library (Supabase Storage)
    └── login/
        └── page.tsx           # Supabase Auth login
```

---

## 🎉 You're Done!

Your app is now:
- ✅ **Google-free**: No Firebase, no Genkit, no Data Connect
- ✅ **Vercel-ready**: Optimized for Vercel deployment
- ✅ **Supabase-powered**: Auth, Database, Storage, Realtime
- ✅ **Production-ready**: RLS policies, indexes, triggers in place

---

## 🆘 Troubleshooting

### **"Invalid API key" error**
- Double-check your `.env.local` file
- Make sure you copied the **anon key** (not the service role key) for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after changing `.env.local`

### **"relation does not exist" error**
- Run the `supabase-schema.sql` script in your Supabase SQL Editor
- Verify tables exist in **Table Editor**

### **Can't log in**
- Make sure you created a user in **Authentication → Users**
- Check that your email and password are correct
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly

### **Storage bucket errors**
- Go to **Storage** in Supabase dashboard
- Verify the `files` bucket exists
- Check bucket policies are set up correctly (run the schema script if not)

---

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Need help?** Open an issue in your repository or contact your team lead!
