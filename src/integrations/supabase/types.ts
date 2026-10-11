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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      coaches: {
        Row: {
          email: string
          experience_years: number
          full_name: string
          id: number
          phone: string | null
          sport_id: number
        }
        Insert: {
          email: string
          experience_years?: number
          full_name: string
          id?: number
          phone?: string | null
          sport_id: number
        }
        Update: {
          email?: string
          experience_years?: number
          full_name?: string
          id?: number
          phone?: string | null
          sport_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "coaches_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          available_qty: number
          category: string
          id: number
          name: string
          total_qty: number
        }
        Insert: {
          available_qty: number
          category: string
          id?: number
          name: string
          total_qty: number
        }
        Update: {
          available_qty?: number
          category?: string
          id?: number
          name?: string
          total_qty?: number
        }
        Relationships: []
      }
      equipment_issues: {
        Row: {
          due_on: string
          equipment_id: number
          id: number
          issued_on: string
          member_id: number
          qty: number
          returned_on: string | null
        }
        Insert: {
          due_on: string
          equipment_id: number
          id?: number
          issued_on?: string
          member_id: number
          qty?: number
          returned_on?: string | null
        }
        Update: {
          due_on?: string
          equipment_id?: number
          id?: number
          issued_on?: string
          member_id?: number
          qty?: number
          returned_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_issues_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_issues_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_status"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "equipment_issues_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_issues_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_fee_dues"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "equipment_issues_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_membership_status"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "equipment_issues_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_player_performance"
            referencedColumns: ["member_id"]
          },
        ]
      }
      facilities: {
        Row: {
          capacity: number
          facility_type: string
          hourly_rate: number
          id: number
          name: string
        }
        Insert: {
          capacity: number
          facility_type: string
          hourly_rate?: number
          id?: number
          name: string
        }
        Update: {
          capacity?: number
          facility_type?: string
          hourly_rate?: number
          id?: number
          name?: string
        }
        Relationships: []
      }
      facility_bookings: {
        Row: {
          attendees: number
          ends_at: string
          facility_id: number
          id: number
          member_id: number
          purpose: string | null
          starts_at: string
        }
        Insert: {
          attendees?: number
          ends_at: string
          facility_id: number
          id?: number
          member_id: number
          purpose?: string | null
          starts_at: string
        }
        Update: {
          attendees?: number
          ends_at?: string
          facility_id?: number
          id?: number
          member_id?: number
          purpose?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "v_facility_usage"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "facility_bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_fee_dues"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "facility_bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_membership_status"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "facility_bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_player_performance"
            referencedColumns: ["member_id"]
          },
        ]
      }
      fixtures: {
        Row: {
          away_team_id: number
          ends_at: string
          facility_id: number
          home_team_id: number
          id: number
          starts_at: string
          status: string
          tournament_id: number
        }
        Insert: {
          away_team_id: number
          ends_at: string
          facility_id: number
          home_team_id: number
          id?: number
          starts_at: string
          status?: string
          tournament_id: number
        }
        Update: {
          away_team_id?: number
          ends_at?: string
          facility_id?: number
          home_team_id?: number
          id?: number
          starts_at?: string
          status?: string
          tournament_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "v_facility_usage"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          gender: string | null
          id: number
          join_date: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name: string
          gender?: string | null
          id?: number
          join_date?: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          id?: number
          join_date?: string
          phone?: string | null
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          created_at: string
          duration_months: number
          fee: number
          id: number
          max_equipment: number
          name: string
        }
        Insert: {
          created_at?: string
          duration_months: number
          fee: number
          id?: number
          max_equipment?: number
          name: string
        }
        Update: {
          created_at?: string
          duration_months?: number
          fee?: number
          id?: number
          max_equipment?: number
          name?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          end_date: string
          id: number
          member_id: number
          plan_id: number
          start_date: string
          status: string
        }
        Insert: {
          end_date: string
          id?: number
          member_id: number
          plan_id: number
          start_date?: string
          status?: string
        }
        Update: {
          end_date?: string
          id?: number
          member_id?: number
          plan_id?: number
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_fee_dues"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_membership_status"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_player_performance"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          id: number
          membership_id: number
          method: string
          paid_on: string
          reference: string | null
        }
        Insert: {
          amount: number
          id?: number
          membership_id: number
          method?: string
          paid_on?: string
          reference?: string | null
        }
        Update: {
          amount?: number
          id?: number
          membership_id?: number
          method?: string
          paid_on?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "v_fee_dues"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "v_membership_status"
            referencedColumns: ["membership_id"]
          },
        ]
      }
      player_stats: {
        Row: {
          fixture_id: number
          member_id: number
          points: number
        }
        Insert: {
          fixture_id: number
          member_id: number
          points?: number
        }
        Update: {
          fixture_id?: number
          member_id?: number
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_fee_dues"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "player_stats_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_membership_status"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "player_stats_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_player_performance"
            referencedColumns: ["member_id"]
          },
        ]
      }
      results: {
        Row: {
          away_score: number
          fixture_id: number
          home_score: number
          recorded_at: string
        }
        Insert: {
          away_score: number
          fixture_id: number
          home_score: number
          recorded_at?: string
        }
        Update: {
          away_score?: number
          fixture_id?: number
          home_score?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: true
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      sports: {
        Row: {
          id: number
          max_team_size: number
          name: string
        }
        Insert: {
          id?: number
          max_team_size: number
          name: string
        }
        Update: {
          id?: number
          max_team_size?: number
          name?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          is_captain: boolean
          jersey_no: number | null
          joined_on: string
          member_id: number
          team_id: number
        }
        Insert: {
          is_captain?: boolean
          jersey_no?: number | null
          joined_on?: string
          member_id: number
          team_id: number
        }
        Update: {
          is_captain?: boolean
          jersey_no?: number | null
          joined_on?: string
          member_id?: number
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_fee_dues"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_membership_status"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "v_player_performance"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          coach_id: number | null
          created_at: string
          id: number
          name: string
          sport_id: number
        }
        Insert: {
          coach_id?: number | null
          created_at?: string
          id?: number
          name: string
          sport_id: number
        }
        Update: {
          coach_id?: number | null
          created_at?: string
          id?: number
          name?: string
          sport_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          registered_on: string
          team_id: number
          tournament_id: number
        }
        Insert: {
          registered_on?: string
          team_id: number
          tournament_id: number
        }
        Update: {
          registered_on?: string
          team_id?: number
          tournament_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          end_date: string
          id: number
          name: string
          sport_id: number
          start_date: string
          status: string
        }
        Insert: {
          end_date: string
          id?: number
          name: string
          sport_id: number
          start_date: string
          status?: string
        }
        Update: {
          end_date?: string
          id?: number
          name?: string
          sport_id?: number
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          coach_id: number | null
          ends_at: string
          facility_id: number
          focus: string | null
          id: number
          starts_at: string
          team_id: number
        }
        Insert: {
          coach_id?: number | null
          ends_at: string
          facility_id: number
          focus?: string | null
          id?: number
          starts_at: string
          team_id: number
        }
        Update: {
          coach_id?: number | null
          ends_at?: string
          facility_id?: number
          focus?: string | null
          id?: number
          starts_at?: string
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "v_facility_usage"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "training_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_equipment_status: {
        Row: {
          available_qty: number | null
          category: string | null
          equipment_id: number | null
          issued_qty: number | null
          name: string | null
          overdue_issues: number | null
          total_qty: number | null
        }
        Insert: {
          available_qty?: number | null
          category?: string | null
          equipment_id?: number | null
          issued_qty?: never
          name?: string | null
          overdue_issues?: never
          total_qty?: number | null
        }
        Update: {
          available_qty?: number | null
          category?: string | null
          equipment_id?: number | null
          issued_qty?: never
          name?: string | null
          overdue_issues?: never
          total_qty?: number | null
        }
        Relationships: []
      }
      v_facility_usage: {
        Row: {
          booking_slots: number | null
          capacity: number | null
          facility_id: number | null
          facility_type: string | null
          fixture_slots: number | null
          hours_used: number | null
          name: string | null
          total_slots: number | null
          training_slots: number | null
        }
        Relationships: []
      }
      v_fee_dues: {
        Row: {
          due: number | null
          end_date: string | null
          fee: number | null
          full_name: string | null
          member_id: number | null
          membership_id: number | null
          paid: number | null
          plan: string | null
          start_date: string | null
        }
        Relationships: []
      }
      v_membership_status: {
        Row: {
          days_left: number | null
          effective_status: string | null
          email: string | null
          end_date: string | null
          full_name: string | null
          member_id: number | null
          membership_id: number | null
          plan: string | null
          start_date: string | null
        }
        Relationships: []
      }
      v_player_performance: {
        Row: {
          avg_points: number | null
          best: number | null
          full_name: string | null
          matches: number | null
          member_id: number | null
          total_points: number | null
        }
        Relationships: []
      }
      v_standings: {
        Row: {
          conceded: number | null
          diff: number | null
          drawn: number | null
          lost: number | null
          played: number | null
          points: number | null
          scored: number | null
          team: string | null
          team_id: number | null
          tournament: string | null
          tournament_id: number | null
          won: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      facility_conflict: {
        Args: {
          _e: string
          _facility: number
          _id: number
          _s: string
          _tbl: string
        }
        Returns: boolean
      }
      has_active_membership: {
        Args: { _member: number; _on?: string }
        Returns: boolean
      }
      team_conflict: {
        Args: {
          _e: string
          _id: number
          _s: string
          _tbl: string
          _team: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
