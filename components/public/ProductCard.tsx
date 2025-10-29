import { formatCurrency } from '@/lib/utils/format'
import PurchaseButton from './PurchaseButton'
import NetworkLogo from './NetworkLogo'

interface Product {
  id: string
  network: string
  capacity: number
  mb: number
  selling_price: number
  profit: number
  display_name?: string
  description?: string
  in_stock: boolean
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const networkLabel = {
    'YELLO': 'MTN',
    'TELECEL': 'Vodafone',
    'AT_PREMIUM': 'AirtelTigo Premium',
    'airteltigo': 'AirtelTigo',
    'at': 'AT',
  }[product.network] || product.network

  return (
    <div className="group">
      <div className="flex items-start gap-4 mb-5">
        <NetworkLogo network={product.network} className="h-16 w-16 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {product.display_name || `${networkLabel} ${product.capacity}GB`}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between mb-5 pb-5 border-b border-gray-100">
        <div>
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {formatCurrency(product.selling_price)}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          product.in_stock 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      <div className="mt-auto">
        <PurchaseButton product={product} />
      </div>
    </div>
  )
}
