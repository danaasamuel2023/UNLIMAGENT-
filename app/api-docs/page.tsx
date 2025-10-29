import Link from 'next/link'

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Data Mart Reseller API</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Programmatically purchase mobile data bundles and integrate with your applications
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 glass rounded-2xl p-6 border border-white/20">
              <nav className="space-y-2">
                <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                <a href="#overview" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Overview
                </a>
                <a href="#authentication" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Authentication
                </a>
                <a href="#endpoints" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Endpoints
                </a>
                <a href="#examples" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Examples
                </a>
                <a href="#support" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Support
                </a>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview */}
            <section id="overview" className="glass rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 mb-4">
                The Data Mart Reseller API allows you to programmatically purchase mobile data bundles for MTN, AirtelTigo, and Vodafone networks.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <strong>Base URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{process.env.DATA_MART_API_URL || 'https://server-datamart-reseller.onrender.com/api'}</code>
                </p>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="glass rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication</h2>
              <p className="text-gray-700 mb-4">
                All API requests require authentication using API key and secret:
              </p>
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`{
  "X-API-Key": "your_api_key_here",
  "X-API-Secret": "your_api_secret_here",
  "Content-Type": "application/json"
}`}
                </pre>
              </div>
            </section>

            {/* Endpoints */}
            <section id="endpoints" className="glass rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Endpoints</h2>
              
              <div className="space-y-6">
                {/* Products */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">GET</span>
                    <code className="text-lg font-mono text-gray-900">/v1/products</code>
                  </div>
                  <p className="text-gray-700 text-sm">Retrieve all available data products</p>
                </div>

                {/* Capacities */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">GET</span>
                    <code className="text-lg font-mono text-gray-900">/v1/capacities</code>
                  </div>
                  <p className="text-gray-700 text-sm">Get available capacities grouped by network</p>
                </div>

                {/* Account */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">GET</span>
                    <code className="text-lg font-mono text-gray-900">/v1/account</code>
                  </div>
                  <p className="text-gray-700 text-sm">Get account information and wallet balance</p>
                </div>

                {/* Balance */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">GET</span>
                    <code className="text-lg font-mono text-gray-900">/v1/balance</code>
                  </div>
                  <p className="text-gray-700 text-sm">Check current account balance</p>
                </div>

                {/* Purchase */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">POST</span>
                    <code className="text-lg font-mono text-gray-900">/v1/purchase</code>
                  </div>
                  <p className="text-gray-700 text-sm">Purchase a data bundle</p>
                  <div className="bg-gray-900 rounded-xl p-4 mt-3 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
{`{
  "capacity": "2GB",
  "product_name": "YELLO",
  "beneficiary_number": "0241234567",
  "reference": "REF123456"
}`}
                    </pre>
                  </div>
                </div>

                {/* Transactions */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">GET</span>
                    <code className="text-lg font-mono text-gray-900">/v1/transactions</code>
                  </div>
                  <p className="text-gray-700 text-sm">Get transaction history</p>
                </div>
              </div>
            </section>

            {/* Examples */}
            <section id="examples" className="glass rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Code Examples</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">JavaScript/TypeScript</h3>
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
{`const response = await fetch('${process.env.DATA_MART_API_URL}/v1/purchase', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_key',
    'X-API-Secret': 'your_secret',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    capacity: '2GB',
    product_name: 'YELLO',
    beneficiary_number: '0241234567',
    reference: 'REF123456'
  })
})

const result = await response.json()`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Python</h3>
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
{`import requests

response = requests.post(
    '${process.env.DATA_MART_API_URL}/v1/purchase',
    headers={
        'X-API-Key': 'your_key',
        'X-API-Secret': 'your_secret',
        'Content-Type': 'application/json'
    },
    json={
        'capacity': '2GB',
        'product_name': 'YELLO',
        'beneficiary_number': '0241234567',
        'reference': 'REF123456'
    }
)

result = response.json()`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Support */}
            <section id="support" className="glass rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-gray-700 mb-4">
                For API access, integration support, or questions, please contact us:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📧</span>
                  <a href="mailto:support@datamartgh.shop" className="text-blue-600 hover:text-blue-700 font-medium">
                    support@datamartgh.shop
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📘</span>
                  <a href="https://docs.datamartgh.shop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                    Full API Documentation
                  </a>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="mb-6">Get your API credentials and start integrating today</p>
              <Link href="/signup" className="inline-flex items-center btn-primary bg-white text-gray-900 hover:bg-gray-100">
                Sign Up for API Access
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

