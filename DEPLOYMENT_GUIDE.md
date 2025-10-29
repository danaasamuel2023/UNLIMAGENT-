# Deployment Guide for Vercel

## Pre-Deployment Checklist

### 1. Environment Variables
Make sure you have all required environment variables ready:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# Data Mart API
DATA_MART_API_URL=https://server-datamart-reseller.onrender.com/api
DATA_MART_API_KEY=your_datamart_api_key
DATA_MART beaucoup_SECRET=your_datamart_api_secret

# Paystack Payment Gateway
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Application URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Add Environment Variables**:
   - Go to your project on Vercel Dashboard
   - Navigate to Settings > Environment Variables
   - Add all the environment variables from above
   - For production, also add each variable for "Production" environment

5. **Redeploy**:
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Select "Redeploy"

### Option 2: Deploy via GitHub

1. **Push code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Connect GitHub to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

3. **Add Environment Variables** (same as Option 1)

4. **Deploy**: Click "Deploy" and Vercel will build and deploy automatically

## Post-Deployment Steps

### 1. Update APP_URL
After deployment, update the `NEXT_PUBLIC_APP_URL` environment variable in Vercel to match your production URL.

### 2. Configure Supabase
- Update allowed redirect URLs in Supabase to include your production URL
- Update allowed origins for API requests

### 3. Update Paystack Webhook
- Go to Paystack Dashboard > Settings > API & Webhooks
- Add webhook URL: `https://your-app.vercel.app/api/webhooks/paystack`

### 4. Test Production Build Locally
```bash
npm run build
npm run start
```

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure TypeScript configuration is correct
- Check for any import errors

### Environment Variable Issues
- Ensure all required variables are set in Vercel
- Check that variable names match exactly (case-sensitive)
- Redeploy after adding new environment variables

### Runtime Errors
- Check Vercel logs for detailed error messages
- Verify database connections
- Check API endpoint configurations

## Custom Domain Setup

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Redeploy

## Monitoring

- Check Vercel Dashboard for deployment status
- Monitor Function logs for API route issues
- Set up error tracking (Sentry recommended)

## Backend Note

Your Express backend in the `backend/` folder is NOT needed for Vercel deployment.
All backend functionality is handled by Next.js API routes in `app/api/`.
The Express server can be removed or kept for local development only.

## Quick Deploy Command

```bash
# One-time setup
npm i -g vercel
vercel login

# Deploy
vercel --prod
```

