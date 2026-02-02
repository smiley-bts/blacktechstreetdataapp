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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contact_notes: {
        Row: {
          contact_id: string
          id: string
          note: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contact_id: string
          id?: string
          note: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contact_id?: string
          id?: string
          note?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_overrides: {
        Row: {
          contact_id: string
          field_name: string
          field_value: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contact_id: string
          field_name: string
          field_value: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contact_id?: string
          field_name?: string
          field_value?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_tags: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          id: string
          tag: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          tag: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          tag?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          after_event_opportunities: string | null
          age_range: string | null
          aha_moment: string | null
          ai_confidence: string | null
          ai_experience_level: string | null
          ai_task_understanding: string | null
          ai_tools_used: string | null
          attend_follow_up: string | null
          bias_responsibility: string | null
          city: string | null
          cohort1_ai_level: string | null
          cohort1_industry: string | null
          community_involvement: string | null
          company_name: string | null
          confidentiality_agreed: boolean | null
          contact_owner: string | null
          country: string | null
          create_date: string | null
          created_at: string
          created_by: string | null
          email: string | null
          email_domain: string | null
          events_actually_attended: string | null
          events_attended: string | null
          favorite_part: string | null
          first_name: string | null
          full_name: string | null
          id: string
          image_release_agreed: boolean | null
          income_range: string | null
          industry: string | null
          job_title: string | null
          knew_team_before: string | null
          last_activity_date: string | null
          last_modified_date: string | null
          last_name: string | null
          lead_status: string | null
          lifecycle_stage: string | null
          linkedin_url: string | null
          marketing_contact_status: string | null
          new_concept_learned: string | null
          nps_score: string | null
          one_way_to_use_ai: string | null
          optional_quote: string | null
          phone: string | null
          post_event_ai_confidence: string | null
          post_workshop_mindset: string | null
          postal_code: string | null
          pre_workshop_mindset: string | null
          raw_data: Json | null
          record_id: string | null
          record_source: string | null
          release_date: string | null
          release_signature_url: string | null
          release_signed: boolean | null
          responsible_ai_preparedness: string | null
          role_description: string | null
          roles_on_team: string | null
          sept27th_reg: string | null
          space_felt_welcoming: string | null
          state: string | null
          strongest_skill_after_today: string | null
          team_build_description: string | null
          team_community_design: string | null
          team_impact: string | null
          uid: string | null
          updated_at: string
          updated_by: string | null
          volunteer_interest: string | null
          wish_covered_more: string | null
        }
        Insert: {
          after_event_opportunities?: string | null
          age_range?: string | null
          aha_moment?: string | null
          ai_confidence?: string | null
          ai_experience_level?: string | null
          ai_task_understanding?: string | null
          ai_tools_used?: string | null
          attend_follow_up?: string | null
          bias_responsibility?: string | null
          city?: string | null
          cohort1_ai_level?: string | null
          cohort1_industry?: string | null
          community_involvement?: string | null
          company_name?: string | null
          confidentiality_agreed?: boolean | null
          contact_owner?: string | null
          country?: string | null
          create_date?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          email_domain?: string | null
          events_actually_attended?: string | null
          events_attended?: string | null
          favorite_part?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          image_release_agreed?: boolean | null
          income_range?: string | null
          industry?: string | null
          job_title?: string | null
          knew_team_before?: string | null
          last_activity_date?: string | null
          last_modified_date?: string | null
          last_name?: string | null
          lead_status?: string | null
          lifecycle_stage?: string | null
          linkedin_url?: string | null
          marketing_contact_status?: string | null
          new_concept_learned?: string | null
          nps_score?: string | null
          one_way_to_use_ai?: string | null
          optional_quote?: string | null
          phone?: string | null
          post_event_ai_confidence?: string | null
          post_workshop_mindset?: string | null
          postal_code?: string | null
          pre_workshop_mindset?: string | null
          raw_data?: Json | null
          record_id?: string | null
          record_source?: string | null
          release_date?: string | null
          release_signature_url?: string | null
          release_signed?: boolean | null
          responsible_ai_preparedness?: string | null
          role_description?: string | null
          roles_on_team?: string | null
          sept27th_reg?: string | null
          space_felt_welcoming?: string | null
          state?: string | null
          strongest_skill_after_today?: string | null
          team_build_description?: string | null
          team_community_design?: string | null
          team_impact?: string | null
          uid?: string | null
          updated_at?: string
          updated_by?: string | null
          volunteer_interest?: string | null
          wish_covered_more?: string | null
        }
        Update: {
          after_event_opportunities?: string | null
          age_range?: string | null
          aha_moment?: string | null
          ai_confidence?: string | null
          ai_experience_level?: string | null
          ai_task_understanding?: string | null
          ai_tools_used?: string | null
          attend_follow_up?: string | null
          bias_responsibility?: string | null
          city?: string | null
          cohort1_ai_level?: string | null
          cohort1_industry?: string | null
          community_involvement?: string | null
          company_name?: string | null
          confidentiality_agreed?: boolean | null
          contact_owner?: string | null
          country?: string | null
          create_date?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          email_domain?: string | null
          events_actually_attended?: string | null
          events_attended?: string | null
          favorite_part?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          image_release_agreed?: boolean | null
          income_range?: string | null
          industry?: string | null
          job_title?: string | null
          knew_team_before?: string | null
          last_activity_date?: string | null
          last_modified_date?: string | null
          last_name?: string | null
          lead_status?: string | null
          lifecycle_stage?: string | null
          linkedin_url?: string | null
          marketing_contact_status?: string | null
          new_concept_learned?: string | null
          nps_score?: string | null
          one_way_to_use_ai?: string | null
          optional_quote?: string | null
          phone?: string | null
          post_event_ai_confidence?: string | null
          post_workshop_mindset?: string | null
          postal_code?: string | null
          pre_workshop_mindset?: string | null
          raw_data?: Json | null
          record_id?: string | null
          record_source?: string | null
          release_date?: string | null
          release_signature_url?: string | null
          release_signed?: boolean | null
          responsible_ai_preparedness?: string | null
          role_description?: string | null
          roles_on_team?: string | null
          sept27th_reg?: string | null
          space_felt_welcoming?: string | null
          state?: string | null
          strongest_skill_after_today?: string | null
          team_build_description?: string | null
          team_community_design?: string | null
          team_impact?: string | null
          uid?: string | null
          updated_at?: string
          updated_by?: string | null
          volunteer_interest?: string | null
          wish_covered_more?: string | null
        }
        Relationships: []
      }
      event_attendance: {
        Row: {
          completed_survey: boolean | null
          confirmed_attended: boolean | null
          created_at: string
          created_by: string | null
          day_label: string | null
          event_date: string
          event_name: string
          event_type: string | null
          id: string
          participant_id: string
          registered_only: boolean | null
          signed_release: boolean | null
          source: string | null
        }
        Insert: {
          completed_survey?: boolean | null
          confirmed_attended?: boolean | null
          created_at?: string
          created_by?: string | null
          day_label?: string | null
          event_date: string
          event_name: string
          event_type?: string | null
          id?: string
          participant_id: string
          registered_only?: boolean | null
          signed_release?: boolean | null
          source?: string | null
        }
        Update: {
          completed_survey?: boolean | null
          confirmed_attended?: boolean | null
          created_at?: string
          created_by?: string | null
          day_label?: string | null
          event_date?: string
          event_name?: string
          event_type?: string | null
          id?: string
          participant_id?: string
          registered_only?: boolean | null
          signed_release?: boolean | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      merge_history: {
        Row: {
          id: string
          kept_participant_id: string
          merge_reason: string | null
          merged_at: string
          merged_by: string | null
          merged_data_snapshot: Json | null
          merged_emails: string[] | null
          merged_participant_id: string | null
          merged_participant_name: string | null
        }
        Insert: {
          id?: string
          kept_participant_id: string
          merge_reason?: string | null
          merged_at?: string
          merged_by?: string | null
          merged_data_snapshot?: Json | null
          merged_emails?: string[] | null
          merged_participant_id?: string | null
          merged_participant_name?: string | null
        }
        Update: {
          id?: string
          kept_participant_id?: string
          merge_reason?: string | null
          merged_at?: string
          merged_by?: string | null
          merged_data_snapshot?: Json | null
          merged_emails?: string[] | null
          merged_participant_id?: string | null
          merged_participant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merge_history_kept_participant_id_fkey"
            columns: ["kept_participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_emails: {
        Row: {
          added_at: string
          added_by: string | null
          email: string
          id: string
          is_primary: boolean | null
          participant_id: string
          source: string | null
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          email: string
          id?: string
          is_primary?: boolean | null
          participant_id: string
          source?: string | null
        }
        Update: {
          added_at?: string
          added_by?: string | null
          email?: string
          id?: string
          is_primary?: boolean | null
          participant_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_emails_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          age_range: string | null
          ai_experience_level: string | null
          city: string | null
          cohort_id: string | null
          cohort_start_date: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          demographic_completed: boolean | null
          demographic_updated_at: string | null
          disability_status: boolean | null
          education_level: string | null
          employment_status: string | null
          ethnicity: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          income_range: string | null
          industry: string | null
          is_stakeholder: boolean | null
          job_title: string | null
          last_name: string | null
          notes: string | null
          original_contact_id: string | null
          phone: string | null
          primary_email: string | null
          referral_source: string | null
          state: string | null
          updated_at: string
          updated_by: string | null
          veteran_status: boolean | null
          zip_code: string | null
        }
        Insert: {
          age_range?: string | null
          ai_experience_level?: string | null
          city?: string | null
          cohort_id?: string | null
          cohort_start_date?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          demographic_completed?: boolean | null
          demographic_updated_at?: string | null
          disability_status?: boolean | null
          education_level?: string | null
          employment_status?: string | null
          ethnicity?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          income_range?: string | null
          industry?: string | null
          is_stakeholder?: boolean | null
          job_title?: string | null
          last_name?: string | null
          notes?: string | null
          original_contact_id?: string | null
          phone?: string | null
          primary_email?: string | null
          referral_source?: string | null
          state?: string | null
          updated_at?: string
          updated_by?: string | null
          veteran_status?: boolean | null
          zip_code?: string | null
        }
        Update: {
          age_range?: string | null
          ai_experience_level?: string | null
          city?: string | null
          cohort_id?: string | null
          cohort_start_date?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          demographic_completed?: boolean | null
          demographic_updated_at?: string | null
          disability_status?: boolean | null
          education_level?: string | null
          employment_status?: string | null
          ethnicity?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          income_range?: string | null
          industry?: string | null
          is_stakeholder?: boolean | null
          job_title?: string | null
          last_name?: string | null
          notes?: string | null
          original_contact_id?: string | null
          phone?: string | null
          primary_email?: string | null
          referral_source?: string | null
          state?: string | null
          updated_at?: string
          updated_by?: string | null
          veteran_status?: boolean | null
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      log_activity: {
        Args: { _action: string; _details?: Json }
        Returns: string
      }
      lookup_email_by_username: {
        Args: { lookup_username: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "owner"
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
      app_role: ["admin", "owner"],
    },
  },
} as const
