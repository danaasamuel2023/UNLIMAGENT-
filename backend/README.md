# Backend - Agent Store Management System

Express.js backend server for managing agent stores and their operations.

## Features

- Store management (approve, suspend, close)
- Product pricing management
- Withdrawal processing
- Financial operations (wallet adjustments)
- Analytics and reporting
- Commission management
- Violation tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and other settings.

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

## API Endpoints

### Store Management
- `GET /api/admin/agent-store/stores` - Get all stores
- `GET /api/admin/agent-store/stores/:storeId` - Get store details
- `POST /api/admin/agent-store/stores/:storeId/approve` - Approve store
- `POST /api/admin/agent-store/stores/:storeId/suspend` - Suspend store
- `POST /api/admin/agent-store/stores/:storeId/close` - Close store permanently

### Product Management
- `POST /api/admin/agent-store/products/update-base-prices` - Update base prices globally
- `PUT /api/admin/agent-store/stores/:storeId/products/:productId/price` - Force update product price
- `POST /api/admin/agent-store/stores/:storeId/products/bulk-update` - Bulk update products
- `DELETE /api/admin/agent-store/products/remove-from-all-stores` - Remove product from all stores
- `POST /api/admin/agent-store/products/bulk-remove-from-all-stores` - Bulk remove products
- `GET /api/admin/agent-store/products/distribution` - Get product distribution

### Withdrawal Management
- `GET /api/admin/agent-store/withdrawals/pending` - Get pending withdrawals
- `POST /api/admin/agent-store/withdrawals/:withdrawalId/approve` - Approve withdrawal
- `POST /api/admin/agent-store/withdrawals/:withdrawalId/reject` - Reject withdrawal

### Financial Management
- `POST /api/admin/agent-store/stores/:storeId/wallet/adjust` - Adjust store wallet

### Analytics
- `GET /api/admin/agent-store/analytics/overview` - System-wide analytics
- `GET /api/admin/agent-store/analytics/top-stores` - Top performing stores

### Commission Management
- `PUT /api/admin/agent-store/stores/:storeId/commission` - Update commission settings

### Other
- `POST /api/admin/agent-store/stores/:storeId/violations` - Add violation
- `GET /api/admin/agent-store/transactions/search` - Search transactions
- `GET /health` - Health check

## TODO

1. Implement actual Mongoose schemas in:
   - `schema/schema.js`
   - `Agent_Store_Schema/page.js`

2. Implement authentication middleware in:
   - `middlewareUser/middleware.js`
   - `adminMiddleware/middleware.js`

3. Add request validation
4. Add comprehensive error handling
5. Add logging with Winston or similar
6. Add rate limiting
7. Add API documentation with Swagger

