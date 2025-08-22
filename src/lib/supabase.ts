import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client for client components
export const createSupabaseBrowserClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server client for server components and API routes
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
  })
}

// Database types
export interface Customer {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  notes?: string
  status: 'lead' | 'customer' | 'inactive'
}

export interface Installer {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  specialties: string[]
  status: 'active' | 'inactive'
  hourly_rate?: number
  notes?: string
}

export interface EmailLog {
  id: string
  created_at: string
  customer_id: string
  subject: string
  body: string
  direction: 'inbound' | 'outbound'
  status: 'sent' | 'received' | 'failed'
  sender_email: string
  recipient_email: string
}
