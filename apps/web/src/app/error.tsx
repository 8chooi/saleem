'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">حدث خطأ ما</h2>
        <p className="text-gray-500 mb-8">
          نأسف على هذا الخطأ. يمكنك المحاولة مجدداً أو العودة للرئيسية.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center font-bold px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all"
          >
            حاول مجدداً
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center font-bold px-6 py-3 rounded-xl border-2 border-primary text-primary hover:bg-primary-light transition-all"
          >
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  )
}
