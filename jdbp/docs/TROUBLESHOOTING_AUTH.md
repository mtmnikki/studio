# Troubleshooting "Failed to Fetch" Authentication Error

## Quick Fixes (Try these first)

### 1. Restart the Dev Server
The most common fix - environment variables need a server restart to take effect.

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Clear Browser Cache and Hard Reload
- **Chrome/Edge**: Press `Ctrl+Shift+Delete`, select "Cached images and files", then click Clear
- Or use incognito/private mode: `Ctrl+Shift+N`
- After clearing, do a hard reload: `Ctrl+F5`

### 3. Check Browser Console
1. Open browser DevTools: `F12`
2. Go to Console tab
3. Try logging in again
4. Look for error messages (should now show detailed logs)

### 4. Verify Environment Variables in Browser
Visit the test page: **http://localhost:9002/test-auth**
- Click "Run Connection Test"
- This will show exactly what's failing

## Common Issues

### Issue: "Failed to Fetch" Error

**Cause**: Usually happens when environment variables aren't loaded or the server needs restart.

**Solution**:
1. Stop dev server (`Ctrl+C`)
2. Verify `.env.local` exists and has correct values
3. Restart: `npm run dev`
4. Clear browser cache
5. Try again

### Issue: Environment Variables Show as `undefined`

**Cause**: Missing `NEXT_PUBLIC_` prefix or server not restarted.

**Solution**:
```bash
# Check your .env.local has these exact keys:
NEXT_PUBLIC_SUPABASE_URL=https://xeyfhlmflsibxzjsirav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

Restart the dev server after any changes.

### Issue: "Invalid login credentials"

**Cause**: Wrong email/password OR user not in database.

**Solution**:
1. Go to Supabase Dashboard → Authentication → Users
2. Verify the user exists
3. Try resetting the password
4. Make sure the user is in `public.accounts` table:
   ```sql
   SELECT * FROM public.accounts WHERE email = 'your-email@example.com';
   ```

### Issue: CORS Error in Console

**Cause**: Supabase project settings or local network issue.

**Solution**:
1. Check Supabase is not paused (Dashboard → Project Settings)
2. Verify you're using the correct project URL
3. Check your firewall/antivirus isn't blocking requests

## Diagnostic Steps

### Step 1: Verify Supabase Connection (Node.js)
```bash
node test-supabase-connection.js
```

All tests should pass. If they don't, your Supabase project might be paused or the keys are wrong.

### Step 2: Check Browser Connection
Visit: http://localhost:9002/test-auth

Click "Run Connection Test" and verify all checks pass.

### Step 3: Check Network Tab
1. Open DevTools (`F12`)
2. Go to Network tab
3. Try logging in
4. Look for requests to `supabase.co`
5. Check if any are failing

## Still Not Working?

### Manual Test Login

1. Open browser console (`F12`)
2. Paste this code:
```javascript
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

const supabase = createClient(
  'https://xeyfhlmflsibxzjsirav.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhleWZobG1mbHNpYnh6anNpcmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Mjg5ODQsImV4cCI6MjA2OTUwNDk4NH0._wwYVbBmqX26WpbBnPMuuSmUTGG-XhxDwg8vkUS_n8Y'
);

const result = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
});

console.log('Result:', result);
```

If this works, the issue is with your app code. If it fails, the issue is with Supabase or network.

## Check Supabase Project Status

1. Go to: https://supabase.com/dashboard/project/xeyfhlmflsibxzjsirav
2. Look for any warnings or paused status
3. Check Project Settings → API → Project URL and API keys match your `.env.local`

## Reset Everything

If all else fails:

1. **Stop the dev server**
2. **Delete `.next` folder**:
   ```bash
   rm -rf .next
   # or on Windows:
   rmdir /s /q .next
   ```
3. **Clear browser cache completely**
4. **Restart dev server**:
   ```bash
   npm run dev
   ```
5. **Open in incognito mode**
6. **Try login again**

## Contact Info

If you're still stuck, provide these details:
- Output from `node test-supabase-connection.js`
- Output from http://localhost:9002/test-auth
- Browser console errors (screenshot or copy)
- Network tab showing the failed request
