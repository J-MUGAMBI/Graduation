export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; is_admin: boolean; created_at: string }
        Insert: { id: string; display_name: string; is_admin?: boolean; created_at?: string }
        Update: { id?: string; display_name?: string; is_admin?: boolean }
      }
      rsvps: {
        Row: { id: string; user_id: string; phone: string | null; status: string; dietary: string | null; note: string | null; attendee_count: number; created_at: string }
        Insert: { id?: string; user_id: string; phone?: string | null; status?: string; dietary?: string | null; note?: string | null; attendee_count?: number }
        Update: { phone?: string | null; status?: string; dietary?: string | null; note?: string | null; attendee_count?: number }
      }
      feed_posts: {
        Row: { id: string; user_id: string; body: string; is_announcement: boolean; created_at: string }
        Insert: { id?: string; user_id: string; body: string; is_announcement?: boolean }
        Update: { body?: string; is_announcement?: boolean }
      }
      messages: {
        Row: { id: string; user_id: string; body: string; created_at: string }
        Insert: { id?: string; user_id: string; body: string }
        Update: { body?: string }
      }
      requests: {
        Row: { id: string; user_id: string; type: string; location: string | null; details: string | null; status: string; created_at: string }
        Insert: { id?: string; user_id: string; type: string; location?: string | null; details?: string | null; status?: string }
        Update: { type?: string; location?: string | null; details?: string | null; status?: string }
      }
      photos: {
        Row: { id: string; user_id: string; storage_path: string; public_url: string; caption: string | null; approved: boolean; created_at: string }
        Insert: { id?: string; user_id: string; storage_path: string; public_url: string; caption?: string | null; approved?: boolean }
        Update: { caption?: string | null; approved?: boolean }
      }
    }
    Views: {
      feed_posts_view: { Row: { id: string; user_id: string; body: string; is_announcement: boolean; created_at: string; display_name: string } }
      messages_view: { Row: { id: string; user_id: string; body: string; created_at: string; display_name: string } }
      requests_view: { Row: { id: string; user_id: string; type: string; location: string | null; details: string | null; status: string; created_at: string; display_name: string } }
      photos_view: { Row: { id: string; user_id: string; storage_path: string; public_url: string; caption: string | null; approved: boolean; created_at: string; display_name: string } }
      rsvps_view: { Row: { id: string; user_id: string; phone: string | null; status: string; dietary: string | null; note: string | null; attendee_count: number; created_at: string; display_name: string } }
    }
    Functions: { is_admin: { Args: Record<string, never>; Returns: boolean } }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Rsvp = Database['public']['Tables']['rsvps']['Row']
export type FeedPost = Database['public']['Tables']['feed_posts']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Request = Database['public']['Tables']['requests']['Row']
export type Photo = Database['public']['Tables']['photos']['Row']

export type FeedPostView = Database['public']['Views']['feed_posts_view']['Row']
export type MessageView = Database['public']['Views']['messages_view']['Row']
export type RequestView = Database['public']['Views']['requests_view']['Row']
export type PhotoView = Database['public']['Views']['photos_view']['Row']
export type RsvpView = Database['public']['Views']['rsvps_view']['Row']
