import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">A</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Agent Store
              </h3>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Your one-stop shop for affordable data bundles. Connect with trusted agents and get the best deals on mobile data.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@agentstore.com" className="hover:text-blue-600">
                  support@agentstore.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Mon-Sun: 8AM - 9PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Browse Stores
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-gray-600 hover:text-blue-600 transition-colors">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Agent Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Become an Agent
                </Link>
              </li>
              <li>
                <a href="mailto:support@agentstore.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <Link href="/api-docs" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Developer API
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {currentYear} Agent Store. All rights reserved. Powered by Data Mart API.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

