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
      appointments: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          doctor_id: string
          end_time: string
          id: string
          notes: string | null
          patient_id: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          doctor_id: string
          end_time: string
          id?: string
          notes?: string | null
          patient_id: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          doctor_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          patient_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_members: {
        Row: {
          clinic_id: string
          created_at: string | null
          id: string
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          header_image_url: string | null
          id: string
          logo_url: string | null
          max_doctors: number | null
          max_patients: number | null
          name: string
          owner_id: string | null
          phone: string | null
          settings: Json | null
          slug: string
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          header_image_url?: string | null
          id?: string
          logo_url?: string | null
          max_doctors?: number | null
          max_patients?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          settings?: Json | null
          slug: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          header_image_url?: string | null
          id?: string
          logo_url?: string | null
          max_doctors?: number | null
          max_patients?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          settings?: Json | null
          slug?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_sections: {
        Row: {
          content: Json
          created_at: string | null
          display_order: number | null
          id: string
          is_published: boolean | null
          section_name: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          section_name: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          section_name?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          category: string | null
          clinic_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          category?: string | null
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          category?: string | null
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
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
      impersonation_sessions: {
        Row: {
          admin_user_id: string
          ended_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          started_at: string | null
          target_user_id: string
        }
        Insert: {
          admin_user_id: string
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          started_at?: string | null
          target_user_id: string
        }
        Update: {
          admin_user_id?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          started_at?: string | null
          target_user_id?: string
        }
        Relationships: []
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
      notifications_config: {
        Row: {
          channel: string
          clinic_id: string | null
          created_at: string | null
          event_type: string
          id: string
          is_enabled: boolean | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          channel: string
          clinic_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          is_enabled?: boolean | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          clinic_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          is_enabled?: boolean | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_config_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: string | null
          allergies: string | null
          blood_group: string | null
          clinic_id: string | null
          created_at: string | null
          doctor_id: string | null
          id: string
          medical_history: string | null
          name: string
          notes: string | null
          sex: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }
        Insert: {
          age?: string | null
          allergies?: string | null
          blood_group?: string | null
          clinic_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          medical_history?: string | null
          name: string
          notes?: string | null
          sex?: string | null
          updated_at?: string | null
          user_id: string
          weight?: string | null
        }
        Update: {
          age?: string | null
          allergies?: string | null
          blood_group?: string | null
          clinic_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          medical_history?: string | null
          name?: string
          notes?: string | null
          sex?: string | null
          updated_at?: string | null
          user_id?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_items: {
        Row: {
          category_content: string | null
          created_at: string | null
          details: string | null
          dose: string | null
          duration: string | null
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
          duration?: string | null
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
          duration?: string | null
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
          active_template: string | null
          adv_text: string | null
          cc_text: string | null
          clinic_id: string | null
          column_width_left: string | null
          column_width_right: string | null
          created_at: string | null
          doctor_id: string | null
          dx_text: string | null
          follow_up_text: string | null
          id: string
          instructions_text: string | null
          is_public: boolean | null
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
          qr_code_url: string | null
          template_data: Json | null
          unique_hash: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_template?: string | null
          adv_text?: string | null
          cc_text?: string | null
          clinic_id?: string | null
          column_width_left?: string | null
          column_width_right?: string | null
          created_at?: string | null
          doctor_id?: string | null
          dx_text?: string | null
          follow_up_text?: string | null
          id?: string
          instructions_text?: string | null
          is_public?: boolean | null
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
          qr_code_url?: string | null
          template_data?: Json | null
          unique_hash?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_template?: string | null
          adv_text?: string | null
          cc_text?: string | null
          clinic_id?: string | null
          column_width_left?: string | null
          column_width_right?: string | null
          created_at?: string | null
          doctor_id?: string | null
          dx_text?: string | null
          follow_up_text?: string | null
          id?: string
          instructions_text?: string | null
          is_public?: boolean | null
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
          qr_code_url?: string | null
          template_data?: Json | null
          unique_hash?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          active_template: string | null
          clinic_id: string | null
          created_at: string | null
          custom_templates: Json | null
          degree_bn: string | null
          degree_en: string | null
          email: string
          footer_left: string | null
          footer_right: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          left_template_sections: Json | null
          license_number: string | null
          name_bn: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          settings: Json | null
          specialization: string | null
          subscription_status: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_ends_at: string | null
        }
        Insert: {
          active_template?: string | null
          clinic_id?: string | null
          created_at?: string | null
          custom_templates?: Json | null
          degree_bn?: string | null
          degree_en?: string | null
          email: string
          footer_left?: string | null
          footer_right?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          left_template_sections?: Json | null
          license_number?: string | null
          name_bn?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          settings?: Json | null
          specialization?: string | null
          subscription_status?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_ends_at?: string | null
        }
        Update: {
          active_template?: string | null
          clinic_id?: string | null
          created_at?: string | null
          custom_templates?: Json | null
          degree_bn?: string | null
          degree_en?: string | null
          email?: string
          footer_left?: string | null
          footer_right?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          left_template_sections?: Json | null
          license_number?: string | null
          name_bn?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          settings?: Json | null
          specialization?: string | null
          subscription_status?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_ends_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          performed_by: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          from_email: string
          from_name: string | null
          host: string
          id: string
          is_active: boolean | null
          password_encrypted: string
          port: number
          updated_at: string | null
          use_tls: boolean | null
          username: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          from_email: string
          from_name?: string | null
          host: string
          id?: string
          is_active?: boolean | null
          password_encrypted: string
          port?: number
          updated_at?: string | null
          use_tls?: boolean | null
          username: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          from_email?: string
          from_name?: string | null
          host?: string
          id?: string
          is_active?: boolean | null
          password_encrypted?: string
          port?: number
          updated_at?: string | null
          use_tls?: boolean | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "smtp_settings_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          clinic_id: string | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          clinic_id?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          clinic_id?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          action: string
          clinic_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      assign_user_role: {
        Args: {
          user_email: string
          user_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      get_prescription_qr_url: {
        Args: { prescription_id: string }
        Returns: string
      }
      get_user_roles: {
        Args: { target_user_id: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "super_admin" | "clinic_admin" | "doctor" | "staff" | "patient"
      appointment_status:
        | "scheduled"
        | "in_consultation"
        | "completed"
        | "cancelled"
        | "no_show"
      subscription_tier: "free" | "pro" | "enterprise"
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
      app_role: ["super_admin", "clinic_admin", "doctor", "staff", "patient"],
      appointment_status: [
        "scheduled",
        "in_consultation",
        "completed",
        "cancelled",
        "no_show",
      ],
      subscription_tier: ["free", "pro", "enterprise"],
    },
  },
} as const
