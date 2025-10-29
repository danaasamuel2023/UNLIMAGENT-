export default function ProductSkeleton() {
  return (
    <div className="group glass rounded-2xl p-6 card-hover border border-white/20 animate-pulse">
      {/* Network Logo Skeleton */}
      <div className="mb-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gray-300"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded-lg mb-2"></div>
          <div className="h-4 bg-gray-300 rounded-lg w-2/3"></div>
        </div>
      </div>

      {/* Price Skeleton */}
      <div className="mb-6 flex items-baseline justify-between">
        <div className="h-10 bg-gray-300 rounded-lg w-24"></div>
        <div className="h-6 bg-gray-300 rounded-full w-20"></div>
      </div>

      {/* Button Skeleton */}
      <div className="h-12 bg-gray-300 rounded-xl"></div>
    </div>
  )
}

