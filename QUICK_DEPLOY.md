# 🚀 Quick Deployment Guide to Vercel

## ✅ Step 1: Code Pushed to GitHub (COMPLETED)
Your code has been successfully pushed to: https://github.com/danaasamuel2023/UNLIMAGENT-.git

## 📝 Step 2: Deploy to Vercel

You have two options:

### Option A: Deploy via Vercel Website (EASIEST)

1. **Go to Vercel Dashboard**: https://vercel.com/new
2. **Sign up / Login** with your GitHub account
3. **Import Your Repository**:
   - Click "Import Project"
   - Select repository: `danaasamuel2023/UNLIMAGENT-`
4. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)
5. **Add Environment Variables** (CRITICAL):
   Click "Environment Variables" and add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATA_MART_API_URL=https://server-datamart-reseller.onrender.com/api
   DATA_MART_API_KEY=your_datamart_api_key
   DATA_MART_API_SECRET=your_datamart_api_secret
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```

6. **Deploy**:
   - Click "Deploy" button
   - Wait for build to complete (3-5 minutes)

### Option B: Deploy via Vercel CLI

Run these commands in your terminal:

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## ⚙️ Step 3: Post-Deployment Configuration

### 3.1 Update APP_URL
After deployment, update the `NEXT_PUBLIC_APP_URL` environment variable in Vercel:
1. Go to Project Settings > Environment Variables
2. Edit `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
3. Redeploy

### 3.2 Configure Supabase
1. Go to your Supabase Dashboard
2. Navigate to Authentication > URL Configuration
3. Add these URLs:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: 
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/login`

### 3.3 Configure Paystack Webhook
1. Go to Paystack Dashboard > Settings > API & Webhooks
2. Add webhook URL: `https://your-app.vercel.app/api/webhooks/paystack`
3. Save

### 3.4 Update Supabase API Settings
1. Go to Supabase Dashboard > Settings > API
2. Add your Vercel domain to CORS allowed origins:
   - `https://your-app.vercel.app`
   - `https://*.vercel.app`

## 🧪 Step 4: Test Your Deployment

Visit your deployed app: `https://your-app.vercel.app`

Test these features:
- ✅ Home page loads
- ✅ User signup/login works
- ✅ Admin panel accessible at `/admin`
- ✅ Agent panel accessible at `/agent`
- ✅ Payment flow works
- ✅ Webhooks receive events

## 📊 Step 5: Monitor Your Deployment

### Vercel Dashboard
- View builds and deployments
- Check logs for errors
- Monitor analytics
- View function logs

### Function Logs
```bash
# View real-time logs
vercel logs

# View logs for specific deployment
vercel logs [deployment-url]
```

## 🔄 Making Updates

To update your deployment after making changes:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main

# Vercel will automatically deploy on push to main
```

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `package.json` has all dependencies

### Environment Variables Not Working
- Redeploy after adding new variables
- Check variable names are correct (case-sensitive)
- Verify values don't have extra spaces

### API Routes Not Working
- Check Vercel Function logs
- Verify database connections
- Check CORS settings in Supabase

### Still Having Issues?
1. Check Vercel documentation: https://vercel.com/docs
2. Check Next.js deployment guide: https://nextjs.org/docs/deployment
3. Review your build logs in Vercel dashboard

## 📝 Quick Command Reference

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Link project to Vercel (if not done automatically)
vercel link

# Check deployment status
vercel ls
```

## 🎉 Success!

Once deployed, your app will be live at: `https://your-app.vercel.app`

You can share this URL with users or add a custom domain!

