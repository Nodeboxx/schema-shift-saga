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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      dosage_forms: {
        Row: {
          created_at: string | null
          icon_url: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon_url?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon_url?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      drug_classes: {
        Row: {
          created_at: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      generics: {
        Row: {
          created_at: string | null
          drug_class_id: number | null
          id: number
          indication: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          drug_class_id?: number | null
          id?: number
          indication?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          drug_class_id?: number | null
          id?: number
          indication?: string | null
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "generics_drug_class_id_fkey"
            columns: ["drug_class_id"]
            isOneToOne: false
            referencedRelation: "drug_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          created_at: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          brand_name: string
          created_at: string | null
          dosage_form_id: number | null
          generic_id: number | null
          generic_name: string | null
          icon_url: string | null
          id: number
          manufacturer_id: number | null
          manufacturer_name: string | null
          package_info: string | null
          slug: string
          strength: string | null
        }
        Insert: {
          brand_name: string
          created_at?: string | null
          dosage_form_id?: number | null
          generic_id?: number | null
          generic_name?: string | null
          icon_url?: string | null
          id?: number
          manufacturer_id?: number | null
          manufacturer_name?: string | null
          package_info?: string | null
          slug: string
          strength?: string | null
        }
        Update: {
          brand_name?: string
          created_at?: string | null
          dosage_form_id?: number | null
          generic_id?: number | null
          generic_name?: string | null
          icon_url?: string | null
          id?: number
          manufacturer_id?: number | null
          manufacturer_name?: string | null
          package_info?: string | null
          slug?: string
          strength?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicines_dosage_form_id_fkey"
            columns: ["dosage_form_id"]
            isOneToOne: false
            referencedRelation: "dosage_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicines_generic_id_fkey"
            columns: ["generic_id"]
            isOneToOne: false
            referencedRelation: "generics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicines_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: string | null
          created_at: string | null
          id: string
          name: string
          sex: string | null
          user_id: string
          weight: string | null
        }
        Insert: {
          age?: string | null
          created_at?: string | null
          id?: string
          name: string
          sex?: string | null
          user_id: string
          weight?: string | null
        }
        Update: {
          age?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sex?: string | null
          user_id?: string
          weight?: string | null
        }
        Relationships: []
      }
      prescription_items: {
        Row: {
          category_content: string | null
          created_at: string | null
          details: string | null
          dose: string | null
          id: string
          item_type: string
          name: string | null
          prescription_id: string
          sort_order: number
        }
        Insert: {
          category_content?: string | null
          created_at?: string | null
          details?: string | null
          dose?: string | null
          id?: string
          item_type: string
          name?: string | null
          prescription_id: string
          sort_order: number
        }
        Update: {
          category_content?: string | null
          created_at?: string | null
          details?: string | null
          dose?: string | null
          id?: string
          item_type?: string
          name?: string | null
          prescription_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_pages: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          page_number: number
          prescription_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          page_number: number
          prescription_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          page_number?: number
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_pages_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          adv_text: string | null
          cc_text: string | null
          column_width_left: string | null
          column_width_right: string | null
          created_at: string | null
          dx_text: string | null
          follow_up_text: string | null
          id: string
          instructions_text: string | null
          oe_anemia: string | null
          oe_bp_d: string | null
          oe_bp_s: string | null
          oe_jaundice: string | null
          oe_pulse: string | null
          oe_spo2: string | null
          oe_temp: string | null
          page_count: number | null
          patient_age: string | null
          patient_age_days: number | null
          patient_age_months: number | null
          patient_age_years: number | null
          patient_id: string | null
          patient_name: string
          patient_sex: string | null
          patient_weight: string | null
          patient_weight_grams: number | null
          patient_weight_kg: number | null
          prescription_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adv_text?: string | null
          cc_text?: string | null
          column_width_left?: string | null
          column_width_right?: string | null
          created_at?: string | null
          dx_text?: string | null
          follow_up_text?: string | null
          id?: string
          instructions_text?: string | null
          oe_anemia?: string | null
          oe_bp_d?: string | null
          oe_bp_s?: string | null
          oe_jaundice?: string | null
          oe_pulse?: string | null
          oe_spo2?: string | null
          oe_temp?: string | null
          page_count?: number | null
          patient_age?: string | null
          patient_age_days?: number | null
          patient_age_months?: number | null
          patient_age_years?: number | null
          patient_id?: string | null
          patient_name: string
          patient_sex?: string | null
          patient_weight?: string | null
          patient_weight_grams?: number | null
          patient_weight_kg?: number | null
          prescription_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adv_text?: string | null
          cc_text?: string | null
          column_width_left?: string | null
          column_width_right?: string | null
          created_at?: string | null
          dx_text?: string | null
          follow_up_text?: string | null
          id?: string
          instructions_text?: string | null
          oe_anemia?: string | null
          oe_bp_d?: string | null
          oe_bp_s?: string | null
          oe_jaundice?: string | null
          oe_pulse?: string | null
          oe_spo2?: string | null
          oe_temp?: string | null
          page_count?: number | null
          patient_age?: string | null
          patient_age_days?: number | null
          patient_age_months?: number | null
          patient_age_years?: number | null
          patient_id?: string | null
          patient_name?: string
          patient_sex?: string | null
          patient_weight?: string | null
          patient_weight_grams?: number | null
          patient_weight_kg?: number | null
          prescription_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          degree_bn: string | null
          degree_en: string | null
          email: string
          footer_left: string | null
          footer_right: string | null
          full_name: string | null
          id: string
          name_bn: string | null
        }
        Insert: {
          created_at?: string | null
          degree_bn?: string | null
          degree_en?: string | null
          email: string
          footer_left?: string | null
          footer_right?: string | null
          full_name?: string | null
          id: string
          name_bn?: string | null
        }
        Update: {
          created_at?: string | null
          degree_bn?: string | null
          degree_en?: string | null
          email?: string
          footer_left?: string | null
          footer_right?: string | null
          full_name?: string | null
          id?: string
          name_bn?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
