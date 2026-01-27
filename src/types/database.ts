// Database types generated from Supabase schema

export type UserRole = 'client' | 'provider' | 'admin';

export type JobStatus = 'open' | 'pending_confirmation' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type OrderStatus = 'pending' | 'accepted' | 'declined' | 'paid' | 'in_progress' | 'completed' | 'cancelled';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  language: 'en' | 'sl';
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialties: string[] | null;
  completed_requests: number;
  is_verified: boolean;
  is_suspended: boolean;
  last_seen_reviews_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  client_id: string;
  provider_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  status: JobStatus;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  budget_min: number | null;
  budget_max: number | null;
  is_negotiable: boolean;
  images: string[] | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  client?: Profile;
  provider?: Profile;
}

export interface Order {
  id: string;
  job_id: string;
  client_id: string;
  provider_id: string;
  title: string;
  location: string | null;
  date_time: string | null;
  price_eur: number;
  status: OrderStatus;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  job?: Job;
  client?: Profile;
  provider?: Profile;
}

export interface Message {
  id: string;
  job_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  // Joined fields
  sender?: Profile;
}

export interface ChatThread {
  id: string;
  job_id: string;
  client_id: string;
  provider_id: string;
  last_message_at: string;
  created_at: string;
  // Joined fields
  job?: Job;
  client?: Profile;
  provider?: Profile;
  last_message?: Message;
}

export interface Review {
  id: string;
  job_id: string;
  client_id: string;
  provider_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined fields
  job?: Job;
  client?: Profile;
  provider?: Profile;
}

export interface CashEarning {
  id: string;
  provider_id: string;
  amount_eur: number;
  earned_at: string;
  note: string | null;
  created_at: string;
  // Joined fields
  provider?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_job_id: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
  // Joined fields
  reporter?: Profile;
  reported_user?: Profile;
  reported_job?: Job;
  resolver?: Profile;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'completed_requests' | 'is_verified' | 'is_suspended'> & {
          completed_requests?: number;
          is_verified?: boolean;
          is_suspended?: boolean;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      jobs: {
        Row: Job;
        Insert: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'status'> & {
          id?: string;
          status?: JobStatus;
        };
        Update: Partial<Omit<Job, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status'> & {
          id?: string;
          status?: OrderStatus;
        };
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'is_read'> & {
          id?: string;
          is_read?: boolean;
        };
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
      chat_threads: {
        Row: ChatThread;
        Insert: Omit<ChatThread, 'id' | 'created_at' | 'last_message_at'> & {
          id?: string;
        };
        Update: Partial<Omit<ChatThread, 'id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Omit<Review, 'id' | 'created_at'>>;
      };
      cash_earnings: {
        Row: CashEarning;
        Insert: Omit<CashEarning, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Omit<CashEarning, 'id' | 'created_at'>>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, 'id' | 'created_at' | 'status' | 'resolved_at'> & {
          id?: string;
          status?: ReportStatus;
        };
        Update: Partial<Omit<Report, 'id' | 'created_at'>>;
      };
    };
  };
}

