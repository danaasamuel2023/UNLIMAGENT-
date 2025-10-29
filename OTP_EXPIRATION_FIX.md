# OTP Expiration Issue - Fixed

## Problem
Getting `"code":403,"error_code":"otp_expired","msg":"Email link is invalid or has expired"` when trying to verify signup.

## Root Cause
Supabase email verification links (OTP tokens) expire after a certain period (typically 1 hour). When users click an expired link, they get this error.

## Solution Implemented

### 1. Enhanced Verify Email Page
The `/verify-email` page now:
- ✅ Detects expired OTP links automatically
- ✅ Shows a clear error message when link expires
- ✅ Provides a "Resend Verification Email" button
- ✅ Allows users to enter their email and request a new verification link
- ✅ Shows success confirmation when email is resent

### 2. Improved Signup Flow
- ✅ Email is now included in the verification page URL
- ✅ Proper redirect URL is set in the signup options
- ✅ Better error handling and user feedback

### 3. Environment Configuration
Update your `.env.local` file to match your current dev server port:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

**Note:** The port might be different if 3003 is also in use. Check your terminal output for the actual port.

## How to Use

### For New Signups
1. Go to `/signup` and create an account
2. You'll be redirected to `/verify-email` with your email in the URL
3. Check your email and click the verification link within 1 hour
4. You'll be automatically logged in and redirected to `/dashboard`

### For Expired Links
If you get the OTP expired error:

1. **Option 1:** Go directly to `/verify-email?error_code=otp_expired&email=your@email.com`
2. **Option 2:** Click the "Resend Verification Email" button on the verify-email page
3. Enter your email if prompted
4. Click the button to request a new verification email
5. Check your inbox for the new link
6. Click the new link (valid for 1 hour)

### Manual Resend
If you're already on the verify-email page and need to resend:
1. Enter your email address
2. Click "Resend Verification Email"
3. Wait for the confirmation message
4. Check your inbox and spam folder
5. Click the new verification link

## Configuration in Supabase Dashboard

### To Extend OTP Expiration Time

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Settings**
4. Scroll to **Email Auth**
5. Find **OTP Expiry** setting
6. Increase the expiry time (default is 3600 seconds = 1 hour)
7. Save changes

**Recommended:** Set it to 24 hours (86400 seconds) for better user experience during development.

### Email Templates Configuration

1. Go to **Authentication** → **Email Templates**
2. Configure the **Confirm signup** template
3. Make sure the confirmation link points to: `http://localhost:3003/auth/callback?next=/dashboard`
4. Or use your production URL when deploying

## Testing

### Test the Fix
1. Sign up with a new email
2. Click the verification link immediately (should work)
3. Wait 1+ hour and try an old link (should show expired error)
4. Use the resend button to get a new link
5. Click the new link (should work)

### Test Scenarios
- ✅ New signup with immediate verification
- ✅ Expired link detection
- ✅ Resend verification email
- ✅ Manual email entry for resend
- ✅ Success and error states
- ✅ Proper redirect after verification

## Additional Improvements Needed

### Supabase Configuration
1. **Email Rate Limiting**: Configure to prevent abuse
2. **Custom Email Template**: Style the verification emails
3. **Redirect URL Whitelist**: Add your domains to Supabase settings
4. **Magic Link**: Consider adding magic link auth as an alternative

### Future Enhancements
1. Add email input field to verify-email page for easier resend
2. Add countdown timer showing link expiry time
3. Add "Change Email" option
4. Add SMS verification as alternative
5. Implement account recovery flow

## Quick Commands

```bash
# Check current server port
# Look at terminal output when running 'npm run dev'

# Update .env.local with correct port
NEXT_PUBLIC_APP_URL=http://localhost:[PORT]

# Restart dev server
npm run dev
```

## Troubleshooting

### Still Getting Expired Errors?
1. Make sure the app URL in `.env.local` matches your server port
2. Check Supabase dashboard for OTP expiry settings
3. Clear browser cache and cookies
4. Try incognito/private browsing mode

### Email Not Sending?
1. Check Supabase dashboard → Authentication → Email
2. Verify email settings are configured
3. Check spam folder
4. Try a different email provider

### Redirect Not Working?
1. Verify `/auth/callback/route.ts` exists and is correct
2. Check that the redirect URL in signup matches the one in Supabase dashboard
3. Test the callback route directly: `http://localhost:3003/auth/callback?code=test`

## Status
✅ **FIXED** - The verify-email page now handles expired OTP links gracefully and allows users to resend verification emails.

