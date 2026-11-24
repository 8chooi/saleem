import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🔭</div>
        <h1 className="text-6xl font-black text-primary mb-3">٤٠٤</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          الصفحة غير موجودة
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          يبدو أن هذه الصفحة ضاعت في الكون! دعنا نعود للبيت.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 font-bold text-base px-7 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark shadow-md transition-all"
        >
          🏠 العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
