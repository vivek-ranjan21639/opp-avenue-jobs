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
      authors: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          name: string
          profile_pic_url: string | null
          profile_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          name: string
          profile_pic_url?: string | null
          profile_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string
          profile_pic_url?: string | null
          profile_url?: string | null
        }
        Relationships: []
      }
      benefits: {
        Row: {
          created_at: string
          human_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          human_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          human_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      blog_tags: {
        Row: {
          blog_id: string
          tag_id: string
        }
        Insert: {
          blog_id: string
          tag_id: string
        }
        Update: {
          blog_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_tags_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          featured: boolean | null
          id: string
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          status: Database["public"]["Enums"]["blog_status"] | null
          summary: string | null
          thumbnail_url: string | null
          title: string
          top_blog: boolean | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          featured?: boolean | null
          id?: string
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          status?: Database["public"]["Enums"]["blog_status"] | null
          summary?: string | null
          thumbnail_url?: string | null
          title: string
          top_blog?: boolean | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          featured?: boolean | null
          id?: string
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"] | null
          summary?: string | null
          thumbnail_url?: string | null
          title?: string
          top_blog?: boolean | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          contact_email: string | null
          created_at: string
          culture_summary: string | null
          employee_count: string | null
          founded_year: number | null
          hq_location: string | null
          human_id: string | null
          id: string
          linkedin: string | null
          logo_url: string | null
          name: string
          office_locations: string[] | null
          sector: string | null
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          culture_summary?: string | null
          employee_count?: string | null
          founded_year?: number | null
          hq_location?: string | null
          human_id?: string | null
          id?: string
          linkedin?: string | null
          logo_url?: string | null
          name: string
          office_locations?: string[] | null
          sector?: string | null
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          culture_summary?: string | null
          employee_count?: string | null
          founded_year?: number | null
          hq_location?: string | null
          human_id?: string | null
          id?: string
          linkedin?: string | null
          logo_url?: string | null
          name?: string
          office_locations?: string[] | null
          sector?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_culture: {
        Row: {
          company_id: string
          id: string
          point: string
        }
        Insert: {
          company_id: string
          id?: string
          point: string
        }
        Update: {
          company_id?: string
          id?: string
          point?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_culture_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          created_at: string
          description: string | null
          human_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          human_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          human_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      eligibility_criteria: {
        Row: {
          age_limit: number | null
          education_level: string | null
          id: string
          job_id: string
          max_experience: number | null
          min_experience: number | null
          other_criteria: string | null
        }
        Insert: {
          age_limit?: number | null
          education_level?: string | null
          id?: string
          job_id: string
          max_experience?: number | null
          min_experience?: number | null
          other_criteria?: string | null
        }
        Update: {
          age_limit?: number | null
          education_level?: string | null
          id?: string
          job_id?: string
          max_experience?: number | null
          min_experience?: number | null
          other_criteria?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eligibility_criteria_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_content: {
        Row: {
          content_type: string
          created_at: string | null
          display_location: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          job_id: string | null
          link_url: string | null
          title: string | null
        }
        Insert: {
          content_type: string
          created_at?: string | null
          display_location: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          job_id?: string | null
          link_url?: string | null
          title?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string | null
          display_location?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          job_id?: string | null
          link_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_content_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_benefits: {
        Row: {
          benefit_id: string
          job_id: string
        }
        Insert: {
          benefit_id: string
          job_id: string
        }
        Update: {
          benefit_id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_benefits_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_benefits_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_domains: {
        Row: {
          domain_id: string
          job_id: string
        }
        Insert: {
          domain_id: string
          job_id: string
        }
        Update: {
          domain_id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_domains_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_domains_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_locations: {
        Row: {
          job_id: string
          location_id: string
        }
        Insert: {
          job_id: string
          location_id: string
        }
        Update: {
          job_id?: string
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_locations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          job_id: string
          skill_id: string
        }
        Insert: {
          job_id: string
          skill_id: string
        }
        Update: {
          job_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_email: string | null
          application_link: string | null
          company_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_enum"] | null
          deadline: string | null
          deleted_at: string | null
          description: string | null
          human_id: string | null
          id: string
          job_type: Database["public"]["Enums"]["job_type_enum"] | null
          qualifications: string[] | null
          responsibilities: string[] | null
          salary_max: number | null
          salary_min: number | null
          search_vector: unknown
          title: string
          updated_at: string
          updated_by: string | null
          work_mode: Database["public"]["Enums"]["work_mode_enum"] | null
        }
        Insert: {
          application_email?: string | null
          application_link?: string | null
          company_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_enum"] | null
          deadline?: string | null
          deleted_at?: string | null
          description?: string | null
          human_id?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type_enum"] | null
          qualifications?: string[] | null
          responsibilities?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          search_vector?: unknown
          title: string
          updated_at?: string
          updated_by?: string | null
          work_mode?: Database["public"]["Enums"]["work_mode_enum"] | null
        }
        Update: {
          application_email?: string | null
          application_link?: string | null
          company_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_enum"] | null
          deadline?: string | null
          deleted_at?: string | null
          description?: string | null
          human_id?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type_enum"] | null
          qualifications?: string[] | null
          responsibilities?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          search_vector?: unknown
          title?: string
          updated_at?: string
          updated_by?: string | null
          work_mode?: Database["public"]["Enums"]["work_mode_enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city: string
          country: string | null
          human_id: string | null
          id: string
          state: string | null
        }
        Insert: {
          city: string
          country?: string | null
          human_id?: string | null
          id?: string
          state?: string | null
        }
        Update: {
          city?: string
          country?: string | null
          human_id?: string | null
          id?: string
          state?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          content_text: string | null
          content_type: Database["public"]["Enums"]["content_type_enum"] | null
          created_at: string | null
          description: string | null
          display_order: number | null
          external_url: string | null
          file_url: string | null
          highlight_type:
            | Database["public"]["Enums"]["resource_highlight_type"]
            | null
          id: string
          parent_id: string | null
          thumbnail_url: string | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["content_type_enum"] | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          external_url?: string | null
          file_url?: string | null
          highlight_type?:
            | Database["public"]["Enums"]["resource_highlight_type"]
            | null
          id?: string
          parent_id?: string | null
          thumbnail_url?: string | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["content_type_enum"] | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          external_url?: string | null
          file_url?: string | null
          highlight_type?:
            | Database["public"]["Enums"]["resource_highlight_type"]
            | null
          id?: string
          parent_id?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          human_id: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          human_id?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          human_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_expired_jobs: { Args: never; Returns: undefined }
    }
    Enums: {
      blog_status: "draft" | "published" | "archived"
      content_type_enum: "text" | "file" | "external" | "video" | "none"
      currency_enum: "INR" | "USD" | "EUR" | "GBP" | "Other"
      job_type_enum: "Full-time" | "Part-time" | "Internship" | "Contract"
      resource_highlight_type: "featured" | "new" | "general"
      resource_type: "category" | "resource" | "content"
      work_mode_enum: "Remote" | "On-site" | "Hybrid"
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
      blog_status: ["draft", "published", "archived"],
      content_type_enum: ["text", "file", "external", "video", "none"],
      currency_enum: ["INR", "USD", "EUR", "GBP", "Other"],
      job_type_enum: ["Full-time", "Part-time", "Internship", "Contract"],
      resource_highlight_type: ["featured", "new", "general"],
      resource_type: ["category", "resource", "content"],
      work_mode_enum: ["Remote", "On-site", "Hybrid"],
    },
  },
} as const
