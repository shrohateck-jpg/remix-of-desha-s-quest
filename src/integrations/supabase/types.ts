export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      challenge_logs: {
        Row: {
          challenge_id: string
          created_at: string
          details: Json | null
          event: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          details?: Json | null
          event: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          details?: Json | null
          event?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_logs_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          description: string | null
          desha_comment: string | null
          duration_minutes: number
          ends_at: string
          id: string
          notes: string | null
          points_delta: number
          proof_image_hash: string | null
          proof_image_path: string | null
          started_at: string
          status: Database["public"]["Enums"]["challenge_status"]
          title: string
          updated_at: string
          user_id: string
          verification_decision:
            | Database["public"]["Enums"]["verification_decision"]
            | null
          verification_reason: string | null
          xp_reward: number
        }
        Insert: {
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          desha_comment?: string | null
          duration_minutes: number
          ends_at: string
          id?: string
          notes?: string | null
          points_delta?: number
          proof_image_hash?: string | null
          proof_image_path?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          title: string
          updated_at?: string
          user_id: string
          verification_decision?:
            | Database["public"]["Enums"]["verification_decision"]
            | null
          verification_reason?: string | null
          xp_reward?: number
        }
        Update: {
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          desha_comment?: string | null
          duration_minutes?: number
          ends_at?: string
          id?: string
          notes?: string | null
          points_delta?: number
          proof_image_hash?: string | null
          proof_image_path?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          title?: string
          updated_at?: string
          user_id?: string
          verification_decision?:
            | Database["public"]["Enums"]["verification_decision"]
            | null
          verification_reason?: string | null
          xp_reward?: number
        }
        Relationships: []
      }
      daily_rewards: {
        Row: {
          claimed_at: string
          id: string
          reward_points: number
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          reward_points?: number
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          reward_points?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_streak: number
          display_name: string
          last_daily_claim: string | null
          last_win_date: string | null
          level: number
          longest_streak: number
          points: number
          total_completed: number
          total_failed: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string
          last_daily_claim?: string | null
          last_win_date?: string | null
          level?: number
          longest_streak?: number
          points?: number
          total_completed?: number
          total_failed?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string
          last_daily_claim?: string | null
          last_win_date?: string | null
          level?: number
          longest_streak?: number
          points?: number
          total_completed?: number
          total_failed?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_verification: {
        Args: {
          _challenge_id: string
          _confidence: number
          _decision: Database["public"]["Enums"]["verification_decision"]
          _desha_comment: string
          _reason: string
        }
        Returns: {
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          description: string | null
          desha_comment: string | null
          duration_minutes: number
          ends_at: string
          id: string
          notes: string | null
          points_delta: number
          proof_image_hash: string | null
          proof_image_path: string | null
          started_at: string
          status: Database["public"]["Enums"]["challenge_status"]
          title: string
          updated_at: string
          user_id: string
          verification_decision:
            | Database["public"]["Enums"]["verification_decision"]
            | null
          verification_reason: string | null
          xp_reward: number
        }
        SetofOptions: {
          from: "*"
          to: "challenges"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_active_challenge: { Args: never; Returns: undefined }
      claim_daily_reward: { Args: never; Returns: Json }
      ensure_profile: {
        Args: never
        Returns: {
          avatar_url: string | null
          created_at: string
          current_streak: number
          display_name: string
          last_daily_claim: string | null
          last_win_date: string | null
          level: number
          longest_streak: number
          points: number
          total_completed: number
          total_failed: number
          updated_at: string
          user_id: string
          xp: number
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      level_for_xp: { Args: { _xp: number }; Returns: number }
      mark_verifying: {
        Args: {
          _challenge_id: string
          _proof_hash: string
          _proof_path: string
        }
        Returns: undefined
      }
      start_challenge: {
        Args: {
          _description: string
          _duration_minutes: number
          _notes: string
          _title: string
        }
        Returns: {
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          description: string | null
          desha_comment: string | null
          duration_minutes: number
          ends_at: string
          id: string
          notes: string | null
          points_delta: number
          proof_image_hash: string | null
          proof_image_path: string | null
          started_at: string
          status: Database["public"]["Enums"]["challenge_status"]
          title: string
          updated_at: string
          user_id: string
          verification_decision:
            | Database["public"]["Enums"]["verification_decision"]
            | null
          verification_reason: string | null
          xp_reward: number
        }
        SetofOptions: {
          from: "*"
          to: "challenges"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      challenge_status:
        | "running"
        | "waiting_proof"
        | "verifying"
        | "completed"
        | "failed"
        | "cancelled"
      verification_decision: "accepted" | "rejected" | "needs_more_evidence"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      challenge_status: [
        "running",
        "waiting_proof",
        "verifying",
        "completed",
        "failed",
        "cancelled",
      ],
      verification_decision: ["accepted", "rejected", "needs_more_evidence"],
    },
  },
} as const
