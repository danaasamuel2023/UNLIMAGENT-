// Data Mart Reseller API Service
// Based on: https://reseller.datamartgh.shop/api-docs
const API_BASE_URL = process.env.DATA_MART_API_URL || 'https://server-datamart-reseller.onrender.com/api'
const API_KEY = process.env.DATA_MART_API_KEY
const API_SECRET = process.env.DATA_MART_API_SECRET

export interface DataMartProduct {
  product_code: string
  name: string
  capacity: string
  validity: string
  price: number
  currency: string
  status: string
}

export interface DataMartPurchaseResponse {
  success: boolean
  message: string
  data: {
    reference: string
    transaction_id: string
    product: {
      name: string
      capacity: string
      validity: string
    }
    beneficiary: string
    amount: number
    currency: string
    status: string
    balance_after: number
    webhook_sent: boolean
  }
}

export interface DataMartBalanceResponse {
  success: boolean
  message: string
  data: {
    balance: number
    currency: string
    formatted: string
  }
}

export interface DataMartAccountResponse {
  success: boolean
  message: string
  data: {
    account: {
      name: string
      email: string
      phone: string
      role: string
      status: string
    }
    wallet: {
      balance: number
      currency: string
    }
    api: {
      requestCount: number
      rateLimit: number
      webhookUrl: string
    }
  }
}

/**
 * Fetch headers for API requests
 */
function getHeaders() {
  return {
    'X-API-Key': API_KEY || '',
    'X-API-Secret': API_SECRET || '',
    'Content-Type': 'application/json',
  }
}

/**
 * Get all products from Data Mart
 */
export async function getDataMartProducts(): Promise<DataMartProduct[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/products`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      console.error('Data Mart API error:', result.message)
      return []
    }

    return result.data?.products || []
  } catch (error) {
    console.error('Error fetching products from Data Mart:', error)
    return []
  }
}

/**
 * Get available capacities
 */
export async function getDataMartCapacities(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/capacities`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch capacities: ${response.statusText}`)
    }

    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error('Error fetching capacities from Data Mart:', error)
    return null
  }
}

/**
 * Purchase data bundle from Data Mart
 */
export async function purchaseDataBundle(params: {
  capacity: string
  product_name: string
  beneficiary_number: string
  reference: string
}): Promise<DataMartPurchaseResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/purchase`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Purchase failed:', errorText)
      return null
    }

    const result = await response.json()
    return result.success ? result : null
  } catch (error) {
    console.error('Error purchasing bundle from Data Mart:', error)
    return null
  }
}

/**
 * Get account balance from Data Mart
 */
export async function getDataMartBalance(): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/balance`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.statusText}`)
    }

    const result: DataMartBalanceResponse = await response.json()

    if (!result.success) {
      console.error('Data Mart API error:', result.message)
      return 0
    }

    return result.data.balance
  } catch (error) {
    console.error('Error fetching balance from Data Mart:', error)
    return 0
  }
}

/**
 * Get account information
 */
export async function getDataMartAccount(): Promise<DataMartAccountResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/account`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch account: ${response.statusText}`)
    }

    const result = await response.json()
    return result.success ? result : null
  } catch (error) {
    console.error('Error fetching account from Data Mart:', error)
    return null
  }
}

/**
 * Check if API credentials are configured
 */
export function isDataMartConfigured(): boolean {
  return !!(API_KEY && API_SECRET)
}

