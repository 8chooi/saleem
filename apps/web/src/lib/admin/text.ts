const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// المحتوى يُحرَّر نصًا عاديًا ويُخزَّن HTML آمنًا: السطر الأول عنوان، والباقي فقرات
export function plainToHtml(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return ''
  const [title, ...rest] = lines
  return `<h2>${escape(title)}</h2>` + rest.map((l) => `<p>${escape(l)}</p>`).join('')
}

export function htmlToPlain(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<\/(h[1-6]|p)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
