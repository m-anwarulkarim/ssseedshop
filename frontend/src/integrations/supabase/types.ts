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
      admin_otps: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone?: string
          verified?: boolean
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          created_at: string
          id: string
          permissions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_active: boolean
          last_active_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_active_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_active_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          category: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          product_id: string | null
          product_name: string | null
          visitor_id: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          product_id?: string | null
          product_name?: string | null
          visitor_id?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          product_id?: string | null
          product_name?: string | null
          visitor_id?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      blocked_devices: {
        Row: {
          block_type: string
          block_value: string
          blocked_at: string
          blocked_by: string | null
          id: string
          reason: string | null
        }
        Insert: {
          block_type: string
          block_value: string
          blocked_at?: string
          blocked_by?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          block_type?: string
          block_value?: string
          blocked_at?: string
          blocked_by?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          category: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          position: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          position?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          position?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_name: string | null
          id: string
          image: string | null
          name: string
          position: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          image?: string | null
          name: string
          position?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          image?: string | null
          name?: string
          position?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_order_amount: number
          starts_at: string
          total_discount_given: number
          updated_at: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number
          starts_at?: string
          total_discount_given?: number
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number
          starts_at?: string
          total_discount_given?: number
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_development_costs: {
        Row: {
          amount: number
          cost_date: string
          created_at: string
          id: string
          note: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          cost_date: string
          created_at?: string
          id?: string
          note?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cost_date?: string
          created_at?: string
          id?: string
          note?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          expense_date: string
          has_receipt: boolean | null
          id: string
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          vendor: string | null
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date: string
          has_receipt?: boolean | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          has_receipt?: boolean | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      fraud_data: {
        Row: {
          created_at: string
          fraudchecker_data: Json | null
          id: string
          phone: string
          steadfast_data: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fraudchecker_data?: Json | null
          id?: string
          phone: string
          steadfast_data?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fraudchecker_data?: Json | null
          id?: string
          phone?: string
          steadfast_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      import_progress: {
        Row: {
          batch_size: number
          created_at: string
          current_invoice: number
          error_log: Json | null
          id: string
          last_error_message: string | null
          last_run_at: string | null
          locked_at: string | null
          log_lines: string[]
          max_invoice: number
          source: string
          started_at: string | null
          status: string
          total_errors: number
          total_imported: number
          total_skipped: number
          updated_at: string
        }
        Insert: {
          batch_size?: number
          created_at?: string
          current_invoice?: number
          error_log?: Json | null
          id?: string
          last_error_message?: string | null
          last_run_at?: string | null
          locked_at?: string | null
          log_lines?: string[]
          max_invoice?: number
          source?: string
          started_at?: string | null
          status?: string
          total_errors?: number
          total_imported?: number
          total_skipped?: number
          updated_at?: string
        }
        Update: {
          batch_size?: number
          created_at?: string
          current_invoice?: number
          error_log?: Json | null
          id?: string
          last_error_message?: string | null
          last_run_at?: string | null
          locked_at?: string | null
          log_lines?: string[]
          max_invoice?: number
          source?: string
          started_at?: string | null
          status?: string
          total_errors?: number
          total_imported?: number
          total_skipped?: number
          updated_at?: string
        }
        Relationships: []
      }
      income_entries: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          income_date: string
          notes: string | null
          payment_method: string | null
          source: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          income_date: string
          notes?: string | null
          payment_method?: string | null
          source: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          income_date?: string
          notes?: string | null
          payment_method?: string | null
          source?: string
        }
        Relationships: []
      }
      incomplete_orders: {
        Row: {
          address: string | null
          attempt_count: number
          cart_snapshot: Json | null
          created_at: string
          customer_name: string | null
          id: string
          phone: string
          reason: string
          updated_at: string
          visitor_id: string | null
        }
        Insert: {
          address?: string | null
          attempt_count?: number
          cart_snapshot?: Json | null
          created_at?: string
          customer_name?: string | null
          id?: string
          phone: string
          reason: string
          updated_at?: string
          visitor_id?: string | null
        }
        Update: {
          address?: string | null
          attempt_count?: number
          cart_snapshot?: Json | null
          created_at?: string
          customer_name?: string | null
          id?: string
          phone?: string
          reason?: string
          updated_at?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          added_by: string | null
          amount: number
          category: string
          created_at: string
          deleted_at: string | null
          description: string | null
          entry_date: string
          id: string
          payment_method: string | null
          source: string
          type: string
          vendor: string | null
        }
        Insert: {
          added_by?: string | null
          amount: number
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          payment_method?: string | null
          source?: string
          type: string
          vendor?: string | null
        }
        Update: {
          added_by?: string | null
          amount?: number
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          payment_method?: string | null
          source?: string
          type?: string
          vendor?: string | null
        }
        Relationships: []
      }
      ledger_meta: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string
          id: string
          ip_or_email: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          ip_or_email: string
        }
        Update: {
          attempted_at?: string
          id?: string
          ip_or_email?: string
        }
        Relationships: []
      }
      monthly_cost_otps: {
        Row: {
          created_at: string
          id: string
          month: number
          otp_code: string
          requested_by_name: string | null
          used_at: string | null
          used_by_name: string | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: number
          otp_code: string
          requested_by_name?: string | null
          used_at?: string | null
          used_by_name?: string | null
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: number
          otp_code?: string
          requested_by_name?: string | null
          used_at?: string | null
          used_by_name?: string | null
          year?: number
        }
        Relationships: []
      }
      monthly_operating_costs: {
        Row: {
          created_at: string
          id: string
          is_paid: boolean
          last_reminder_sent_at: string | null
          month: number
          note: string | null
          paid_at: string | null
          paid_by: string | null
          paid_by_name: string | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_paid?: boolean
          last_reminder_sent_at?: string | null
          month: number
          note?: string | null
          paid_at?: string | null
          paid_by?: string | null
          paid_by_name?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          is_paid?: boolean
          last_reminder_sent_at?: string | null
          month?: number
          note?: string | null
          paid_at?: string | null
          paid_by?: string | null
          paid_by_name?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      order_edit_locks: {
        Row: {
          heartbeat_at: string
          id: string
          locked_at: string
          order_id: string
          user_email: string | null
          user_id: string
          user_name: string | null
          user_photo: string | null
        }
        Insert: {
          heartbeat_at?: string
          id?: string
          locked_at?: string
          order_id: string
          user_email?: string | null
          user_id: string
          user_name?: string | null
          user_photo?: string | null
        }
        Update: {
          heartbeat_at?: string
          id?: string
          locked_at?: string
          order_id?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
          user_photo?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          delivered_qty: number | null
          id: string
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          returned_qty: number | null
          unit_price: number
          variation_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_qty?: number | null
          id?: string
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          quantity?: number
          returned_qty?: number | null
          unit_price: number
          variation_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_qty?: number | null
          id?: string
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          returned_qty?: number | null
          unit_price?: number
          variation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "product_variations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "product_variations_public"
            referencedColumns: ["id"]
          },
        ]
      }
      order_notifications: {
        Row: {
          action: string
          admin_email: string | null
          created_at: string
          customer_name: string | null
          id: string
          order_id: string | null
          order_number: string
          phone: string | null
        }
        Insert: {
          action: string
          admin_email?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          order_id?: string | null
          order_number: string
          phone?: string | null
        }
        Update: {
          action?: string
          admin_email?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          order_id?: string | null
          order_number?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_by_name: string | null
          id: string
          order_id: string
          status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string | null
          id?: string
          order_id: string
          status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string | null
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          advance: number
          alt_phone: string | null
          consignment_id: string | null
          courier_delivery_type: number | null
          courier_note: string | null
          courier_remarks: string | null
          courier_total_lot: number | null
          created_at: string
          created_by_admin_id: string | null
          customer_name: string
          delivery_area: string | null
          delivery_charge: number | null
          delivery_status: string | null
          discount: number
          district: string | null
          id: string
          is_courier_entered: boolean
          is_deleted: boolean
          is_printed: boolean
          last_status_changed_by: string | null
          note: string | null
          order_id: string
          phone: string
          pre_date: string | null
          print_note: boolean
          status: string
          thana: string | null
          total_amount: number
          tracking_code: string | null
          traffic_source: string | null
          updated_at: string
          visitor_id: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          address: string
          advance?: number
          alt_phone?: string | null
          consignment_id?: string | null
          courier_delivery_type?: number | null
          courier_note?: string | null
          courier_remarks?: string | null
          courier_total_lot?: number | null
          created_at?: string
          created_by_admin_id?: string | null
          customer_name: string
          delivery_area?: string | null
          delivery_charge?: number | null
          delivery_status?: string | null
          discount?: number
          district?: string | null
          id?: string
          is_courier_entered?: boolean
          is_deleted?: boolean
          is_printed?: boolean
          last_status_changed_by?: string | null
          note?: string | null
          order_id?: string
          phone: string
          pre_date?: string | null
          print_note?: boolean
          status?: string
          thana?: string | null
          total_amount?: number
          tracking_code?: string | null
          traffic_source?: string | null
          updated_at?: string
          visitor_id?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          address?: string
          advance?: number
          alt_phone?: string | null
          consignment_id?: string | null
          courier_delivery_type?: number | null
          courier_note?: string | null
          courier_remarks?: string | null
          courier_total_lot?: number | null
          created_at?: string
          created_by_admin_id?: string | null
          customer_name?: string
          delivery_area?: string | null
          delivery_charge?: number | null
          delivery_status?: string | null
          discount?: number
          district?: string | null
          id?: string
          is_courier_entered?: boolean
          is_deleted?: boolean
          is_printed?: boolean
          last_status_changed_by?: string | null
          note?: string | null
          order_id?: string
          phone?: string
          pre_date?: string | null
          print_note?: boolean
          status?: string
          thana?: string | null
          total_amount?: number
          tracking_code?: string | null
          traffic_source?: string | null
          updated_at?: string
          visitor_id?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      product_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_approved: boolean
          name: string
          product_id: string
          rating: number | null
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_approved?: boolean
          name: string
          product_id: string
          rating?: number | null
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          name?: string
          product_id?: string
          rating?: number | null
        }
        Relationships: []
      }
      product_variations: {
        Row: {
          buying_price: number | null
          created_at: string
          id: string
          image: string | null
          name: string
          note: string | null
          offer_price: number | null
          position: number
          product_id: string
          reserved_stock: number
          selling_price: number
          stock: number
        }
        Insert: {
          buying_price?: number | null
          created_at?: string
          id?: string
          image?: string | null
          name: string
          note?: string | null
          offer_price?: number | null
          position?: number
          product_id: string
          reserved_stock?: number
          selling_price?: number
          stock?: number
        }
        Update: {
          buying_price?: number | null
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          note?: string | null
          offer_price?: number | null
          position?: number
          product_id?: string
          reserved_stock?: number
          selling_price?: number
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          buying_price: number | null
          cash_back: number
          categories: string[]
          category: string | null
          created_at: string
          full_description: string | null
          id: string
          image_gallery: string[] | null
          incoming_stock: number
          is_hidden: boolean
          name: string
          nursery_price: number | null
          offer_price: number | null
          paikari_maximum: number | null
          paikari_minimum: number | null
          position: number
          product_image: string | null
          regular_price: number
          reserved_stock: number
          short_description: string | null
          sku: string
          slug: string | null
          stock: number
          subcategory: string | null
          tag: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          buying_price?: number | null
          cash_back?: number
          categories?: string[]
          category?: string | null
          created_at?: string
          full_description?: string | null
          id?: string
          image_gallery?: string[] | null
          incoming_stock?: number
          is_hidden?: boolean
          name: string
          nursery_price?: number | null
          offer_price?: number | null
          paikari_maximum?: number | null
          paikari_minimum?: number | null
          position?: number
          product_image?: string | null
          regular_price?: number
          reserved_stock?: number
          short_description?: string | null
          sku: string
          slug?: string | null
          stock?: number
          subcategory?: string | null
          tag?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          buying_price?: number | null
          cash_back?: number
          categories?: string[]
          category?: string | null
          created_at?: string
          full_description?: string | null
          id?: string
          image_gallery?: string[] | null
          incoming_stock?: number
          is_hidden?: boolean
          name?: string
          nursery_price?: number | null
          offer_price?: number | null
          paikari_maximum?: number | null
          paikari_minimum?: number | null
          position?: number
          product_image?: string | null
          regular_price?: number
          reserved_stock?: number
          short_description?: string | null
          sku?: string
          slug?: string | null
          stock?: number
          subcategory?: string | null
          tag?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      promo_popups: {
        Row: {
          badge_text: string | null
          button_text: string
          buy_product_id: string | null
          created_at: string
          delay_seconds: number
          end_at: string | null
          free_note: string | null
          free_product_id: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string
          show_once: boolean
          sort_order: number
          start_at: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          button_text?: string
          buy_product_id?: string | null
          created_at?: string
          delay_seconds?: number
          end_at?: string | null
          free_note?: string | null
          free_product_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string
          show_once?: boolean
          sort_order?: number
          start_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          button_text?: string
          buy_product_id?: string | null
          created_at?: string
          delay_seconds?: number
          end_at?: string | null
          free_note?: string | null
          free_product_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string
          show_once?: boolean
          sort_order?: number
          start_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_popups_buy_product_id_fkey"
            columns: ["buy_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_popups_buy_product_id_fkey"
            columns: ["buy_product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_popups_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_popups_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          phone: string
          reason: string | null
          result: Json | null
          sent_by_admin: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          phone: string
          reason?: string | null
          result?: Json | null
          sent_by_admin?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          phone?: string
          reason?: string | null
          result?: Json | null
          sent_by_admin?: string | null
          status?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_name: string
          created_at: string
          id: string
          name: string
          position: number
        }
        Insert: {
          category_name: string
          created_at?: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          category_name?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      support_reports: {
        Row: {
          admin_notes: Json
          admin_response: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          description: string
          id: string
          order_id: string | null
          order_number: string | null
          priority: string
          report_type: string
          responded_at: string | null
          responded_by: string | null
          status: string
          subject: string | null
          updated_at: string
          visitor_profile_id: string | null
        }
        Insert: {
          admin_notes?: Json
          admin_response?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          description: string
          id?: string
          order_id?: string | null
          order_number?: string | null
          priority?: string
          report_type?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          visitor_profile_id?: string | null
        }
        Update: {
          admin_notes?: Json
          admin_response?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          description?: string
          id?: string
          order_id?: string | null
          order_number?: string | null
          priority?: string
          report_type?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_reports_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_reports_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_reports_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      url_redirects: {
        Row: {
          created_at: string
          from_path: string
          id: string
          is_active: boolean
          to_path: string
        }
        Insert: {
          created_at?: string
          from_path: string
          id?: string
          is_active?: boolean
          to_path: string
        }
        Update: {
          created_at?: string
          from_path?: string
          id?: string
          is_active?: boolean
          to_path?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_profiles: {
        Row: {
          address: string | null
          age: number | null
          alt_phone: string | null
          bio: string | null
          cover_photo: string | null
          created_at: string
          district: string | null
          gender: string | null
          id: string
          last_active_at: string | null
          name: string | null
          password_hash: string | null
          phone: string
          phone_verified: boolean
          profile_picture: string | null
          referral_code: string | null
          thana: string | null
          updated_at: string
          user_type: string | null
          username: string | null
          visitor_id: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          alt_phone?: string | null
          bio?: string | null
          cover_photo?: string | null
          created_at?: string
          district?: string | null
          gender?: string | null
          id?: string
          last_active_at?: string | null
          name?: string | null
          password_hash?: string | null
          phone: string
          phone_verified?: boolean
          profile_picture?: string | null
          referral_code?: string | null
          thana?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          visitor_id: string
        }
        Update: {
          address?: string | null
          age?: number | null
          alt_phone?: string | null
          bio?: string | null
          cover_photo?: string | null
          created_at?: string
          district?: string | null
          gender?: string | null
          id?: string
          last_active_at?: string | null
          name?: string | null
          password_hash?: string | null
          phone?: string
          phone_verified?: boolean
          profile_picture?: string | null
          referral_code?: string | null
          thana?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_profiles_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      visitors: {
        Row: {
          access_allowed: boolean
          admin_notes: string | null
          avg_page_load_ms: number | null
          created_at: string
          fingerprint: string
          first_visit_at: string
          id: string
          ip_addresses: string[] | null
          referrer_url: string | null
          total_active_time_seconds: number
          total_visit_count: number
          traffic_source: string | null
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          access_allowed?: boolean
          admin_notes?: string | null
          avg_page_load_ms?: number | null
          created_at?: string
          fingerprint: string
          first_visit_at?: string
          id?: string
          ip_addresses?: string[] | null
          referrer_url?: string | null
          total_active_time_seconds?: number
          total_visit_count?: number
          traffic_source?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          access_allowed?: boolean
          admin_notes?: string | null
          avg_page_load_ms?: number | null
          created_at?: string
          fingerprint?: string
          first_visit_at?: string
          id?: string
          ip_addresses?: string[] | null
          referrer_url?: string | null
          total_active_time_seconds?: number
          total_visit_count?: number
          traffic_source?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      product_variations_public: {
        Row: {
          available_stock: number | null
          id: string | null
          image: string | null
          in_stock: boolean | null
          name: string | null
          note: string | null
          offer_price: number | null
          position: number | null
          product_id: string | null
          selling_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      products_public: {
        Row: {
          available_stock: number | null
          cash_back: number | null
          categories: string[] | null
          category: string | null
          created_at: string | null
          full_description: string | null
          id: string | null
          image_gallery: string[] | null
          in_stock: boolean | null
          is_hidden: boolean | null
          name: string | null
          nursery_price: number | null
          offer_price: number | null
          paikari_maximum: number | null
          paikari_minimum: number | null
          position: number | null
          product_image: string | null
          regular_price: number | null
          short_description: string | null
          sku: string | null
          slug: string | null
          subcategory: string | null
          tag: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Relationships: []
      }
      visitor_profiles_safe: {
        Row: {
          address: string | null
          age: number | null
          alt_phone: string | null
          bio: string | null
          cover_photo: string | null
          created_at: string | null
          district: string | null
          gender: string | null
          id: string | null
          last_active_at: string | null
          name: string | null
          phone: string | null
          phone_verified: boolean | null
          profile_picture: string | null
          referral_code: string | null
          thana: string | null
          updated_at: string | null
          user_type: string | null
          username: string | null
          visitor_id: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          alt_phone?: string | null
          bio?: string | null
          cover_photo?: string | null
          created_at?: string | null
          district?: string | null
          gender?: string | null
          id?: string | null
          last_active_at?: string | null
          name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          profile_picture?: string | null
          referral_code?: string | null
          thana?: string | null
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
          visitor_id?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          alt_phone?: string | null
          bio?: string | null
          cover_photo?: string | null
          created_at?: string | null
          district?: string | null
          gender?: string | null
          id?: string | null
          last_active_at?: string | null
          name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          profile_picture?: string | null
          referral_code?: string | null
          thana?: string | null
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_profiles_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      append_import_progress_log: {
        Args: { p_job_id: string; p_limit?: number; p_message: string }
        Returns: undefined
      }
      apply_partial_delivery: {
        Args: { p_items: Json; p_order_id: string }
        Returns: undefined
      }
      can_review_product: {
        Args: { p_phone: string; p_product_id: string }
        Returns: boolean
      }
      claim_import_progress_job: {
        Args: { p_source: string; p_stale_after_seconds?: number }
        Returns: {
          batch_size: number
          created_at: string
          current_invoice: number
          error_log: Json | null
          id: string
          last_error_message: string | null
          last_run_at: string | null
          locked_at: string | null
          log_lines: string[]
          max_invoice: number
          source: string
          started_at: string | null
          status: string
          total_errors: number
          total_imported: number
          total_skipped: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "import_progress"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cleanup_old_notifications: { Args: never; Returns: undefined }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      fuzzy_search_products: {
        Args: {
          max_results?: number
          search_query: string
          similarity_threshold?: number
        }
        Returns: {
          cash_back: number
          category: string
          full_description: string
          id: string
          name: string
          nursery_price: number
          offer_price: number
          paikari_maximum: number
          product_image: string
          regular_price: number
          reserved_stock: number
          short_description: string
          similarity_score: number
          sku: string
          stock: number
          tag: string
        }[]
      }
      get_confirmed_order_status_counts: {
        Args: { p_date_from?: string; p_search?: string; p_statuses: string[] }
        Returns: {
          cnt: number
          status: string
        }[]
      }
      get_low_stock_products: {
        Args: never
        Returns: {
          available_stock: number
          current_stock: number
          incoming_stock: number
          last_30d_sold: number
          product_id: string
          product_image: string
          product_name: string
          product_sku: string
          reserved_stock: number
        }[]
      }
      get_monthly_operating_costs: {
        Args: { p_months?: number }
        Returns: {
          fraud_fee: number
          hosting_fee: number
          is_paid: boolean
          month: number
          new_orders: number
          paid_at: string
          paid_by_name: string
          sms_count: number
          sms_fee: number
          total_cost: number
          year: number
        }[]
      }
      get_order_status_counts: {
        Args: { p_date_from?: string; p_search?: string; p_statuses: string[] }
        Returns: {
          cnt: number
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coupon_usage: {
        Args: { p_coupon_id: string; p_discount_amount: number }
        Returns: undefined
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      place_landing_cosmos_order: {
        Args: {
          p_address: string
          p_customer_name: string
          p_delivery_charge?: number
          p_discount?: number
          p_note?: string
          p_phone: string
          p_product_id: string
          p_product_image: string
          p_product_name: string
          p_quantity: number
          p_total_amount?: number
          p_traffic_source?: string
          p_unit_price: number
          p_visitor_id?: string
        }
        Returns: {
          id: string
          order_id: string
        }[]
      }
      place_order: {
        Args: {
          p_address: string
          p_alt_phone?: string
          p_customer_name: string
          p_delivery_charge?: number
          p_discount?: number
          p_note?: string
          p_phone: string
          p_total_amount?: number
          p_traffic_source?: string
          p_visitor_id?: string
          p_visitor_profile_id?: string
        }
        Returns: {
          id: string
          order_id: string
        }[]
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      release_import_progress_job: {
        Args: {
          p_job_id: string
          p_last_error_message?: string
          p_status?: string
        }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      trigger_woocommerce_orders_import: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
