interface PremiumBadgeProps {
  tier?: 'standard' | 'premium' | 'basic'
  benefits?: string[]
  priorityProcessing?: boolean
  enhancedReliability?: boolean
  fasterDelivery?: boolean
}

export default function PremiumBadge({
  tier = 'standard',
  benefits = [],
  priorityProcessing = false,
  enhancedReliability = false,
  fasterDelivery = false,
}: PremiumBadgeProps) {
  if (tier !== 'premium' && !priorityProcessing && !enhancedReliability && !fasterDelivery) {
    return null
  }

  const features: string[] = []
  if (priorityProcessing) features.push('⚡ Priority Processing')
  if (enhancedReliability) features.push('🛡️ Enhanced Reliability')
  if (fasterDelivery) features.push('🚀 Faster Delivery')
  if (benefits.length > 0) features.push(...benefits)

  return (
    <div className="relative">
      <div className="glass rounded-xl p-4 border border-purple-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
            <span className="text-lg">⭐</span>
          </div>
          <h4 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {tier === 'premium' ? 'Premium Bundle' : 'Enhanced Features'}
          </h4>
        </div>
        
        {features.length > 0 && (
          <ul className="space-y-2">
            {features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-gray-700 font-medium flex items-center gap-2">
                <svg className="h-4 w-4 text-purple-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

