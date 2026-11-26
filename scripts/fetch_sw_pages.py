"""
سكريبت جلب بيانات صفحات القصص من StoryWeaver
الاستخدام:
  1. افتح storyweaver.org.in في المتصفح وسجّل الدخول
  2. اضغط F12 → Network → افتح أي قصة → في أول طلب لـ storyweaver.org.in
     انسخ قيمة header الـ Cookie
  3. شغّل السكريبت:
       python scripts/fetch_sw_pages.py "COOKIE_VALUE_HERE"
"""
import sys, json, time, re, urllib.request, html as htmllib
from pathlib import Path

COOKIE = sys.argv[1] if len(sys.argv) > 1 else input("الصق قيمة الـ Cookie: ").strip()
SEED   = Path(__file__).parent.parent / "supabase/seed/010_open_library.sql"
OUT    = Path(__file__).parent.parent / "supabase/seed/sw_pages.json"

# جلب قائمة الـ IDs من ملف الـ seed
ids = [int(m) for m in re.findall(r'^\((\d+),', SEED.read_text(encoding='utf-8'), re.M)]
print(f"إجمالي القصص: {len(ids)}", flush=True)

results, errors = [], []

def get_text(node):
    """استخرج النص من HTML بشكل بسيط"""
    t = re.sub(r'<[^>]+>', ' ', node)
    t = htmllib.unescape(t)
    return re.sub(r'\s+', ' ', t).strip()

def fetch(story_id):
    url = f"https://storyweaver.org.in/api/v1/stories/{story_id}/read"
    req = urllib.request.Request(url, headers={
        'Cookie': COOKIE,
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.loads(r.read().decode('utf-8'))
    if not data.get('ok'):
        raise ValueError(data.get('data', {}).get('errorMessage', 'error'))
    d = data['data']

    pages = []
    for p in d.get('pages', []):
        if p.get('pageType') == 'BackCoverPage':
            continue
        sizes = p.get('coverImage', {}).get('sizes', [])
        # أكبر صورة أقل من 800px عرض
        img = None
        for s in sizes:
            if s['width'] <= 800:
                img = s['url']
        if not img and sizes:
            img = sizes[-1]['url']
        text = get_text(p.get('html', ''))
        # حذف نص صفحة الغلاف (الأسماء)
        if p.get('pageType') == 'FrontCoverPage':
            text = ''
        pages.append({'img': img, 'text': text, 'type': p['pageType']})

    return {
        'id': story_id,
        'slug': d.get('slug'),
        'orientation': d.get('orientation', 'landscape'),
        'audio': d.get('audioPath') if d.get('audioStatus') == 'audio_published' else None,
        'vtt':   d.get('vttFilePath') if d.get('audioStatus') == 'audio_published' else None,
        'pages': pages,
    }

for i, sid in enumerate(ids):
    try:
        s = fetch(sid)
        results.append(s)
        if (i + 1) % 20 == 0 or i == 0:
            print(f"  {i+1}/{len(ids)} — نجح: {len(results)} — فشل: {len(errors)}", flush=True)
    except Exception as e:
        errors.append({'id': sid, 'err': str(e)})
        print(f"  ✗ {sid}: {e}", flush=True)
    time.sleep(0.5)  # 0.5 ثانية بين كل طلب

OUT.write_text(json.dumps({'results': results, 'errors': errors}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"\nتم! نجح {len(results)}، فشل {len(errors)}")
print(f"النتيجة في: {OUT}")
