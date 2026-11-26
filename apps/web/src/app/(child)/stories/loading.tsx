export default function StoriesLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#f5f0ff 0%,#fdf4ff 40%,#f0f9ff 100%)' }} dir="rtl">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between gap-3"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 2px 20px rgba(124,58,237,0.1)' }}>
        <div className="w-16 h-9 rounded-xl bg-purple-100 animate-pulse" />
        <div className="w-32 h-6 rounded-xl bg-purple-100 animate-pulse" />
        <div className="w-16 h-9 rounded-xl bg-gray-100 animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Level filter skeleton */}
        <div className="mb-5 flex gap-2">
          {[80, 100, 100, 100, 100].map((w, i) => (
            <div key={i} className="h-10 rounded-2xl bg-white animate-pulse" style={{ width: w }} />
          ))}
        </div>

        {/* Section header skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-purple-100" />
          <div className="w-40 h-9 rounded-2xl bg-purple-100 animate-pulse" />
          <div className="flex-1 h-px bg-purple-100" />
        </div>

        {/* Story cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-purple-100 p-5 animate-pulse"
              style={{ boxShadow: '0 3px 0 #ede9fe' }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-lg w-full" />
                  <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
                  <div className="flex gap-2 mt-1">
                    <div className="h-5 w-20 bg-purple-50 rounded-full" />
                    <div className="h-5 w-12 bg-gray-50 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
