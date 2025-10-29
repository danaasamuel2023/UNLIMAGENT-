# Agent Store System - Data Bundle Reseller Platform

A comprehensive multi-agent marketplace system for selling data bundles in Ghana, built with Next.js, Supabase, and Vercel.

## 🚀 Features

### For Admins
- Approve/manage agent stores
- Monitor all transactions
- Process withdrawal requests
- View analytics and reports
- Manage violations and suspensions

### For Agents
- Create and manage store profile
- Set up product catalog with custom pricing
- Track earnings and wallet balance
- Manage customers (CRM)
- Request withdrawals
- View analytics and insights
- Configure business hours
- Set commission margins

### For Customers
- Browse agent stores by slug
- View product catalogs
- Place orders
- Contact agents via WhatsApp
- Leave reviews and ratings

## 🏗️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Paystack (withdrawals)
- **Deployment**: Vercel

## 📦 Database Schema

### 7 Main Entities

1. **agent_stores** - Store profiles and settings
2. **agent_products** - Product catalogs per agent
3. **agent_transactions** - Orders and sales
4. **agent_withdrawals** - Withdrawal requests
5. **agent_customers** - Customer management (CRM)
6. **store_reviews** - Reviews and ratings
7. **store_analytics** - Daily analytics and metrics

## 🗂️ Project Structure

```
datastore/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (admin)/
│   │   └── admin/
│   ├── (agent)/
│   │   └── agent/
│   ├── store/
│   │   └── [slug]/
│   └── api/
├── lib/
│   ├── supabase/
│   ├── database/
│   └── utils/
├── components/
│   ├── admin/
│   ├── agent/
│   └── public/
└── supabase/
    └── migrations/
```

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually run the SQL in `supabase/migrations/001_create_agent_store_tables.sql` in your Supabase SQL editor.

### 4. Set Up Paystack

```env
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

The system supports 3 user roles:

- **Admin**: System administrators
- **Agent**: Store owners/resellers
- **Customer**: End users

Role-based access control (RBAC) is handled via Supabase RLS policies and middleware.

## 📝 Key Features

### Agent Store Management
- Custom store profiles with logos, banners, descriptions
- Business hours configuration
- WhatsApp integration
- Commission settings (percentage, fixed, tiered)
- Withdrawal settings
- Marketing tools (referral codes, promotions, loyalty programs)

### Product Management
- Product catalogs per agent
- Custom pricing and margins
- Promotional pricing
- Inventory management
- Featured products
- Sales tracking

### Transaction Processing
- Real-time order tracking
- Multiple payment methods
- Automated commission calculation
- Processing status tracking
- Issue reporting

### Withdrawal System
- Multi-level approval workflow
- Paystack integration
- Status tracking
- Compliance checks
- Detailed audit trails

### Analytics & Reporting
- Real-time dashboards
- Sales metrics
- Customer insights
- Product performance
- Revenue tracking

## 🎯 Next Steps

1. ✅ Initialize Next.js + Supabase
2. ✅ Create database schemas
3. ⏳ Build authentication system
4. ⏳ Create Admin Dashboard
5. ⏳ Create Agent Dashboard
6. ⏳ Build public store pages
7. ⏳ Implement withdrawal processing
8. ⏳ Add analytics dashboard

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.
