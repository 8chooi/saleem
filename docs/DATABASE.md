# DATABASE.md — تصميم قاعدة البيانات
## سَلِيم | SALEEM

> الإصدار: 1.0 | التاريخ: 2026-11-24
> قاعدة البيانات: PostgreSQL عبر Supabase Free

---

## مبدأ التدرج
لا تُنشأ جميع الجداول دفعة واحدة.
كل migration مرتبط بـ Phase محدد.

---

## Phase 2 — المصادقة والملفات الشخصية

```sql
-- users (يديره Supabase Auth)
-- id, email, role, created_at

-- parent_profiles
CREATE TABLE parent_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'EG',
  language TEXT DEFAULT 'ar',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- child_profiles
CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  birth_year INTEGER,
  age_group TEXT CHECK (age_group IN ('3-5', '6-8', '9-12')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- parent_child_links
CREATE TABLE parent_child_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);
```

---

## Phase 3 — محرك التعلم

```sql
-- subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- educational_stages
CREATE TABLE educational_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group TEXT NOT NULL CHECK (age_group IN ('3-5', '6-8', '9-12')),
  name_ar TEXT NOT NULL,
  name_en TEXT
);

-- learning_units
CREATE TABLE learning_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id),
  stage_id UUID REFERENCES educational_stages(id),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES learning_units(id),
  title_ar TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('video','text','interactive','game')),
  content_url TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- learning_progress
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  status TEXT CHECK (status IN ('not_started','in_progress','completed')),
  progress_percent INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, lesson_id)
);
```

---

## Phase 4 — القصص

```sql
-- stories
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  cover_image_url TEXT,
  age_group TEXT CHECK (age_group IN ('3-5', '6-8', '9-12')),
  subject_id UUID REFERENCES subjects(id),
  story_type TEXT CHECK (story_type IN ('illustrated','audio','interactive')),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- story_pages
CREATE TABLE story_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  text_ar TEXT,
  text_en TEXT,
  image_url TEXT,
  audio_url TEXT,
  UNIQUE(story_id, page_number)
);

-- reading_history
CREATE TABLE reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id),
  last_page INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(child_id, story_id)
);
```

---

## Phase 5 — الألعاب والاختبارات

```sql
-- games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  game_type TEXT NOT NULL,
  age_group TEXT CHECK (age_group IN ('3-5', '6-8', '9-12')),
  subject_id UUID REFERENCES subjects(id),
  config JSONB,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_ar TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('mcq','true_false','fill_blank','match')),
  options JSONB,
  correct_answer JSONB NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
  age_group TEXT CHECK (age_group IN ('3-5', '6-8', '9-12')),
  subject_id UUID REFERENCES subjects(id)
);

-- quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  lesson_id UUID REFERENCES lessons(id),
  age_group TEXT,
  time_limit_minutes INTEGER,
  pass_percent INTEGER DEFAULT 60,
  is_published BOOLEAN DEFAULT FALSE
);

-- quiz_attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  score INTEGER,
  max_score INTEGER,
  answers JSONB,
  passed BOOLEAN,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- points_transactions
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  description_ar TEXT,
  icon_url TEXT,
  condition_type TEXT NOT NULL,
  condition_value JSONB
);

-- child_badges
CREATE TABLE child_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, badge_id)
);
```

---

## Phase 7 — المدارس

```sql
-- schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT DEFAULT 'EG',
  city TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- teachers
CREATE TABLE teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  school_id UUID REFERENCES schools(id),
  display_name TEXT NOT NULL,
  subject_specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- classrooms
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  teacher_id UUID REFERENCES teachers(id),
  name TEXT NOT NULL,
  age_group TEXT,
  academic_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- classroom_students
CREATE TABLE classroom_students (
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(classroom_id, child_id)
);
```

---

## Indexes الأساسية

```sql
-- الأكثر استخداماً
CREATE INDEX idx_progress_child ON learning_progress(child_id);
CREATE INDEX idx_reading_child ON reading_history(child_id);
CREATE INDEX idx_quiz_attempts_child ON quiz_attempts(child_id);
CREATE INDEX idx_points_child ON points_transactions(child_id);
CREATE INDEX idx_lessons_unit ON lessons(unit_id);
CREATE INDEX idx_story_pages_story ON story_pages(story_id);
```

---

## RLS Policies (ملخص)
راجع `supabase/policies/` للـ SQL الكامل

- **child_profiles:** ولي الأمر يرى أطفاله فقط
- **learning_progress:** الطفل وولي أمره فقط
- **reading_history:** الطفل وولي أمره فقط
- **quiz_attempts:** الطفل وولي أمره والمعلم المرتبط فقط
- **schools/classrooms:** المعلم يرى مدرسته فقط
- **Admin:** SERVICE_ROLE للعمليات الإدارية فقط
