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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      _migrations: {
        Row: {
          applied_at: string
          filename: string
          id: number
        }
        Insert: {
          applied_at?: string
          filename: string
          id?: number
        }
        Update: {
          applied_at?: string
          filename?: string
          id?: number
        }
        Relationships: []
      }
      admin_device_visibility: {
        Row: {
          created_at: string
          created_by: string
          device_code: string
          hidden_for_admin: boolean
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          device_code: string
          hidden_for_admin?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          device_code?: string
          hidden_for_admin?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_settings: {
        Row: {
          created_at: string | null
          device_code: string
          display_name: string | null
          graph_color: string
          id: string
          is_active: boolean
          location: string | null
          report_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_code: string
          display_name?: string | null
          graph_color?: string
          id?: string
          is_active?: boolean
          location?: string | null
          report_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_code?: string
          display_name?: string | null
          graph_color?: string
          id?: string
          is_active?: boolean
          location?: string | null
          report_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      firebase_fcm_tokens: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          is_active: boolean | null
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      firebase_notification_logs: {
        Row: {
          body: string
          error_message: string | null
          id: string
          result: Json | null
          sent_at: string | null
          status: string
          target: string
          target_type: string
          title: string
        }
        Insert: {
          body: string
          error_message?: string | null
          id?: string
          result?: Json | null
          sent_at?: string | null
          status: string
          target: string
          target_type: string
          title: string
        }
        Update: {
          body?: string
          error_message?: string | null
          id?: string
          result?: Json | null
          sent_at?: string | null
          status?: string
          target?: string
          target_type?: string
          title?: string
        }
        Relationships: []
      }
      firebase_topic_subscriptions: {
        Row: {
          id: string
          is_subscribed: boolean | null
          subscribed_at: string | null
          token: string
          topic: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          is_subscribed?: boolean | null
          subscribed_at?: string | null
          token: string
          topic: string
          unsubscribed_at?: string | null
        }
        Update: {
          id?: string
          is_subscribed?: boolean | null
          subscribed_at?: string | null
          token?: string
          topic?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      guest_device_access: {
        Row: {
          created_at: string
          device_code: string
          enabled: boolean
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_code: string
          enabled?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_code?: string
          enabled?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      guest_devices_cache: {
        Row: {
          cached_at: string | null
          device_code: string
          display_name: string | null
          expires_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          cached_at?: string | null
          device_code: string
          display_name?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          cached_at?: string | null
          device_code?: string
          display_name?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      moisture_meter_readings: {
        Row: {
          device_code: string | null
          event: string | null
          id: string
          moisture_machine: number | null
          moisture_model: number | null
          reading_time: string | null
          temperature: number | null
        }
        Insert: {
          device_code?: string | null
          event?: string | null
          id?: string
          moisture_machine?: number | null
          moisture_model?: number | null
          reading_time?: string | null
          temperature?: number | null
        }
        Update: {
          device_code?: string | null
          event?: string | null
          id?: string
          moisture_machine?: number | null
          moisture_model?: number | null
          reading_time?: string | null
          temperature?: number | null
        }
        Relationships: []
      }
      moisture_meter_settings: {
        Row: {
          created_at: string | null
          device_code: string
          display_name: string | null
          id: string
          is_active: boolean | null
          location: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_code: string
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_code?: string
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      moisture_notification_settings: {
        Row: {
          created_at: string
          device_code: string
          enabled: boolean | null
          id: string
          moisture_enabled: boolean | null
          moisture_max_enabled: boolean | null
          moisture_max_threshold: number | null
          moisture_min_enabled: boolean | null
          moisture_min_threshold: number | null
          temperature_enabled: boolean | null
          temperature_max_enabled: boolean | null
          temperature_max_threshold: number | null
          temperature_min_enabled: boolean | null
          temperature_min_threshold: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_code: string
          enabled?: boolean | null
          id?: string
          moisture_enabled?: boolean | null
          moisture_max_enabled?: boolean | null
          moisture_max_threshold?: number | null
          moisture_min_enabled?: boolean | null
          moisture_min_threshold?: number | null
          temperature_enabled?: boolean | null
          temperature_max_enabled?: boolean | null
          temperature_max_threshold?: number | null
          temperature_min_enabled?: boolean | null
          temperature_min_threshold?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_code?: string
          enabled?: boolean | null
          id?: string
          moisture_enabled?: boolean | null
          moisture_max_enabled?: boolean | null
          moisture_max_threshold?: number | null
          moisture_min_enabled?: boolean | null
          moisture_min_threshold?: number | null
          temperature_enabled?: boolean | null
          temperature_max_enabled?: boolean | null
          temperature_max_threshold?: number | null
          temperature_min_enabled?: boolean | null
          temperature_min_threshold?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moisture_notifications: {
        Row: {
          created_at: string | null
          device_code: string
          id: string
          notification_count: number
          notification_message: string | null
          read: boolean | null
          reading_id: string | null
          settings_snapshot: Json | null
          threshold_type: string
          timestamp: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          device_code: string
          id?: string
          notification_count?: number
          notification_message?: string | null
          read?: boolean | null
          reading_id?: string | null
          settings_snapshot?: Json | null
          threshold_type: string
          timestamp?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          device_code?: string
          id?: string
          notification_count?: number
          notification_message?: string | null
          read?: boolean | null
          reading_id?: string | null
          settings_snapshot?: Json | null
          threshold_type?: string
          timestamp?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "moisture_notifications_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "moisture_meter_readings"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          publish_date: string
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          publish_date: string
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          publish_date?: string
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_delivery_log: {
        Row: {
          created_at: string
          device_code: string
          id: string
          rice_quality_id: number
          rice_type_id: string
          trigger_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_code: string
          id?: string
          rice_quality_id: number
          rice_type_id: string
          trigger_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_code?: string
          id?: string
          rice_quality_id?: number
          rice_type_id?: string
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          device_code: string
          enabled: boolean | null
          id: string
          max_enabled: boolean | null
          max_threshold: number | null
          min_enabled: boolean | null
          min_threshold: number | null
          rice_type_id: string
          rice_type_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_code: string
          enabled?: boolean | null
          id?: string
          max_enabled?: boolean | null
          max_threshold?: number | null
          min_enabled?: boolean | null
          min_threshold?: number | null
          rice_type_id: string
          rice_type_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_code?: string
          enabled?: boolean | null
          id?: string
          max_enabled?: boolean | null
          max_threshold?: number | null
          min_enabled?: boolean | null
          min_threshold?: number | null
          rice_type_id?: string
          rice_type_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_settings_history: {
        Row: {
          action_type: string
          created_at: string
          created_by: string
          device_code: string
          id: string
          new_settings: Json | null
          old_settings: Json | null
          rice_type_id: string
          rice_type_name: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          created_by?: string
          device_code: string
          id?: string
          new_settings?: Json | null
          old_settings?: Json | null
          rice_type_id: string
          rice_type_name: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          created_by?: string
          device_code?: string
          id?: string
          new_settings?: Json | null
          old_settings?: Json | null
          rice_type_id?: string
          rice_type_name?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          analysis_id: number | null
          created_at: string | null
          device_code: string
          id: string
          notification_count: number
          notification_message: string | null
          read: boolean | null
          rice_type_id: string
          settings_snapshot: Json | null
          threshold_type: string
          timestamp: string | null
          user_id: string
          value: number
        }
        Insert: {
          analysis_id?: number | null
          created_at?: string | null
          device_code: string
          id?: string
          notification_count?: number
          notification_message?: string | null
          read?: boolean | null
          rice_type_id: string
          settings_snapshot?: Json | null
          threshold_type: string
          timestamp?: string | null
          user_id: string
          value: number
        }
        Update: {
          analysis_id?: number | null
          created_at?: string | null
          device_code?: string
          id?: string
          notification_count?: number
          notification_message?: string | null
          read?: boolean | null
          rice_type_id?: string
          settings_snapshot?: Json | null
          threshold_type?: string
          timestamp?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "notifications_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "rice_quality_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_counters: {
        Row: {
          counter_name: string
          counter_value: number | null
          id: string
          updated_at: string | null
        }
        Insert: {
          counter_name: string
          counter_value?: number | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          counter_name?: string
          counter_value?: number | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rice_quality_analysis: {
        Row: {
          analyzed_at: string | null
          analyzed_at_ms: number | null
          black_kernel: number | null
          brown_rice_rate: number | null
          class1: number | null
          class2: number | null
          class3: number | null
          created_at: string | null
          cur_material: string | null
          cur_variety: number | null
          device_code: string | null
          head_rice: number | null
          heavy_chalkiness_rate: number
          honey_rice: number | null
          id: number
          imperfection_rate: number | null
          impurity_num: number | null
          light_honey_rice: number
          machine_unix_time: string | null
          machine_unix_time_minus_1h: string | null
          main_index: number | null
          main_rate: number | null
          mix_index: number | null
          mix_rate: number | null
          msg_id: number | null
          other_backline: number
          output: number | null
          paddy_rate: number | null
          parboiled_red_line: number | null
          parboiled_white_rice: number | null
          partly_black: number | null
          partly_black_peck: number | null
          process_precision: number | null
          red_line_rate: number | null
          sample_index: number | null
          sample_source: string | null
          short_grain: number | null
          slender_kernel: number | null
          small_brokens: number | null
          small_brokens_c1: number | null
          sprout_rate: number | null
          sticky_rice_rate: number | null
          surveyor: string | null
          thai_datetime: string | null
          topline_rate: number
          total_brokens: number | null
          unripe_rate: number | null
          whiteness: number | null
          whole_kernels: number | null
          yellow_rice_rate: number | null
        }
        Insert: {
          analyzed_at?: string | null
          analyzed_at_ms?: number | null
          black_kernel?: number | null
          brown_rice_rate?: number | null
          class1?: number | null
          class2?: number | null
          class3?: number | null
          created_at?: string | null
          cur_material?: string | null
          cur_variety?: number | null
          device_code?: string | null
          head_rice?: number | null
          heavy_chalkiness_rate?: number
          honey_rice?: number | null
          id?: number
          imperfection_rate?: number | null
          impurity_num?: number | null
          light_honey_rice?: number
          machine_unix_time?: string | null
          machine_unix_time_minus_1h?: string | null
          main_index?: number | null
          main_rate?: number | null
          mix_index?: number | null
          mix_rate?: number | null
          msg_id?: number | null
          other_backline?: number
          output?: number | null
          paddy_rate?: number | null
          parboiled_red_line?: number | null
          parboiled_white_rice?: number | null
          partly_black?: number | null
          partly_black_peck?: number | null
          process_precision?: number | null
          red_line_rate?: number | null
          sample_index?: number | null
          sample_source?: string | null
          short_grain?: number | null
          slender_kernel?: number | null
          small_brokens?: number | null
          small_brokens_c1?: number | null
          sprout_rate?: number | null
          sticky_rice_rate?: number | null
          surveyor?: string | null
          thai_datetime?: string | null
          topline_rate?: number
          total_brokens?: number | null
          unripe_rate?: number | null
          whiteness?: number | null
          whole_kernels?: number | null
          yellow_rice_rate?: number | null
        }
        Update: {
          analyzed_at?: string | null
          analyzed_at_ms?: number | null
          black_kernel?: number | null
          brown_rice_rate?: number | null
          class1?: number | null
          class2?: number | null
          class3?: number | null
          created_at?: string | null
          cur_material?: string | null
          cur_variety?: number | null
          device_code?: string | null
          head_rice?: number | null
          heavy_chalkiness_rate?: number
          honey_rice?: number | null
          id?: number
          imperfection_rate?: number | null
          impurity_num?: number | null
          light_honey_rice?: number
          machine_unix_time?: string | null
          machine_unix_time_minus_1h?: string | null
          main_index?: number | null
          main_rate?: number | null
          mix_index?: number | null
          mix_rate?: number | null
          msg_id?: number | null
          other_backline?: number
          output?: number | null
          paddy_rate?: number | null
          parboiled_red_line?: number | null
          parboiled_white_rice?: number | null
          partly_black?: number | null
          partly_black_peck?: number | null
          process_precision?: number | null
          red_line_rate?: number | null
          sample_index?: number | null
          sample_source?: string | null
          short_grain?: number | null
          slender_kernel?: number | null
          small_brokens?: number | null
          small_brokens_c1?: number | null
          sprout_rate?: number | null
          sticky_rice_rate?: number | null
          surveyor?: string | null
          thai_datetime?: string | null
          topline_rate?: number
          total_brokens?: number | null
          unripe_rate?: number | null
          whiteness?: number | null
          whole_kernels?: number | null
          yellow_rice_rate?: number | null
        }
        Relationships: []
      }
      rice_quality_analysis_addon01: {
        Row: {
          created_at: string
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      rice_quality_analysis_backup: {
        Row: {
          analyzed_at: string | null
          analyzed_at_ms: number | null
          backup_at: string | null
          black_kernel: number | null
          brown_rice_rate: number | null
          class1: number | null
          class2: number | null
          class3: number | null
          created_at: string | null
          cur_material: string | null
          cur_variety: number | null
          device_code: string | null
          head_rice: number | null
          heavy_chalkiness_rate: number | null
          honey_rice: number | null
          id: number | null
          imperfection_rate: number | null
          impurity_num: number | null
          light_honey_rice: number | null
          machine_unix_time: string | null
          main_index: number | null
          main_rate: number | null
          mix_index: number | null
          mix_rate: number | null
          msg_id: number | null
          other_backline: number | null
          output: number | null
          paddy_rate: number | null
          parboiled_red_line: number | null
          parboiled_white_rice: number | null
          partly_black: number | null
          partly_black_peck: number | null
          process_precision: number | null
          red_line_rate: number | null
          sample_index: number | null
          sample_source: string | null
          short_grain: number | null
          slender_kernel: number | null
          small_brokens: number | null
          small_brokens_c1: number | null
          sprout_rate: number | null
          sticky_rice_rate: number | null
          surveyor: string | null
          thai_datetime: string | null
          topline_rate: number | null
          total_brokens: number | null
          unripe_rate: number | null
          whiteness: number | null
          whole_kernels: number | null
          yellow_rice_rate: number | null
        }
        Insert: {
          analyzed_at?: string | null
          analyzed_at_ms?: number | null
          backup_at?: string | null
          black_kernel?: number | null
          brown_rice_rate?: number | null
          class1?: number | null
          class2?: number | null
          class3?: number | null
          created_at?: string | null
          cur_material?: string | null
          cur_variety?: number | null
          device_code?: string | null
          head_rice?: number | null
          heavy_chalkiness_rate?: number | null
          honey_rice?: number | null
          id?: number | null
          imperfection_rate?: number | null
          impurity_num?: number | null
          light_honey_rice?: number | null
          machine_unix_time?: string | null
          main_index?: number | null
          main_rate?: number | null
          mix_index?: number | null
          mix_rate?: number | null
          msg_id?: number | null
          other_backline?: number | null
          output?: number | null
          paddy_rate?: number | null
          parboiled_red_line?: number | null
          parboiled_white_rice?: number | null
          partly_black?: number | null
          partly_black_peck?: number | null
          process_precision?: number | null
          red_line_rate?: number | null
          sample_index?: number | null
          sample_source?: string | null
          short_grain?: number | null
          slender_kernel?: number | null
          small_brokens?: number | null
          small_brokens_c1?: number | null
          sprout_rate?: number | null
          sticky_rice_rate?: number | null
          surveyor?: string | null
          thai_datetime?: string | null
          topline_rate?: number | null
          total_brokens?: number | null
          unripe_rate?: number | null
          whiteness?: number | null
          whole_kernels?: number | null
          yellow_rice_rate?: number | null
        }
        Update: {
          analyzed_at?: string | null
          analyzed_at_ms?: number | null
          backup_at?: string | null
          black_kernel?: number | null
          brown_rice_rate?: number | null
          class1?: number | null
          class2?: number | null
          class3?: number | null
          created_at?: string | null
          cur_material?: string | null
          cur_variety?: number | null
          device_code?: string | null
          head_rice?: number | null
          heavy_chalkiness_rate?: number | null
          honey_rice?: number | null
          id?: number | null
          imperfection_rate?: number | null
          impurity_num?: number | null
          light_honey_rice?: number | null
          machine_unix_time?: string | null
          main_index?: number | null
          main_rate?: number | null
          mix_index?: number | null
          mix_rate?: number | null
          msg_id?: number | null
          other_backline?: number | null
          output?: number | null
          paddy_rate?: number | null
          parboiled_red_line?: number | null
          parboiled_white_rice?: number | null
          partly_black?: number | null
          partly_black_peck?: number | null
          process_precision?: number | null
          red_line_rate?: number | null
          sample_index?: number | null
          sample_source?: string | null
          short_grain?: number | null
          slender_kernel?: number | null
          small_brokens?: number | null
          small_brokens_c1?: number | null
          sprout_rate?: number | null
          sticky_rice_rate?: number | null
          surveyor?: string | null
          thai_datetime?: string | null
          topline_rate?: number | null
          total_brokens?: number | null
          unripe_rate?: number | null
          whiteness?: number | null
          whole_kernels?: number | null
          yellow_rice_rate?: number | null
        }
        Relationships: []
      }
      rice_quality_events: {
        Row: {
          attempts: number
          created_at: string
          device_code: string
          id: string
          last_error: string | null
          processed_at: string | null
          rice_quality_id: number
        }
        Insert: {
          attempts?: number
          created_at?: string
          device_code: string
          id?: string
          last_error?: string | null
          processed_at?: string | null
          rice_quality_id: number
        }
        Update: {
          attempts?: number
          created_at?: string
          device_code?: string
          id?: string
          last_error?: string | null
          processed_at?: string | null
          rice_quality_id?: number
        }
        Relationships: []
      }
      "Sending Push Notification": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      shared_analysis_links: {
        Row: {
          analysis_id: number
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          share_token: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_id: number
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          share_token: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_id?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          share_token?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_shared_analysis_links_analysis_id"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "rice_quality_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_moisture_links: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          reading_id: string
          share_token: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reading_id: string
          share_token: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reading_id?: string
          share_token?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_moisture_links_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "moisture_meter_readings"
            referencedColumns: ["id"]
          },
        ]
      }
      slow_query_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          execution_time_ms: number
          id: string
          parameters: Json | null
          query_name: string
          query_text: string | null
          sql_state: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          execution_time_ms: number
          id?: string
          parameters?: Json | null
          query_name: string
          query_text?: string | null
          sql_state?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number
          id?: string
          parameters?: Json | null
          query_name?: string
          query_text?: string | null
          sql_state?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_chart_preferences: {
        Row: {
          created_at: string
          device_code: string
          id: string
          preset_name: string
          selected_metrics: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_code: string
          id?: string
          preset_name?: string
          selected_metrics?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_code?: string
          id?: string
          preset_name?: string
          selected_metrics?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_device_access: {
        Row: {
          created_at: string
          created_by: string
          device_code: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          device_code: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          device_code?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_device_preferences: {
        Row: {
          created_at: string
          device_code: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_code: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_code?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_active?: boolean
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      device_data_summary: {
        Row: {
          data_freshness: string | null
          device_code: string | null
          display_name: string | null
          last_updated: string | null
          location: string | null
        }
        Relationships: []
      }
      guest_enabled_devices: {
        Row: {
          device_code: string | null
          enabled: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      analyze_slow_queries: {
        Args: { hours_back?: number }
        Returns: {
          avg_execution_ms: number
          max_execution_ms: number
          min_execution_ms: number
          query_name: string
          total_calls: number
          total_time_ms: number
        }[]
      }
      check_database_health: {
        Args: never
        Returns: {
          check_name: string
          details: string
          execution_time_ms: number
          status: string
        }[]
      }
      check_notification_thresholds: { Args: never; Returns: undefined }
      check_user_role_for_data_access: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      cleanup_old_performance_logs: {
        Args: { days_to_keep?: number }
        Returns: number
      }
      get_device_data: {
        Args: never
        Returns: {
          device_code: string
          updated_at: string
        }[]
      }
      get_devices_emergency_fallback: {
        Args: never
        Returns: {
          device_code: string
          display_name: string
          updated_at: string
        }[]
      }
      get_devices_with_details: {
        Args: {
          is_admin_param?: boolean
          is_superadmin_param?: boolean
          user_id_param?: string
        }
        Returns: {
          device_code: string
          display_name: string
          updated_at: string
        }[]
      }
      get_guest_cache_status: {
        Args: never
        Returns: {
          expired_cached: number
          newest_cache: string
          oldest_cache: string
          total_cached: number
          valid_cached: number
        }[]
      }
      get_guest_devices_fast: {
        Args: never
        Returns: {
          device_code: string
          display_name: string
          updated_at: string
        }[]
      }
      get_guest_devices_optimized: {
        Args: never
        Returns: {
          device_code: string
          display_name: string
          updated_at: string
        }[]
      }
      get_guest_devices_with_cache: {
        Args: never
        Returns: {
          device_code: string
          display_name: string
          updated_at: string
        }[]
      }
      get_guest_enabled_devices: {
        Args: never
        Returns: {
          device_code: string
          enabled: boolean
        }[]
      }
      get_performance_metrics: {
        Args: never
        Returns: {
          last_updated: string
          metric_name: string
          metric_value: number
        }[]
      }
      get_super_fast_auth_devices: {
        Args: {
          is_admin_param?: boolean
          is_superadmin_param?: boolean
          user_id_param?: string
        }
        Returns: {
          device_code: string
          display_name: string
          updated_at: string
        }[]
      }
      get_super_fast_guest_devices: {
        Args: never
        Returns: {
          device_code: string
          display_name: string
          updated_at: string
        }[]
      }
      get_user_roles: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_device_access: {
        Args: { device_code_param: string }
        Returns: boolean
      }
      has_role: {
        Args: { role: Database["public"]["Enums"]["app_role"]; user_id: string }
        Returns: boolean
      }
      increment_counter: {
        Args: { counter_name_param: string; increment_by?: number }
        Returns: undefined
      }
      invalidate_guest_devices_cache: { Args: never; Returns: boolean }
      is_admin_or_superadmin: { Args: never; Returns: boolean }
      is_admin_or_superadmin_safe: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      log_query_performance: {
        Args: {
          execution_time_ms: number
          function_name: string
          is_cached?: boolean
          result_count?: number
        }
        Returns: undefined
      }
      log_security_check: {
        Args: { function_name: string; success: boolean; user_id: string }
        Returns: undefined
      }
      log_slow_query: {
        Args: {
          p_error_message?: string
          p_execution_time_ms: number
          p_parameters?: Json
          p_query_name: string
          p_query_text?: string
          p_sql_state?: string
          p_user_id?: string
        }
        Returns: undefined
      }
      monitor_policy_performance: {
        Args: never
        Returns: {
          avg_check_time_ms: number
          policy_count: number
          table_name: string
        }[]
      }
      query_with_timeout: {
        Args: { query_name: string; timeout_seconds?: number }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      rate_limited_guest_devices: {
        Args: never
        Returns: {
          device_code: string
          display_name: string
          updated_at: string
        }[]
      }
      refresh_device_summary: { Args: never; Returns: boolean }
      refresh_guest_enabled_devices: { Args: never; Returns: boolean }
      safe_check_notification_thresholds: { Args: never; Returns: undefined }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "superadmin"
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
      app_role: ["user", "admin", "superadmin"],
    },
  },
} as const
