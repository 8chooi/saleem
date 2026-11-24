export type AgeGroup = '3-5' | '6-8' | '9-12' | 'all'
export type LessonStatus = 'not_started' | 'in_progress' | 'completed'
export type Difficulty = 1 | 2 | 3

export interface Subject {
  id: string
  slug: string
  name_ar: string
  name_en: string
  description_ar: string | null
  emoji: string
  color: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Lesson {
  id: string
  subject_id: string
  slug: string
  title_ar: string
  title_en: string | null
  description_ar: string | null
  content_ar: string | null
  age_group: AgeGroup
  difficulty: Difficulty
  duration_min: number
  points: number
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface QuizQuestion {
  id: string
  lesson_id: string
  question_ar: string
  options: string[]
  correct_idx: number
  explanation_ar: string | null
  sort_order: number
}

export interface LearningProgress {
  id: string
  child_id: string
  lesson_id: string
  status: LessonStatus
  score: number
  attempts: number
  points_earned: number
  started_at: string | null
  completed_at: string | null
}

export interface ChildPoints {
  child_id: string
  total_points: number
  updated_at: string
}

export interface LessonWithProgress extends Lesson {
  progress?: LearningProgress
}

export interface SubjectWithLessons extends Subject {
  lessons: LessonWithProgress[]
  completed_count: number
  total_count: number
}
