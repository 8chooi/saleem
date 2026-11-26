/**
 * import-sw-pages.js
 * يرفع بيانات صفحات القصص من StoryWeaver إلى Supabase
 *
 * الاستخدام:
 *   node scripts/import-sw-pages.js
 *
 * المتطلبات:
 *   - تشغيل migration 020 في Supabase SQL Editor أولاً
 *   - ملف sw_pages_data.json موجود في نفس المجلد أو في Downloads
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://senfxgkxvizrbarmrlzh.supabase.co'
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  require('../apps/web/.env.local').match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim() ||
  'sb_publishable_VZ-UNKUDMt2gTX1L6FpC6A_b1SyQwW2'

// ابحث عن ملف الـ data
const candidates = [
  path.join(__dirname, 'sw_pages_data.json'),
  path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'sw_pages_data.json'),
]
let dataFile = candidates.find(f => fs.existsSync(f))
if (!dataFile) {
  console.error('❌ لم يتم إيجاد sw_pages_data.json\nضع الملف في:', candidates[0])
  process.exit(1)
}

const stories = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
console.log(`✅ تم تحميل ${stories.length} قصة`)

function supabaseRpc(fnName, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body)
    const url = new URL(`/rest/v1/rpc/${fnName}`, SUPABASE_URL)
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      }
    }, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

async function main() {
  const BATCH = 50
  let totalUpdated = 0
  let errors = 0

  for (let i = 0; i < stories.length; i += BATCH) {
    const batch = stories.slice(i, i + BATCH)
    const pct = Math.round((i / stories.length) * 100)
    process.stdout.write(`\r[${pct}%] uploading ${i + 1}–${Math.min(i + BATCH, stories.length)}/${stories.length}...`)

    const res = await supabaseRpc('import_sw_pages', { data: batch })
    if (res.status === 200 && typeof res.body === 'number') {
      totalUpdated += res.body
    } else {
      console.log(`\n⚠️  batch ${i}: status=${res.status}`, JSON.stringify(res.body).slice(0, 200))
      errors++
    }
  }

  console.log(`\n✅ تم: ${totalUpdated} قصة محدّثة، ${errors} أخطاء`)
}

main().catch(console.error)
