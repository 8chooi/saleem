// Core types for SALEEM platform

export type AgeGroup = '3-5' | '6-8' | '9-12'

export type UserRole = 'super_admin' | 'admin' | 'content_author' | 'content_reviewer' | 'teacher' | 'parent'

export type WorldSlug =
  | 'letters'
  | 'numbers'
  | 'science'
  | 'languages'
  | 'thinking'
  | 'creativity'
  | 'knowledge'

export type ContentType = 'story' | 'lesson' | 'game' | 'quiz' | 'activity'

export type StoryType = 'illustrated' | 'audio' | 'interactive'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export type Language = 'ar' | 'en'

// User & Auth
export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface ParentProfile {
  id: string
  display_name: string
  phone?: string
  country: string
  language: Language
  created_at: string
  updated_at: string
}

export interface ChildProfile {
  id: string
  display_name: string
  birth_year?: number
  age_group?: AgeGroup
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Content
export interface World {
  id: string
  slug: WorldSlug
  name_ar: string
  name_en: string
  description_ar?: string
  icon: string
  color: string
  sort_order: number
  is_active: boolean
}

export interface Subject {
  id: string
  name_ar: string
  name_en?: string
  slug: string
  icon?: string
  color?: string
  sort_order: number
  is_active: boolean
}

export interface Story {
  id: string
  title_ar: string
  title_en?: string
  description_ar?: string
  cover_image_url?: string
  age_group: AgeGroup
  story_type: StoryType
  difficulty: Difficulty
  duration_minutes?: number
  is_published: boolean
  created_at: string
}

export interface StoryPage {
  id: string
  story_id: string
  page_number: number
  text_ar?: string
  text_en?: string
  image_url?: string
  audio_url?: string
}

export interface LearningProgress {
  id: string
  child_id: string
  lesson_id: string
  status: ProgressStatus
  progress_percent: number
  completed_at?: string
  updated_at: string
}

export interface Badge {
  id: string
  name_ar: string
  description_ar?: string
  icon_url?: string
  condition_type: string
  condition_value: Record<string, unknown>
}

// API Response
export interface ApiResponse<T> {
  data: T | null
  error: { code: string; message: string } | null
}
