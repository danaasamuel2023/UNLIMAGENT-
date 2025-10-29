# Production Environment Variables

## 🎯 Your Production URL
**https://unlimagent.onrender.com**

## ✅ Environment Variables for Render

Copy and paste these into your Render Dashboard (Settings > Environment):

```bash
# Production Environment
NODE_ENV=production

# Supabase Configuration (Get from Supabase Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Data Mart API
DATA_MART_API_URL=https://server-datamart-reseller.onrender.com/api
DATA_MART_API_KEY=your_datamart_api_key
DATA_MART_API_SECRET=your_datamart_api_secret

# Paystack Payment Gateway (Get from Paystack Dashboard > Settings > API Keys)
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Production App URL (UPDATE THIS!)
NEXT_PUBLIC_APP_URL=https://unlimagent.onrender.com
```

## 📋 Post-Deployment Checklist

### ✅ 1. Update Supabase Settings
Go to: https://supabase.com/dashboard/project/_/settings/auth

**Site URL:**
```
https://unlimagent.onrender.com
```

**Redirect URLs (add these):**
```
https://unlimagent.onrender.com/auth/callback
https://unlimagent.onrender.com/login
https://unlimagent.onrender.com/dashboard
```

### ✅ 2. Configure Paystack Webhook
Go to: https://dashboard.paystack.com/#/settings/developer

**Webhook URL:**
```
https://unlimagent.onrender.com/api/webhooks/paystack
```

### ✅ 3. Update Supabase CORS
Go to: https://supabase.com/dashboard/project/_/settings/api

**Additional Allowed Origins:**
```
https://unlimagent.onrender.com
```

### ✅ 4. Verify Environment Variables in Render
1. Go to Render Dashboard > Your Service > Environment
2. Verify `NEXT_PUBLIC_APP_URL` is set to `https://unlimagent.onrender.com`
3. Ensure all other variables are set correctly
4. **Redeploy** if you made changes

## 🔍 Quick Test Checklist

After deployment, test these:

- [ ] Homepage loads: https://unlimagent.onrender.com
- [ ] Sign up works: https://unlimagent.onrender.com/signup
- [ ] Login works: https://unlimagent.onrender.com/login
- [ ] Admin panel accessible: https://unlimagent.onrender.com/admin
- [ ] Agent panel accessible: https://unlimagent.onrender.com/agent
- [ ] Payment flow works
- [ ] Webhooks receive events

## 🐛 Troubleshooting

### App Shows "Loading..."
- Check Render logs for errors
- Verify all environment variables are set
- Check Supabase connection

### Authentication Not Working
- Verify Supabase redirect URLs are configured
- Check `NEXT_PUBLIC_APP_URL` matches your Render URL
- Clear browser cache and try again

### Payment Issues
- Verify Paystack webhook URL is set
- Check Paystack keys are correct
- Review payment callback URLs

## 📊 Your Live URLs

- **Main App:** https://unlimagent.onrender.com
- **Stores:** https://unlimagent.onrender.com/stores
- **Admin:** https://unlimagent.onrender.com/admin
- **Agent:** https://unlimagent.onrender.com/agent
- **API Health:** https://unlimagent.onrender.com/api/health (if configured)

