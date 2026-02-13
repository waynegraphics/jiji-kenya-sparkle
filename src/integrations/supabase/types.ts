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
      addon_tiers: {
        Row: {
          addon_id: string
          created_at: string
          currency: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          price: number
          quantity: number
          updated_at: string
        }
        Insert: {
          addon_id: string
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          price?: number
          quantity?: number
          updated_at?: string
        }
        Update: {
          addon_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addon_tiers_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
        ]
      }
      addons: {
        Row: {
          bg_color: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          text_color: string | null
          type: Database["public"]["Enums"]["addon_type"]
          updated_at: string
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          text_color?: string | null
          type: Database["public"]["Enums"]["addon_type"]
          updated_at?: string
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          text_color?: string | null
          type?: Database["public"]["Enums"]["addon_type"]
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          browser_name: string | null
          converted: boolean | null
          converted_user_id: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          os_name: string | null
          page_url: string | null
          referral_code: string
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          browser_name?: string | null
          converted?: boolean | null
          converted_user_id?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          os_name?: string | null
          page_url?: string | null
          referral_code: string
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          browser_name?: string | null
          converted?: boolean | null
          converted_user_id?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          os_name?: string | null
          page_url?: string | null
          referral_code?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payouts: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          mpesa_phone: string | null
          mpesa_receipt: string | null
          notes: string | null
          payment_method: string
          processed_at: string | null
          processed_by: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          mpesa_phone?: string | null
          mpesa_receipt?: string | null
          notes?: string | null
          payment_method?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          mpesa_phone?: string | null
          mpesa_receipt?: string | null
          notes?: string | null
          payment_method?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          commission_amount: number
          created_at: string
          id: string
          referral_type: string
          referred_user_id: string
          source_amount: number
          status: string
        }
        Insert: {
          affiliate_id: string
          commission_amount?: number
          created_at?: string
          id?: string
          referral_type?: string
          referred_user_id: string
          source_amount?: number
          status?: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          created_at?: string
          id?: string
          referral_type?: string
          referred_user_id?: string
          source_amount?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          commission_rate_registration: number
          commission_rate_subscription: number
          created_at: string
          id: string
          mpesa_phone: string | null
          pending_balance: number
          referral_code: string
          status: string
          total_earnings: number
          total_paid: number
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_rate_registration?: number
          commission_rate_subscription?: number
          created_at?: string
          id?: string
          mpesa_phone?: string | null
          pending_balance?: number
          referral_code: string
          status?: string
          total_earnings?: number
          total_paid?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_rate_registration?: number
          commission_rate_subscription?: number
          created_at?: string
          id?: string
          mpesa_phone?: string | null
          pending_balance?: number
          referral_code?: string
          status?: string
          total_earnings?: number
          total_paid?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agriculture_listings: {
        Row: {
          certifications: string[] | null
          created_at: string | null
          harvest_date: string | null
          id: string
          is_organic: boolean | null
          minimum_order: number | null
          origin: string | null
          product_type: string
          quantity: number | null
          unit: string | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string | null
          harvest_date?: string | null
          id: string
          is_organic?: boolean | null
          minimum_order?: number | null
          origin?: string | null
          product_type: string
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string | null
          harvest_date?: string | null
          id?: string
          is_organic?: boolean | null
          minimum_order?: number | null
          origin?: string | null
          product_type?: string
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agriculture_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          admin_id: string
          content: string
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean | null
          starts_at: string | null
          target_audience: string
          title: string
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          target_audience?: string
          title: string
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          target_audience?: string
          title?: string
        }
        Relationships: []
      }
      base_listings: {
        Row: {
          bumped_at: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          edited_fields: string[] | null
          expires_at: string | null
          featured_until: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_negotiable: boolean | null
          is_urgent: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          main_category_id: string
          previous_data: Json | null
          price: number
          promotion_expires_at: string | null
          promotion_type_id: string | null
          rejection_note: string | null
          status: string | null
          sub_category_id: string | null
          tier_expires_at: string | null
          tier_id: string | null
          tier_priority: number
          title: string
          updated_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          bumped_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          edited_fields?: string[] | null
          expires_at?: string | null
          featured_until?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          is_urgent?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          main_category_id: string
          previous_data?: Json | null
          price?: number
          promotion_expires_at?: string | null
          promotion_type_id?: string | null
          rejection_note?: string | null
          status?: string | null
          sub_category_id?: string | null
          tier_expires_at?: string | null
          tier_id?: string | null
          tier_priority?: number
          title: string
          updated_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          bumped_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          edited_fields?: string[] | null
          expires_at?: string | null
          featured_until?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          is_urgent?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          main_category_id?: string
          previous_data?: Json | null
          price?: number
          promotion_expires_at?: string | null
          promotion_type_id?: string | null
          rejection_note?: string | null
          status?: string | null
          sub_category_id?: string | null
          tier_expires_at?: string | null
          tier_id?: string | null
          tier_priority?: number
          title?: string
          updated_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "base_listings_main_category_id_fkey"
            columns: ["main_category_id"]
            isOneToOne: false
            referencedRelation: "main_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "base_listings_promotion_type_id_fkey"
            columns: ["promotion_type_id"]
            isOneToOne: false
            referencedRelation: "promotion_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "base_listings_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "sub_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "base_listings_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "listing_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      beauty_listings: {
        Row: {
          brand: string | null
          condition: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          is_organic: boolean | null
          product_type: string
          skin_type: string | null
          usage_type: string | null
        }
        Insert: {
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id: string
          is_organic?: boolean | null
          product_type: string
          skin_type?: string | null
          usage_type?: string | null
        }
        Update: {
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_organic?: boolean | null
          product_type?: string
          skin_type?: string | null
          usage_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beauty_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          author_name: string
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          faqs: Json | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          published_at: string | null
          read_time: string | null
          slug: string
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id: string
          author_name?: string
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          faqs?: Json | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string
          author_name?: string
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          faqs?: Json | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      bump_packages: {
        Row: {
          created_at: string
          credits: number
          currency: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits?: number
          currency?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number
          currency?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      bump_transactions: {
        Row: {
          created_at: string
          credits: number
          id: string
          listing_id: string | null
          package_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits: number
          id?: string
          listing_id?: string | null
          package_id?: string | null
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          listing_id?: string | null
          package_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bump_transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bump_transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "bump_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      career_applications: {
        Row: {
          admin_notes: string | null
          cover_letter: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          opening_id: string
          phone: string | null
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          cover_letter?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          opening_id: string
          phone?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          cover_letter?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          opening_id?: string
          phone?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_applications_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: false
            referencedRelation: "career_openings"
            referencedColumns: ["id"]
          },
        ]
      }
      career_openings: {
        Row: {
          application_deadline: string | null
          benefits: string[] | null
          created_at: string
          department: string
          description: string
          display_order: number | null
          id: string
          job_type: string
          location: string
          requirements: string[] | null
          salary_range: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          benefits?: string[] | null
          created_at?: string
          department: string
          description?: string
          display_order?: number | null
          id?: string
          job_type?: string
          location?: string
          requirements?: string[] | null
          salary_range?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          benefits?: string[] | null
          created_at?: string
          department?: string
          description?: string
          display_order?: number | null
          id?: string
          job_type?: string
          location?: string
          requirements?: string[] | null
          salary_range?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      construction_listings: {
        Row: {
          brand: string | null
          condition: string | null
          created_at: string | null
          id: string
          item_type: string
          material_type: string | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          id: string
          item_type: string
          material_type?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          id?: string
          item_type?: string
          material_type?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "construction_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      custom_field_values: {
        Row: {
          category_slug: string
          created_at: string
          field_name: string
          field_value: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_by: string
        }
        Insert: {
          category_slug: string
          created_at?: string
          field_name: string
          field_value: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by: string
        }
        Update: {
          category_slug?: string
          created_at?: string
          field_name?: string
          field_value?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string
        }
        Relationships: []
      }
      electronics_listings: {
        Row: {
          accessories_included: string[] | null
          brand: string
          condition: string | null
          created_at: string | null
          device_type: string
          graphics_card: string | null
          has_warranty: boolean | null
          id: string
          model: string
          operating_system: string | null
          panel_type: string | null
          processor: string | null
          ram: string | null
          refresh_rate: string | null
          screen_resolution: string | null
          screen_size: string | null
          storage: string | null
          warranty_duration: string | null
        }
        Insert: {
          accessories_included?: string[] | null
          brand: string
          condition?: string | null
          created_at?: string | null
          device_type: string
          graphics_card?: string | null
          has_warranty?: boolean | null
          id: string
          model: string
          operating_system?: string | null
          panel_type?: string | null
          processor?: string | null
          ram?: string | null
          refresh_rate?: string | null
          screen_resolution?: string | null
          screen_size?: string | null
          storage?: string | null
          warranty_duration?: string | null
        }
        Update: {
          accessories_included?: string[] | null
          brand?: string
          condition?: string | null
          created_at?: string | null
          device_type?: string
          graphics_card?: string | null
          has_warranty?: boolean | null
          id?: string
          model?: string
          operating_system?: string | null
          panel_type?: string | null
          processor?: string | null
          ram?: string | null
          refresh_rate?: string | null
          screen_resolution?: string | null
          screen_size?: string | null
          storage?: string | null
          warranty_duration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "electronics_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_listings: {
        Row: {
          brand: string | null
          capacity: string | null
          condition: string | null
          created_at: string | null
          equipment_type: string
          hours_used: number | null
          id: string
          model: string | null
          power_source: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          capacity?: string | null
          condition?: string | null
          created_at?: string | null
          equipment_type: string
          hours_used?: number | null
          id: string
          model?: string | null
          power_source?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          capacity?: string | null
          condition?: string | null
          created_at?: string | null
          equipment_type?: string
          hours_used?: number | null
          id?: string
          model?: string | null
          power_source?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      fashion_listings: {
        Row: {
          brand: string | null
          clothing_type: string
          color: string | null
          condition: string | null
          created_at: string | null
          gender: string
          id: string
          material: string | null
          occasion: string | null
          size: string | null
        }
        Insert: {
          brand?: string | null
          clothing_type: string
          color?: string | null
          condition?: string | null
          created_at?: string | null
          gender: string
          id: string
          material?: string | null
          occasion?: string | null
          size?: string | null
        }
        Update: {
          brand?: string | null
          clothing_type?: string
          color?: string | null
          condition?: string | null
          created_at?: string | null
          gender?: string
          id?: string
          material?: string | null
          occasion?: string | null
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fashion_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_durations: {
        Row: {
          created_at: string
          currency: string
          display_order: number
          duration_days: number
          id: string
          is_active: boolean
          price: number
        }
        Insert: {
          created_at?: string
          currency?: string
          display_order?: number
          duration_days: number
          id?: string
          is_active?: boolean
          price?: number
        }
        Update: {
          created_at?: string
          currency?: string
          display_order?: number
          duration_days?: number
          id?: string
          is_active?: boolean
          price?: number
        }
        Relationships: []
      }
      featured_settings: {
        Row: {
          badge_label: string | null
          border_accent: string | null
          created_at: string
          default_duration_days: number
          eligible_tier_ids: string[] | null
          highlight_bg: string | null
          id: string
          is_enabled: boolean
          ribbon_text: string | null
          updated_at: string
        }
        Insert: {
          badge_label?: string | null
          border_accent?: string | null
          created_at?: string
          default_duration_days?: number
          eligible_tier_ids?: string[] | null
          highlight_bg?: string | null
          id?: string
          is_enabled?: boolean
          ribbon_text?: string | null
          updated_at?: string
        }
        Update: {
          badge_label?: string | null
          border_accent?: string | null
          created_at?: string
          default_duration_days?: number
          eligible_tier_ids?: string[] | null
          highlight_bg?: string | null
          id?: string
          is_enabled?: boolean
          ribbon_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      furniture_listings: {
        Row: {
          assembly_required: boolean | null
          brand: string | null
          color: string | null
          condition: string | null
          created_at: string | null
          dimensions: string | null
          id: string
          item_type: string
          material: string | null
          style: string | null
        }
        Insert: {
          assembly_required?: boolean | null
          brand?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string | null
          dimensions?: string | null
          id: string
          item_type: string
          material?: string | null
          style?: string | null
        }
        Update: {
          assembly_required?: boolean | null
          brand?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string | null
          dimensions?: string | null
          id?: string
          item_type?: string
          material?: string | null
          style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "furniture_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          application_deadline: string | null
          application_email: string | null
          application_method: string | null
          application_url: string | null
          benefits: string[] | null
          company_logo: string | null
          company_name: string
          company_website: string | null
          created_at: string | null
          education_level: string | null
          experience_level: string | null
          id: string
          industry: string
          is_remote: boolean | null
          is_salary_negotiable: boolean | null
          job_title: string
          job_type: string
          min_experience_years: number | null
          required_skills: string[] | null
          salary_max: number | null
          salary_min: number | null
          salary_period: string | null
        }
        Insert: {
          application_deadline?: string | null
          application_email?: string | null
          application_method?: string | null
          application_url?: string | null
          benefits?: string[] | null
          company_logo?: string | null
          company_name: string
          company_website?: string | null
          created_at?: string | null
          education_level?: string | null
          experience_level?: string | null
          id: string
          industry: string
          is_remote?: boolean | null
          is_salary_negotiable?: boolean | null
          job_title: string
          job_type: string
          min_experience_years?: number | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string | null
        }
        Update: {
          application_deadline?: string | null
          application_email?: string | null
          application_method?: string | null
          application_url?: string | null
          benefits?: string[] | null
          company_logo?: string | null
          company_name?: string
          company_website?: string | null
          created_at?: string | null
          education_level?: string | null
          experience_level?: string | null
          id?: string
          industry?: string
          is_remote?: boolean | null
          is_salary_negotiable?: boolean | null
          job_title?: string
          job_type?: string
          min_experience_years?: number | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      kenya_counties: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      kenya_towns: {
        Row: {
          county_id: string
          created_at: string | null
          display_order: number | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          county_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          county_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "kenya_towns_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "kenya_counties"
            referencedColumns: ["id"]
          },
        ]
      }
      kids_listings: {
        Row: {
          age_range: string | null
          brand: string | null
          condition: string | null
          created_at: string | null
          gender: string | null
          id: string
          item_type: string
          safety_certified: boolean | null
        }
        Insert: {
          age_range?: string | null
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          gender?: string | null
          id: string
          item_type: string
          safety_certified?: boolean | null
        }
        Update: {
          age_range?: string | null
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          item_type?: string
          safety_certified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "kids_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      leisure_listings: {
        Row: {
          brand: string | null
          condition: string | null
          created_at: string | null
          id: string
          includes: string[] | null
          item_type: string
        }
        Insert: {
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          id: string
          includes?: string[] | null
          item_type: string
        }
        Update: {
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          id?: string
          includes?: string[] | null
          item_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "leisure_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_promotions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          listing_id: string
          payment_reference: string | null
          payment_status: string
          promotion_type_id: string
          purchased_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          listing_id: string
          payment_reference?: string | null
          payment_status?: string
          promotion_type_id: string
          purchased_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          listing_id?: string
          payment_reference?: string | null
          payment_status?: string
          promotion_type_id?: string
          purchased_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_promotions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_promotions_promotion_type_id_fkey"
            columns: ["promotion_type_id"]
            isOneToOne: false
            referencedRelation: "promotion_types"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_tier_purchases: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          listing_id: string
          payment_reference: string | null
          payment_status: string
          purchased_at: string
          status: string
          tier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          listing_id: string
          payment_reference?: string | null
          payment_status?: string
          purchased_at?: string
          status?: string
          tier_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          listing_id?: string
          payment_reference?: string | null
          payment_status?: string
          purchased_at?: string
          status?: string
          tier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_tier_purchases_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_tier_purchases_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "listing_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_tiers: {
        Row: {
          badge_color: string | null
          badge_label: string | null
          border_style: string | null
          created_at: string
          currency: string
          display_order: number
          id: string
          included_featured_days: number | null
          is_active: boolean
          name: string
          price: number
          priority_weight: number
          ribbon_text: string | null
          shadow_intensity: string | null
          updated_at: string
        }
        Insert: {
          badge_color?: string | null
          badge_label?: string | null
          border_style?: string | null
          created_at?: string
          currency?: string
          display_order?: number
          id?: string
          included_featured_days?: number | null
          is_active?: boolean
          name: string
          price?: number
          priority_weight?: number
          ribbon_text?: string | null
          shadow_intensity?: string | null
          updated_at?: string
        }
        Update: {
          badge_color?: string | null
          badge_label?: string | null
          border_style?: string | null
          created_at?: string
          currency?: string
          display_order?: number
          id?: string
          included_featured_days?: number | null
          is_active?: boolean
          name?: string
          price?: number
          priority_weight?: number
          ribbon_text?: string | null
          shadow_intensity?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          category: Database["public"]["Enums"]["listing_category"]
          condition: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_negotiable: boolean | null
          is_urgent: boolean | null
          location: string
          price: number
          title: string
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["listing_category"]
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          is_urgent?: boolean | null
          location?: string
          price: number
          title: string
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["listing_category"]
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          is_urgent?: boolean | null
          location?: string
          price?: number
          title?: string
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      main_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_read: boolean | null
          listing_id: string | null
          message_type: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          listing_id?: string | null
          message_type?: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          listing_id?: string | null
          message_type?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          id: string
          notes: string | null
          reason: string | null
          target_listing_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string | null
          target_listing_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string | null
          target_listing_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_target_listing_id_fkey"
            columns: ["target_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      mpesa_settings: {
        Row: {
          callback_url: string
          consumer_key: string
          consumer_secret: string
          created_at: string
          environment: string
          id: string
          is_enabled: boolean
          passkey: string
          shortcode: string
          updated_at: string
        }
        Insert: {
          callback_url?: string
          consumer_key?: string
          consumer_secret?: string
          created_at?: string
          environment?: string
          id?: string
          is_enabled?: boolean
          passkey?: string
          shortcode?: string
          updated_at?: string
        }
        Update: {
          callback_url?: string
          consumer_key?: string
          consumer_secret?: string
          created_at?: string
          environment?: string
          id?: string
          is_enabled?: boolean
          passkey?: string
          shortcode?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          addon_purchase_id: string | null
          amount: number
          checkout_request_id: string | null
          created_at: string
          currency: string
          id: string
          merchant_request_id: string | null
          mpesa_receipt_number: string | null
          phone_number: string
          result_code: string | null
          result_desc: string | null
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string | null
          transaction_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          addon_purchase_id?: string | null
          amount: number
          checkout_request_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone_number: string
          result_code?: string | null
          result_desc?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          transaction_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          addon_purchase_id?: string | null
          amount?: number
          checkout_request_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone_number?: string
          result_code?: string | null
          result_desc?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          transaction_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_addon_purchase_id_fkey"
            columns: ["addon_purchase_id"]
            isOneToOne: false
            referencedRelation: "seller_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "seller_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_listings: {
        Row: {
          age_months: number | null
          animal_type: string
          breed: string | null
          created_at: string | null
          gender: string | null
          health_certificate: boolean | null
          id: string
          includes: string[] | null
          is_neutered: boolean | null
          is_vaccinated: boolean | null
        }
        Insert: {
          age_months?: number | null
          animal_type: string
          breed?: string | null
          created_at?: string | null
          gender?: string | null
          health_certificate?: boolean | null
          id: string
          includes?: string[] | null
          is_neutered?: boolean | null
          is_vaccinated?: boolean | null
        }
        Update: {
          age_months?: number | null
          animal_type?: string
          breed?: string | null
          created_at?: string | null
          gender?: string | null
          health_certificate?: boolean | null
          id?: string
          includes?: string[] | null
          is_neutered?: boolean | null
          is_vaccinated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_listings: {
        Row: {
          accessories_included: string[] | null
          brand: string
          color: string | null
          condition: string | null
          created_at: string | null
          device_type: string
          has_warranty: boolean | null
          id: string
          is_unlocked: boolean | null
          model: string
          ram: string | null
          storage: string | null
          warranty_duration: string | null
        }
        Insert: {
          accessories_included?: string[] | null
          brand: string
          color?: string | null
          condition?: string | null
          created_at?: string | null
          device_type: string
          has_warranty?: boolean | null
          id: string
          is_unlocked?: boolean | null
          model: string
          ram?: string | null
          storage?: string | null
          warranty_duration?: string | null
        }
        Update: {
          accessories_included?: string[] | null
          brand?: string
          color?: string | null
          condition?: string | null
          created_at?: string | null
          device_type?: string
          has_warranty?: boolean | null
          id?: string
          is_unlocked?: boolean | null
          model?: string
          ram?: string | null
          storage?: string | null
          warranty_duration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          bio: string | null
          bump_wallet_balance: number
          business_name: string | null
          created_at: string
          display_name: string
          id: string
          is_verified: boolean | null
          location: string | null
          phone: string | null
          rating: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          bump_wallet_balance?: number
          business_name?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_verified?: boolean | null
          location?: string | null
          phone?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          bump_wallet_balance?: number
          business_name?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_verified?: boolean | null
          location?: string | null
          phone?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      promotion_types: {
        Row: {
          created_at: string
          currency: string
          display_order: number
          duration_days: number
          id: string
          is_active: boolean
          max_ads: number
          name: string
          placement: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          display_order?: number
          duration_days?: number
          id?: string
          is_active?: boolean
          max_ads?: number
          name: string
          placement?: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          display_order?: number
          duration_days?: number
          id?: string
          is_active?: boolean
          max_ads?: number
          name?: string
          placement?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      property_listings: {
        Row: {
          agency_fee: string | null
          amenities: string[] | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          floor_number: number | null
          furnishing_type: string | null
          id: string
          is_furnished: boolean | null
          listing_type: string
          nearby_facilities: string[] | null
          parking_spaces: number | null
          plot_size_sqm: number | null
          property_type: string
          service_charge: number | null
          size_sqm: number | null
          total_floors: number | null
          year_built: number | null
        }
        Insert: {
          agency_fee?: string | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          floor_number?: number | null
          furnishing_type?: string | null
          id: string
          is_furnished?: boolean | null
          listing_type: string
          nearby_facilities?: string[] | null
          parking_spaces?: number | null
          plot_size_sqm?: number | null
          property_type: string
          service_charge?: number | null
          size_sqm?: number | null
          total_floors?: number | null
          year_built?: number | null
        }
        Update: {
          agency_fee?: string | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          floor_number?: number | null
          furnishing_type?: string | null
          id?: string
          is_furnished?: boolean | null
          listing_type?: string
          nearby_facilities?: string[] | null
          parking_spaces?: number | null
          plot_size_sqm?: number | null
          property_type?: string
          service_charge?: number | null
          size_sqm?: number | null
          total_floors?: number | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          report_type: string
          reported_listing_id: string | null
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          report_type: string
          reported_listing_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          report_type?: string
          reported_listing_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_listing_id_fkey"
            columns: ["reported_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      seller_addons: {
        Row: {
          addon_id: string
          created_at: string
          expires_at: string | null
          id: string
          mpesa_receipt: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          quantity_purchased: number
          quantity_used: number
          status: Database["public"]["Enums"]["subscription_status"]
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          addon_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          mpesa_receipt?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quantity_purchased?: number
          quantity_used?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          addon_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          mpesa_receipt?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quantity_purchased?: number
          quantity_used?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_addons_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "addon_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_subscriptions: {
        Row: {
          ads_used: number
          created_at: string
          expires_at: string | null
          id: string
          mpesa_receipt: string | null
          package_id: string
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          starts_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ads_used?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          mpesa_receipt?: string | null
          package_id: string
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ads_used?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          mpesa_receipt?: string | null
          package_id?: string
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_verifications: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          id_back_url: string | null
          id_front_url: string | null
          passport_photo_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          passport_photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          passport_photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_listings: {
        Row: {
          availability: string | null
          certifications: string[] | null
          created_at: string | null
          experience_years: number | null
          id: string
          is_certified: boolean | null
          languages: string[] | null
          pricing_model: string | null
          service_area: string[] | null
          service_type: string
        }
        Insert: {
          availability?: string | null
          certifications?: string[] | null
          created_at?: string | null
          experience_years?: number | null
          id: string
          is_certified?: boolean | null
          languages?: string[] | null
          pricing_model?: string | null
          service_area?: string[] | null
          service_type: string
        }
        Update: {
          availability?: string | null
          certifications?: string[] | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_certified?: boolean | null
          languages?: string[] | null
          pricing_model?: string | null
          service_area?: string[] | null
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          main_category_id: string
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          main_category_id: string
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          main_category_id?: string
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_categories_main_category_id_fkey"
            columns: ["main_category_id"]
            isOneToOne: false
            referencedRelation: "main_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_packages: {
        Row: {
          allowed_categories: string[] | null
          analytics_access: boolean
          bg_color: string | null
          button_color: string | null
          button_text_color: string | null
          created_at: string
          currency: string
          description: string | null
          display_order: number
          duration_days: number
          id: string
          is_active: boolean
          is_popular: boolean
          max_ads: number
          name: string
          price: number
          text_color: string | null
          unlimited_postings: boolean
          updated_at: string
        }
        Insert: {
          allowed_categories?: string[] | null
          analytics_access?: boolean
          bg_color?: string | null
          button_color?: string | null
          button_text_color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          duration_days?: number
          id?: string
          is_active?: boolean
          is_popular?: boolean
          max_ads?: number
          name: string
          price?: number
          text_color?: string | null
          unlimited_postings?: boolean
          updated_at?: string
        }
        Update: {
          allowed_categories?: string[] | null
          analytics_access?: boolean
          bg_color?: string | null
          button_color?: string | null
          button_text_color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          duration_days?: number
          id?: string
          is_active?: boolean
          is_popular?: boolean
          max_ads?: number
          name?: string
          price?: number
          text_color?: string | null
          unlimited_postings?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachments: string[] | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at: string | null
          created_at: string
          description: string
          id: string
          listing_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: string[] | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description: string
          id?: string
          listing_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: string[] | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          listing_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          added_by: string | null
          created_at: string
          designation: string
          id: string
          is_active: boolean
          permissions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          designation?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          designation?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_responses: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string
          id: string
          is_admin_response: boolean | null
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string
          id?: string
          is_admin_response?: boolean | null
          ticket_id: string
          user_id: string
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string
          id?: string
          is_admin_response?: boolean | null
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
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
      user_suspensions: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          is_active: boolean | null
          is_permanent: boolean | null
          lifted_at: string | null
          lifted_by: string | null
          reason: string
          suspended_until: string | null
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_permanent?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason: string
          suspended_until?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_permanent?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string
          suspended_until?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_warnings: {
        Row: {
          admin_id: string
          created_at: string
          expires_at: string | null
          id: string
          reason: string
          severity: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reason: string
          severity: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicle_listings: {
        Row: {
          body_type: string | null
          condition: string | null
          created_at: string | null
          cylinders: number | null
          doors: number | null
          drivetrain: string | null
          engine_size_cc: number | null
          exchange_possible: boolean | null
          exterior_color: string | null
          fuel_type: string | null
          horsepower: number | null
          id: string
          interior_color: string | null
          is_registered: boolean | null
          key_features: string[] | null
          make_id: string | null
          mileage: number | null
          model_id: string | null
          registration_number: string | null
          registration_year: number | null
          seats: number | null
          transmission: string | null
          trim: string | null
          vehicle_type: string
          vin_chassis: string | null
          year_of_manufacture: number | null
        }
        Insert: {
          body_type?: string | null
          condition?: string | null
          created_at?: string | null
          cylinders?: number | null
          doors?: number | null
          drivetrain?: string | null
          engine_size_cc?: number | null
          exchange_possible?: boolean | null
          exterior_color?: string | null
          fuel_type?: string | null
          horsepower?: number | null
          id: string
          interior_color?: string | null
          is_registered?: boolean | null
          key_features?: string[] | null
          make_id?: string | null
          mileage?: number | null
          model_id?: string | null
          registration_number?: string | null
          registration_year?: number | null
          seats?: number | null
          transmission?: string | null
          trim?: string | null
          vehicle_type: string
          vin_chassis?: string | null
          year_of_manufacture?: number | null
        }
        Update: {
          body_type?: string | null
          condition?: string | null
          created_at?: string | null
          cylinders?: number | null
          doors?: number | null
          drivetrain?: string | null
          engine_size_cc?: number | null
          exchange_possible?: boolean | null
          exterior_color?: string | null
          fuel_type?: string | null
          horsepower?: number | null
          id?: string
          interior_color?: string | null
          is_registered?: boolean | null
          key_features?: string[] | null
          make_id?: string | null
          mileage?: number | null
          model_id?: string | null
          registration_number?: string | null
          registration_year?: number | null
          seats?: number | null
          transmission?: string | null
          trim?: string | null
          vehicle_type?: string
          vin_chassis?: string | null
          year_of_manufacture?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_listings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "base_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_listings_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "vehicle_makes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_listings_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_makes: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          make_id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          make_id: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          make_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_models_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "vehicle_makes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_bump_credits: {
        Args: { p_credits: number; p_package_id?: string; p_user_id: string }
        Returns: undefined
      }
      admin_set_account_type: {
        Args: { new_account_type: string; target_user_id: string }
        Returns: undefined
      }
      bump_listing: {
        Args: { p_listing_id: string; p_user_id: string }
        Returns: boolean
      }
      get_user_emails: {
        Args: never
        Returns: {
          email: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_ads_used: { Args: { p_user_id: string }; Returns: undefined }
      increment_listing_views: {
        Args: { p_listing_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      addon_type: "bumping" | "featured" | "promotion"
      app_role: "admin" | "moderator" | "user"
      listing_category:
        | "vehicles"
        | "property"
        | "phones"
        | "fashion"
        | "services"
        | "jobs"
        | "furniture"
        | "pets"
        | "kids"
        | "sports"
        | "electronics"
        | "health"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      subscription_status: "active" | "cancelled" | "expired" | "pending"
      ticket_category:
        | "account"
        | "listing"
        | "payment"
        | "technical"
        | "report"
        | "other"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "pending" | "resolved" | "closed"
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
      addon_type: ["bumping", "featured", "promotion"],
      app_role: ["admin", "moderator", "user"],
      listing_category: [
        "vehicles",
        "property",
        "phones",
        "fashion",
        "services",
        "jobs",
        "furniture",
        "pets",
        "kids",
        "sports",
        "electronics",
        "health",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      subscription_status: ["active", "cancelled", "expired", "pending"],
      ticket_category: [
        "account",
        "listing",
        "payment",
        "technical",
        "report",
        "other",
      ],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "pending", "resolved", "closed"],
    },
  },
} as const
