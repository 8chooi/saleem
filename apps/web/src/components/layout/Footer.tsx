import Link from 'next/link'

const footerLinks = {
  'المنصة': [
    { href: '/#worlds', label: 'عوالم سَلِيم' },
    { href: '/#features', label: 'المميزات' },
    { href: '/stories', label: 'القصص' },
    { href: '/games', label: 'الألعاب' },
  ],
  'المستخدمون': [
    { href: '/auth/register', label: 'تسجيل جديد' },
    { href: '/auth/login', label: 'تسجيل الدخول' },
    { href: '/parents', label: 'بوابة الآباء' },
    { href: '/teachers', label: 'بوابة المعلمين' },
  ],
  'عن المنصة': [
    { href: '/about', label: 'من نحن' },
    { href: '/privacy', label: 'سياسة الخصوصية' },
    { href: '/terms', label: 'شروط الاستخدام' },
    { href: '/contact', label: 'تواصل معنا' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌙</span>
              <span className="font-black text-xl text-white">سَلِيم</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              العقل السليم.. والفكر المتوازن
            </p>
            <p className="text-sm text-gray-500 mt-2">
              منصة تعليمية تفاعلية للأطفال
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold text-white mb-4 text-sm">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} سَلِيم | SALEEM — جميع الحقوق محفوظة</p>
          <p>
            بناء بـ ❤️ من{' '}
            <span className="text-gray-300 font-semibold">8CH – أتش</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
