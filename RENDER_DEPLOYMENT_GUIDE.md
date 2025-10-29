# 🚀 Render Deployment Guide

## Prerequisites
- GitHub account with your code pushed
- Render account (sign up at https://render.com)

## Step-by-Step Deployment

### Step 1: Push Code to GitHub (Already Done ✅)
Your code is already at: https://github.com/danaasamuel2023/UNLIMAGENT-.git

### Step 2: Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account

### Step 3: Create New Web Service
1. Go to your Render Dashboard
2. Click **"New +"** button
3. Select **"Web Service"**

### Step 4: Connect Your Repository
1. Click **"Connect GitHub"** or **"Connect GitLab"**
2. Authorize Render to access your repositories
3. Search for `UNLIMAGENT-` repository
4. Click **"Connect"**

### Step 5: Configure Service Settings
Use these settings:

**Basic Settings:**
- **Name:** `datastore-unlimagent`
- **Region:** Frankfurt (or closest to your users)
- **Branch:** `main`
- **Root Directory:** `.` (leave empty or enter `.`)

**Build & Deploy:**
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### Step 6: Add Environment Variables
Click **"Add Environment Variable"** and add each of these:

```
NODE_ENV=production

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

DATA_MART_API_URL=https://server-datamart-reseller.onrender.com/api
DATA_MART_API_KEY=your_datamart_api_key
DATA_MART_API_SECRET=your_datamart_api_secret

PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

NEXT_PUBLIC_APP_URL=https://datastore-unlimagent.onrender.com
```

**Important:** Replace `your_*` values with your actual credentials.

### Step 7: Deploy
1. Click **"Create Web Service"**
2. Render will start building your app
3. Wait 5-10 minutes for the build to complete
4. Your app will be live at: `https://datastore-unlimagent.onrender.com`

### Step 8: Post-Deployment Configuration

#### 8.1 Update APP_URL
After deployment, update the `NEXT_PUBLIC_APP_URL` environment variable in Render with your actual URL.

#### 8.2 Configure Supabase
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add these URLs:
   - Site URL: `https://datastore-unlimagent.onrender.com`
   - Redirect URLs:
     - `https://datastore-unlimagent.onrender.com/auth/callback`
     - `https://datastore-unlimagent.onrender.com/login`

#### 8.3 Configure Paystack Webhook
1. Go to Paystack Dashboard > Settings > API & Webhooks
2. Add webhook URL: `https://datastore-unlimagent.onrender.com/api/webhooks/paystack`

#### 8.4 Update Supabase CORS Settings
1. Go to Supabase Dashboard > Settings > API
2. Add your Render domain to allowed origins:
   - `https://datastore-unlimagent.onrender.com`

## Render Configuration Details

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

### Auto-Deploy
Render will automatically:
- ✅ Deploy when you push to the `main` branch
- ✅ Run your tests (if configured)
- ✅ Build and deploy your app

## Pricing

### Free Tier (Hobby Plan)
- ✅ 750 hours/month (enough for 24/7 free tier)
- ✅ Automatic SSL certificates
- ✅ Free tier spins down after 15 minutes of inactivity
- ⚠️ Cold starts may take 30-60 seconds after spin down

### Paid Tier (Starter Plan - $7/month)
- ✅ Always on (no spin downs)
- ✅ Faster response times
- ✅ More resources
- ✅ Better for production

## Troubleshooting

### Build Fails
1. Check the build logs in Render dashboard
2. Ensure all environment variables are set
3. Verify `package.json` has correct dependencies

### App Won't Start
1. Check the runtime logs
2. Verify PORT environment variable (Render auto-assigns this)
3. Ensure start command is correct

### 404 Errors
1. Check that API routes are in `app/api/` directory
2. Verify middleware is configured correctly
3. Check Next.js routing configuration

### Environment Variables Not Working
1. Ensure variables are added in Render dashboard
2. Redeploy after adding new variables
3. Check for typos in variable names

### Cold Start Issues
- Consider upgrading to Starter plan for always-on service
- Or use Vercel (better for Next.js, free tier is always-on)

## Render vs Vercel

| Feature | Render | Vercel |
|---------|--------|--------|
| Next.js Optimization | Good | Excellent |
| Free Tier Always-On | ❌ (spins down) | ✅ |
| Serverless Functions | ✅ | ✅ |
| Custom Domains | ✅ | ✅ |
| Auto SSL | ✅ | ✅ |
| Build Time | 5-10 min | 2-5 min |
| Cold Start | 30-60s (free) | <100ms |

## Monitoring

### View Logs
- Go to Render Dashboard > Your Service > Logs
- View real-time logs during deployment
- Check runtime logs for errors

### View Metrics
- Click on your service in Dashboard
- View CPU, Memory, and Network usage
- Monitor response times

## Custom Domain Setup (Optional)

1. Go to your service in Render Dashboard
2. Click **"Settings"** > **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `app.unlimiteddatagh.com`)
5. Follow DNS configuration instructions
6. Update `NEXT_PUBLIC_APP_URL` environment variable

## Quick Command Reference

```bash
# View your deployment logs
# (In Render Dashboard > Logs tab)

# Trigger manual deployment
# (In Render Dashboard > Manual Deploy button)

# View service status
# (In Render Dashboard > Overview)
```

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Status Page: https://status.render.com

## Alternative: Deploy to Vercel

If you experience issues with Render, consider Vercel which is optimized for Next.js:
- Better performance for Next.js apps
- Always-on free tier
- Faster builds
- See `QUICK_DEPLOY.md` for Vercel deployment guide

---

**Ready to deploy?** Follow the steps above and your app will be live on Render in ~10 minutes!

