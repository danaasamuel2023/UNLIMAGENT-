interface NetworkLogoProps {
  network: string
  bundleType?: string
  className?: string
  showBadge?: boolean
}

export default function NetworkLogo({ 
  network, 
  bundleType, 
  className = "h-12 w-12",
  showBadge = true 
}: NetworkLogoProps) {
  const networkConfig = {
    'YELLO': {
      name: 'MTN',
      bgGradient: 'from-yellow-400 to-yellow-500',
      textColor: 'text-yellow-50',
    },
    'TELECEL': {
      name: 'Vodafone',
      bgGradient: 'from-red-500 to-red-600',
      textColor: 'text-white',
    },
    'AT': {
      name: 'AirtelTigo',
      bgGradient: 'from-red-600 to-red-700',
      textColor: 'text-white',
    },
    'AT_PREMIUM': {
      name: 'AirtelTigo Premium',
      bgGradient: 'from-red-700 to-red-800',
      textColor: 'text-white',
    },
    'airteltigo': {
      name: 'AirtelTigo',
      bgGradient: 'from-red-600 to-red-700',
      textColor: 'text-white',
    },
  }

  const bundleTypeConfig = {
    'UP2U': {
      name: 'UP2U',
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
    },
    'iShare': {
      name: 'iShare',
      bgColor: 'bg-purple-600',
      textColor: 'text-white',
    },
    'Premium': {
      name: 'Premium',
      bgColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
      textColor: 'text-white',
    },
  }

  const config = networkConfig[network as keyof typeof networkConfig] || {
    name: network,
    bgGradient: 'from-gray-500 to-gray-600',
    textColor: 'text-white',
  }

  const bundleConfig = bundleType ? bundleTypeConfig[bundleType as keyof typeof bundleTypeConfig] : null

  return (
    <div className="relative">
      <div className={`rounded-2xl bg-gradient-to-br ${config.bgGradient} ${className} flex items-center justify-center shadow-lg ring-2 ring-white/20`}>
        <span className={`font-bold text-[10px] ${config.textColor} px-2 text-center leading-tight`}>
          {config.name}
        </span>
      </div>
      
      {showBadge && bundleConfig && (
        <div className={`absolute -top-2 -right-2 ${bundleConfig.bgColor} ${bundleConfig.textColor} text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg`}>
          {bundleConfig.name}
        </div>
      )}
    </div>
  )
}
