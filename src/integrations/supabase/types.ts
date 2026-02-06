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
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
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
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          listing_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          listing_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          listing_id?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
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
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
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
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
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
          updated_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
    },
  },
} as const
