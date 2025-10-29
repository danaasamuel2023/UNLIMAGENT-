# 🔐 Email Verification Setup Guide

## How Email Verification Works

The email verification flow is already built into the application! Here's how it works:

### Current Flow:

1. **User Signs Up** (`/signup`)
   - User enters email, password, name, and role
   - Supabase sends verification email automatically
   - User is redirected to `/verify-email` page

2. **Verification Email Sent**
   - Contains a unique verification link
   - Link points to: `http://localhost:3000/auth/callback`
   - Token included in the URL

3. **User Clicks Link**
   - Auth callback route processes the verification
   - User's email is confirmed
   - User is redirected to dashboard

4. **Account Active**
   - User can now log in normally
   - Verified users can access protected routes

---

## ⚙️ Supabase Configuration Required

### 1. Configure Email Templates in Supabase

Go to your Supabase Dashboard:
1. Navigate to: **Authentication** → **Email Templates**
2. Find the **Confirm signup** template
3. Update the confirmation URL to:
   ```
   {{ .SiteURL }}/auth/callback?next=/dashboard
   ```

### 2. Set Site URL

In Supabase Dashboard:
1. Go to: **Project Settings** → **API**
2. Set **Site URL** to: `http://localhost:3000`
3. Add redirect URL: `http://localhost:3000/auth/callback`

### 3. Configure Email Provider (Choose One)

#### Option A: Supabase Default (Development)
- Supabase sends emails via their service
- Good for testing
- Limited to 3 emails/hour on free tier
- Emails may go to spam

#### Option B: Custom SMTP (Production Recommended)
1. Go to: **Project Settings** → **Auth** → **SMTP Settings**
2. Add your email provider credentials:
   - Gmail, SendGrid, Mailgun, etc.
   - More reliable delivery
   - Professional appearance

### 4. Email Configuration Example

For production, use your email provider:

**Gmail SMTP:**
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password
```

**SendGrid:**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your-sendgrid-api-key
```

---

## 🧪 Testing Email Verification

### Test the Flow:

1. **Sign up a new account:**
   - Go to: `http://localhost:3000/signup`
   - Fill in the form
   - Select "Agent" or "Customer"
   - Submit

2. **Check your email:**
   - Look for email from Supabase
   - Subject: "Confirm your signup"
   - Check spam folder if not found

3. **Click the verification link:**
   - Should redirect to dashboard
   - Account is now verified

4. **Try logging in:**
   - Go to `/login`
   - Enter credentials
   - Should work now!

---

## 🔧 Troubleshooting

### Issue: Email Not Received

**Solutions:**
1. Check spam/junk folder
2. Verify Supabase project is active
3. Check Supabase logs: **Authentication** → **Logs**
4. Try resending email from Supabase dashboard
5. Use test email for development

### Issue: Email Goes to Spam

**Solutions:**
1. Configure custom SMTP
2. Add SPF/DKIM records
3. Use a professional email service
4. Verify sender domain

### Issue: Verification Link Expired

**Solutions:**
1. Request a new verification email
2. Go to `/signup` again with same email
3. Supabase will resend verification
4. Or manually verify in Supabase dashboard

### Issue: Redirect Not Working

**Solutions:**
1. Check redirect URL in Supabase settings
2. Verify `app/auth/callback/route.ts` exists
3. Check middleware configuration
4. Ensure environment variables are set

---

## 📝 Environment Variables

Make sure `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🚀 Development vs Production

### Development (localhost:3000):
- Uses Supabase default email
- Verification link: `http://localhost:3000/auth/callback`
- Good for testing
- Email delivery may be slow

### Production:
- Configure custom SMTP
- Use your domain: `https://yourdomain.com/auth/callback`
- Professional email delivery
- Better deliverability

---

## ✅ Verification Features Already Implemented

✅ Signup form with email
✅ Auto-redirect to verification page
✅ Verification email template
✅ Auth callback handler
✅ Automatic email sending
✅ Session management
✅ Protected routes

**The system is ready - you just need to configure Supabase email settings!**

---

## 📞 Need Help?

1. Check Supabase documentation: https://supabase.com/docs/guides/auth
2. Review authentication logs in Supabase dashboard
3. Test with a real email address
4. Verify environment variables are correct
5. Check middleware.ts configuration

**The email verification system is fully functional - configure Supabase and it will work!**

