import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="py-5 px-4">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-xl text-primary">
          <span className="text-2xl">🌙</span>
          <span>سَلِيم</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} سَلِيم | SALEEM
      </footer>
    </div>
  )
}
