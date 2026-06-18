/** Supabase generated-style types — keep in sync with supabase/migrations */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          updated_at?: string
        }
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          day_type: string
          total_minutes: number
          blocks: Json
          daily_log: Json | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          day_type: string
          total_minutes: number
          blocks?: Json
          daily_log?: Json | null
          completed?: boolean
        }
        Update: {
          day_type?: string
          total_minutes?: number
          blocks?: Json
          daily_log?: Json | null
          completed?: boolean
        }
      }
      active_concepts: {
        Row: {
          id: string
          user_id: string
          label: string
          description: string
          harmonic_context: string
          keys: string[]
          source_recordings: string[]
          key_focus_cluster: string[]
          dual_task_phase: number
          stage: string
          consecutive_pass_days: number
          ecosystem: string | null
          started_at: string
          retired_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          description: string
          harmonic_context: string
          keys?: string[]
          source_recordings?: string[]
          key_focus_cluster?: string[]
          dual_task_phase?: number
          stage?: string
          consecutive_pass_days?: number
          ecosystem?: string | null
          started_at?: string
        }
        Update: {
          label?: string
          stage?: string
          consecutive_pass_days?: number
          retired_at?: string | null
        }
      }
      device_backlog: {
        Row: {
          id: string
          user_id: string
          label: string
          description: string
          harmonic_context: string
          keys: string[]
          tier: string
          source_recording: string | null
          ecosystem: string | null
          notes: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          description: string
          harmonic_context: string
          keys?: string[]
          tier?: string
          source_recording?: string | null
          ecosystem?: string | null
          notes?: string | null
          sort_order?: number
        }
        Update: {
          tier?: string
          sort_order?: number
          notes?: string | null
        }
      }
      monthly_tunes: {
        Row: {
          id: string
          user_id: string
          title: string
          tune_type: string
          key: string
          deployment_points: Json
          month_year: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          tune_type: string
          key: string
          deployment_points?: Json
          month_year: string
        }
        Update: {
          title?: string
          deployment_points?: Json
        }
      }
      recordings: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          storage_path: string
          duration_seconds: number
          block_id: string | null
          notes: string | null
          ai_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          storage_path: string
          duration_seconds: number
          block_id?: string | null
          notes?: string | null
        }
        Update: {
          notes?: string | null
          ai_feedback?: string | null
        }
      }
      fluency_sessions: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          date: string
          bpm: number
          scores: Json
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          date: string
          bpm: number
          scores?: Json
          notes?: string | null
        }
        Update: {
          bpm?: number
          scores?: Json
          notes?: string | null
        }
      }
      posture_snapshots: {
        Row: {
          id: string
          user_id: string
          score: number
          metrics: Json
          snapshot_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          metrics?: Json
          snapshot_path?: string | null
        }
        Update: {
          score?: number
          metrics?: Json
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_date: string | null
          category: string
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_date?: string | null
          category: string
          completed?: boolean
        }
        Update: {
          title?: string
          completed?: boolean
        }
      }
      user_app_snapshots: {
        Row: {
          user_id: string
          snapshot: Json
          updated_at: string
        }
        Insert: {
          user_id: string
          snapshot?: Json
          updated_at?: string
        }
        Update: {
          snapshot?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
