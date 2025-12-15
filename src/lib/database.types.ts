// database.types.ts - COMPLETE VERSION
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ad_banners: {
        Row: {
          id: string
          created_at: string
          slot_id: string
          image_url: string
          link_url: string
          active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          slot_id: string
          image_url: string
          link_url: string
          active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          slot_id?: string
          image_url?: string
          link_url?: string
          active?: boolean
        }
      }
      admin_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'developer' | 'founder' | 'staff'
          avatar_url: string | null
          is_active: boolean
          is_developer: boolean
          invited_by: string | null
          invited_at: string | null
          accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'developer' | 'founder' | 'staff'
          avatar_url?: string | null
          is_active?: boolean
          is_developer?: boolean
          invited_by?: string | null
          invited_at?: string | null
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'developer' | 'founder' | 'staff'
          avatar_url?: string | null
          is_active?: boolean
          is_developer?: boolean
          invited_by?: string | null
          invited_at?: string | null
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          created_at: string
          name: string
          role: string
          content: string
          image: string
          rating: number
          active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          role: string
          content: string
          image: string
          rating?: number
          active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          role?: string
          content?: string
          image?: string
          rating?: number
          active?: boolean
        }
      }
      team_members: {
        Row: {
          id: string
          created_at: string
          name: string
          role: string
          bio: string
          image: string
          email: string
          phone: string
          managed_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          role: string
          bio: string
          image: string
          email: string
          phone: string
          managed_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          role?: string
          bio?: string
          image?: string
          email?: string
          phone?: string
          managed_by?: string | null
        }
      }
      projects: {
        Row: {
          seo_description: string
          seo_title: string
          amenities: string
          id: string
          created_at: string
          title: string
          slug: string
          description: string
          location: string
          location_display_name: string | null
          price_min: number
          price_max: number
          bedrooms: string
          bathrooms: string
          area_sqft: number
          status: 'active' | 'sold_out' | 'upcoming'
          featured_image: string
          gallery: string[]
          videos: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          slug: string
          description: string
          location: string
          location_display_name?: string | null
          price_min?: number
          price_max?: number
          bedrooms: string
          bathrooms: string
          area_sqft?: number
          status?: 'active' | 'sold_out' | 'upcoming'
          featured_image: string
          gallery?: string[]
          videos?: string[]
          amenities?: string
          seo_title?: string
          seo_description?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          slug?: string
          description?: string
          location?: string
          location_display_name?: string | null
          price_min?: number
          price_max?: number
          bedrooms?: string
          bathrooms?: string
          area_sqft?: number
          status?: 'active' | 'sold_out' | 'upcoming'
          featured_image?: string
          gallery?: string[]
          videos?: string[]
          amenities?: string
          seo_title?: string
          seo_description?: string
        }
      }
      project_updates: {
        Row: {
          id: string
          created_at: string
          project_id: string
          title: string
          description: string
          images: string[]
          video_url: string | null
          author_id: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          title: string
          description: string
          images?: string[]
          video_url?: string | null
          author_id?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          title?: string
          description?: string
          images?: string[]
          video_url?: string | null
          author_id?: string | null
          updated_at?: string | null
        }
      }
      blog_posts: {
        Row: {
          id: string
          created_at: string
          title: string
          slug: string
          excerpt: string
          content: string
          featured_image: string
          author_id: string
          tags: string[]
          status: 'draft' | 'published'
          seo_title: string | null
          seo_description: string | null
          published_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          slug: string
          excerpt: string
          content: string
          featured_image: string
          author_id: string
          tags?: string[]
          status?: 'draft' | 'published'
          seo_title?: string | null
          seo_description?: string | null
          published_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          featured_image?: string
          author_id?: string
          tags?: string[]
          status?: 'draft' | 'published'
          seo_title?: string | null
          seo_description?: string | null
          published_at?: string | null
        }
      }
      contact_submissions: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          phone: string
          message: string
          project_id: string | null
          status: 'new' | 'contacted' | 'closed'
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          phone: string
          message: string
          project_id?: string | null
          status?: 'new' | 'contacted' | 'closed'
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          phone?: string
          message?: string
          project_id?: string | null
          status?: 'new' | 'contacted' | 'closed'
        }
      }
      blog_views: {
        Row: {
          id: string
          created_at: string
          blog_post_id: string
          viewer_ip: string | null
          user_agent: string | null
          referrer: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          blog_post_id: string
          viewer_ip?: string | null
          user_agent?: string | null
          referrer?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          blog_post_id?: string
          viewer_ip?: string | null
          user_agent?: string | null
          referrer?: string | null
        }
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
  }
}