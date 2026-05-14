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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      doctors: {
        Row: {
          chamber: string
          created_at: string
          designation: string
          division: string
          doctor_name: string
          id: string
          image_url: string | null
          partner_id: string | null
          profile_url: string | null
          qualification: string
          specialization: string
        }
        Insert: {
          chamber?: string
          created_at?: string
          designation?: string
          division?: string
          doctor_name: string
          id?: string
          image_url?: string | null
          partner_id?: string | null
          profile_url?: string | null
          qualification?: string
          specialization?: string
        }
        Update: {
          chamber?: string
          created_at?: string
          designation?: string
          division?: string
          doctor_name?: string
          id?: string
          image_url?: string | null
          partner_id?: string | null
          profile_url?: string | null
          qualification?: string
          specialization?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string | null
          created_at: string
          district: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          specialties: string[] | null
          type: string
          upazila: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          district?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          specialties?: string[] | null
          type?: string
          upazila?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          district?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          specialties?: string[] | null
          type?: string
          upazila?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          condition: string | null
          created_at: string
          district: string
          id: string
          source: string | null
          specialty: string | null
          status: string
          symptom: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string
          district?: string
          id?: string
          source?: string | null
          specialty?: string | null
          status?: string
          symptom?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string
          district?: string
          id?: string
          source?: string | null
          specialty?: string | null
          status?: string
          symptom?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          preferred_date: string | null
          preferred_time: string | null
          provider_id: string
          provider_name: string | null
          service_type: string
          status: string
          user_id: string | null
          user_name: string
          user_phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          provider_id: string
          provider_name?: string | null
          service_type: string
          status?: string
          user_id?: string | null
          user_name: string
          user_phone: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          provider_id?: string
          provider_name?: string | null
          service_type?: string
          status?: string
          user_id?: string | null
          user_name?: string
          user_phone?: string
        }
        Relationships: []
      }
      medical_logs: {
        Row: {
          ai_response: Json | null
          ai_response_text: string | null
          created_at: string
          id: string
          is_emergency: boolean
          profile_id: string | null
          user_id: string | null
          user_message: string
        }
        Insert: {
          ai_response?: Json | null
          ai_response_text?: string | null
          created_at?: string
          id?: string
          is_emergency?: boolean
          profile_id?: string | null
          user_id?: string | null
          user_message: string
        }
        Update: {
          ai_response?: Json | null
          ai_response_text?: string | null
          created_at?: string
          id?: string
          is_emergency?: boolean
          profile_id?: string | null
          user_id?: string | null
          user_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: string | null
          blood_group: string | null
          created_at: string
          district: string | null
          gender: string | null
          id: string
          income_range: string | null
          is_active: boolean
          local_id: string | null
          location: string | null
          monthly_income: number | null
          name: string | null
          relation: string | null
          role: string | null
          upazila: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age?: string | null
          blood_group?: string | null
          created_at?: string
          district?: string | null
          gender?: string | null
          id?: string
          income_range?: string | null
          is_active?: boolean
          local_id?: string | null
          location?: string | null
          monthly_income?: number | null
          name?: string | null
          relation?: string | null
          role?: string | null
          upazila?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: string | null
          blood_group?: string | null
          created_at?: string
          district?: string | null
          gender?: string | null
          id?: string
          income_range?: string | null
          is_active?: boolean
          local_id?: string | null
          location?: string | null
          monthly_income?: number | null
          name?: string | null
          relation?: string | null
          role?: string | null
          upazila?: string | null
          updated_at?: string
          user_id?: string | null
          Relationships: []
        }
        terms_acceptance: {
          Row: {
            created_at: string
            id: string
            role: string | null
            user_id: string
          }
          Insert: {
            created_at?: string
            id?: string
            role?: string | null
            user_id: string
          }
          Update: {
            created_at?: string
            id?: string
            role?: string | null
            user_id?: string
          }
          Relationships: []
        }
      }
      Views: {
        [_ in never]: never
      }
      Functions: {
        [_ in never]: never
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
    Enums: {},
  },
} as const
