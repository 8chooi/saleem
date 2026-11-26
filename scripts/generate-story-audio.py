"""
سكريبت توليد صوت القصص باستخدام edge-tts (ar-EG-SalmaNeural)
=====================================================
التثبيت أولاً في terminal:
    pip install edge-tts supabase

ثم احصل على Service Role Key من:
    Supabase Dashboard → Project Settings → API → service_role key

ثم شغّل:
    python scripts/generate-story-audio.py
"""

import asyncio
import os
import tempfile
import json
import sys

try:
    import edge_tts
    from supabase import create_client, Client
except ImportError:
    print("❌ محتاج تثبت المكتبات أول:")
    print("   pip install edge-tts supabase")
    sys.exit(1)

# ─── إعدادات ───────────────────────────────────────────────
SUPABASE_URL = "https://senfxgkxvizrbarmrlzh.supabase.co"
SUPABASE_SERVICE_KEY = ""   # ← الصق هنا service_role key من Supabase Dashboard

VOICE        = "ar-EG-SalmaNeural"
RATE         = "-5%"          # سرعة القراءة (سالب = أبطأ)
BUCKET       = "story-audio"  # اسم الـ bucket في Supabase Storage
# ────────────────────────────────────────────────────────────


async def tts_to_file(text: str, path: str):
    """يولد ملف MP3 من نص باستخدام edge-tts"""
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(path)


async def process_story(supabase: "Client", story: dict):
    slug  = story["slug"]
    pages = story.get("pages") or []

    if not pages:
        print(f"  ⚠️  {slug}: لا توجد صفحات")
        return

    updated = False
    new_pages = []

    for i, page in enumerate(pages):
        text = (page.get("text") or "").strip()
        if not text:
            new_pages.append(page)
            continue

        # لو الصفحة عندها صوت بالفعل، تخطّى
        if page.get("audio"):
            print(f"  ✓ {slug} صفحة {i+1}: موجود مسبقاً")
            new_pages.append(page)
            continue

        storage_path = f"{slug}/page-{i+1}.mp3"
        print(f"  🎙 {slug} صفحة {i+1}: {text[:40]}...")

        # توليد MP3
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            tmp = f.name
        try:
            await tts_to_file(text, tmp)

            # رفع على Supabase Storage
            with open(tmp, "rb") as f:
                data = f.read()
            supabase.storage.from_(BUCKET).upload(
                storage_path,
                data,
                {"content-type": "audio/mpeg", "upsert": "true"},
            )

            # URL العام
            url = supabase.storage.from_(BUCKET).get_public_url(storage_path)
            page = dict(page)
            page["audio"] = url
            updated = True
            print(f"    ✅ رُفع → {url[:60]}...")
        except Exception as e:
            print(f"    ❌ خطأ: {e}")
        finally:
            os.unlink(tmp)

        new_pages.append(page)

    if updated:
        supabase.from_("stories").update({"pages": new_pages}).eq("id", story["id"]).execute()
        print(f"  💾 {slug}: تم حفظ URLs في قاعدة البيانات")


async def main():
    if not SUPABASE_SERVICE_KEY:
        print("❌ ضع service_role key في المتغير SUPABASE_SERVICE_KEY في أول السكريبت")
        sys.exit(1)

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # تأكد إن الـ bucket موجود
    try:
        supabase.storage.create_bucket(BUCKET, {"public": True})
        print(f"✅ Bucket '{BUCKET}' اتعمل")
    except Exception:
        print(f"ℹ️  Bucket '{BUCKET}' موجود بالفعل")

    # اجلب كل القصص
    result = supabase.from_("stories").select("id, slug, pages").eq("is_active", True).execute()
    stories = result.data or []
    print(f"\n📚 عدد القصص: {len(stories)}\n")

    for story in stories:
        print(f"📖 {story['slug']}")
        await process_story(supabase, story)
        print()

    print("🎉 انتهى! كل القصص لديها صوت الآن.")


if __name__ == "__main__":
    asyncio.run(main())
