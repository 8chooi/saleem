export default function StoryLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-16 h-6 rounded-lg bg-amber-100 animate-pulse" />
          <div className="w-16 h-6 rounded-lg bg-gray-100 animate-pulse" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Title skeleton */}
        <div className="text-center mb-5 space-y-3">
          <div className="h-10 w-64 mx-auto rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-7 w-32 mx-auto rounded-full bg-amber-100 animate-pulse" />
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-1 mb-4 bg-amber-50 rounded-2xl p-1 border border-amber-100">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-10 rounded-xl bg-white animate-pulse" />
          ))}
        </div>

        {/* Progress skeleton */}
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-10 rounded bg-amber-100 animate-pulse" />
          </div>
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <div className="h-full w-1/8 bg-amber-200 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Scene + text skeleton */}
        <div className="bg-white rounded-3xl shadow-sm border border-amber-100 overflow-hidden mb-4">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/2 p-3 sm:p-4">
              <div className="w-full aspect-[16/10] rounded-2xl bg-gradient-to-br from-blue-100 to-green-100 animate-pulse" />
            </div>
            <div className="sm:w-1/2 flex items-center p-4 sm:p-6">
              <div className="space-y-3 w-full">
                <div className="h-6 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-6 bg-gray-100 rounded-lg w-5/6 animate-pulse" />
                <div className="h-6 bg-gray-100 rounded-lg w-4/5 animate-pulse" />
                <div className="h-6 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls skeleton */}
        <div className="flex items-center justify-between gap-3">
          <div className="h-12 w-24 rounded-2xl bg-amber-100 animate-pulse" />
          <div className="h-12 flex-1 rounded-2xl bg-purple-100 animate-pulse" />
          <div className="h-12 w-24 rounded-2xl bg-green-100 animate-pulse" />
          <div className="h-12 w-24 rounded-2xl bg-amber-100 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
