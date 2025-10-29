# Data Mart Reseller API Integration

## Overview

This application integrates with the Data Mart Reseller API to process data bundle purchases. The API is documented at [https://reseller.datamartgh.shop/api-docs](https://reseller.datamartgh.shop/api-docs).

## API Endpoints

### Base URL
```
https://server-datamart-reseller.onrender.com/api
```

### Available Endpoints

1. **GET /v1/products** - Retrieve available data products
2. **GET /v1/capacities** - Get available capacities grouped by products
3. **GET /v1/account** - Get account information and wallet balance
4. **GET /v1/balance** - Get current balance
5. **POST /v1/purchase** - Purchase data bundle
6. **GET /v1/transactions** - Get transaction history
7. **POST /v1/bulk** - Bulk purchases
8. **GET /v1/statistics** - Get usage statistics

## Authentication

All API requests require authentication headers:

```typescript
{
  'X-API-Key': 'your_api_key_here',
  'X-API-Secret': 'your_api_secret_here',
  'Content-Type': 'application/json'
}
```

## Environment Variables

Add these to your `.env.local` file:

```bash
DATA_MART_API_URL=https://server-datamart-reseller.onrender.com/api
DATA_MART_API_KEY=your_api_key_here
DATA_MART_API_SECRET=your_api_secret_here
```

## Usage

### Purchase Data Bundle

```typescript
import { purchaseDataBundle } from '@/lib/services/dataMartApi'

const result = await purchaseDataBundle({
  capacity: '2GB',
  product_name: 'YELLOW',
  beneficiary_number: '0241234567',
  reference: 'REF123456'
})
```

### Check Balance

```typescript
import { getDataMartBalance } from '@/lib/services/dataMartApi'

const balance = await getDataMartBalance()
console.log('Current balance:', balance)
```

### Get Products

```typescript
import { getDataMartProducts } from '@/lib/services/dataMartApi'

const products = await getDataMartProducts()
```

## Purchase Flow

1. Customer places order on agent's store
2. Order is created in database with 'pending' status
3. Agent processes the order
4. System calls Data Mart API to purchase bundle
5. API returns transaction reference and status
6. Order is updated with API response
7. Customer receives data bundle

## Features

- ✅ Automatic balance checking
- ✅ Product synchronization
- ✅ Transaction tracking
- ✅ Error handling and retries
- ✅ Balance monitoring
- ✅ Webhook support

## Integration Points

- **Agent Orders**: Orders are processed through Data Mart API
- **Admin Dashboard**: Monitor Data Mart balance and transactions
- **Product Sync**: Automatically sync available products
- **Transaction History**: Track all API purchases

## Important Notes

- Orders are **manually processed** by the API provider
- Status will remain "pending" until manually processed
- Webhooks are sent when order is processed
- Always check balance before processing large orders
- API has rate limits - respect rate limiting

## Error Handling

The integration includes comprehensive error handling for:
- Network failures
- Authentication errors
- Balance insufficient errors
- Invalid data errors
- API rate limiting

