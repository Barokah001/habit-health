import { LucideIcon } from 'lucide-react'

export interface Habit {
  key: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  trackingType: 'boolean' | 'scale'
  scaleLabels?: string[]
}

export interface UserHabit {
  id: string
  user_id: string
  habit_key: string
  habit_name: string
  is_active: boolean
  created_at: string
}

export interface EnrichedUserHabit extends UserHabit {
  icon: LucideIcon
  color: string
  description: string
  trackingType: 'boolean' | 'scale'
  scaleLabels?: string[]
}

export interface DailyCheckin {
  id: string
  user_id: string
  date: string
  habit_key: string
  completed: boolean
  value: number | null
  notes: string | null
  created_at: string
}

export interface CheckinStatus {
  completed: boolean
  value: number | null
}

export interface WeekData {
  dates: string[]
  data: Record<string, Record<string, DailyCheckin>>
}

export interface HabitStat {
  habit: EnrichedUserHabit
  completedCount: number
  consistency: number
  checkins: DailyCheckin[]
}

export interface InsightsData {
  habitStats: Record<string, HabitStat>
  overallConsistency: number
  mainMessage: string
  strongestHabit: HabitStat | null
  totalCompleted: number
  totalPossible: number
}

export interface EncouragementMessages {
  high_consistency: string[]
  medium_consistency: string[]
  low_consistency: string[]
  missed_day: string[]
}

export type EncouragementLevel = 
  | 'high_consistency' 
  | 'medium_consistency' 
  | 'low_consistency'