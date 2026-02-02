-- Woorkly Database Schema
-- Run this in Supabase SQL Editor (supabase.com -> Your Project -> SQL Editor)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS / PROFILES TABLE
-- ============================================
-- Note: Supabase Auth handles the auth.users table automatically
-- This profiles table stores additional user data

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'provider', 'admin')),
  language TEXT NOT NULL DEFAULT 'sl',
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}'::text[],
  completed_requests INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add specialties column for existing databases (safe to run multiple times)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}'::text[];

-- Default language for new accounts (Slovenia launch)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'sl';

-- Backfill existing profiles
UPDATE public.profiles
SET language = 'sl'
WHERE language IS NULL OR language = '';

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending_confirmation', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  images TEXT[] DEFAULT '{}'::text[],
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add images column for existing databases (safe to run multiple times)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'::text[];

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  date_time TIMESTAMP WITH TIME ZONE,
  price_eur DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'paid', 'in_progress', 'completed', 'cancelled')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MESSAGES TABLE (for real-time chat)
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CHAT THREADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL UNIQUE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, client_id) -- One review per job per client
);

-- ============================================
-- REPORTS TABLE (for admin moderation)
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON public.jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_provider_id ON public.jobs(provider_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_orders_job_id ON public.orders(job_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON public.orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON public.messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON public.reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_client_id ON public.chat_threads(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_provider_id ON public.chat_threads(provider_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- ============================================
-- PUBLIC RPC HELPERS (safe aggregates)
-- ============================================

-- Public: completed job category counts for a provider.
-- Useful for showing "top categories" on public provider profiles even if direct jobs reads are restricted.
CREATE OR REPLACE FUNCTION public.get_provider_completed_job_category_counts(provider_id uuid)
RETURNS TABLE(name text, count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(j.category, 'Other')::text AS name,
    COUNT(*)::int AS count
  FROM public.jobs j
  WHERE j.provider_id = $1
    AND j.status = 'completed'
  GROUP BY COALESCE(j.category, 'Other')
  ORDER BY COUNT(*) DESC, COALESCE(j.category, 'Other') ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_provider_completed_job_category_counts(uuid) TO anon, authenticated;

-- ============================================
-- CASH EARNINGS TABLE (manual earnings for providers)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cash_earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_eur DECIMAL(10, 2) NOT NULL CHECK (amount_eur > 0),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_earnings_provider_id ON public.cash_earnings(provider_id);
CREATE INDEX IF NOT EXISTS idx_cash_earnings_earned_at ON public.cash_earnings(earned_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_earnings ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- JOBS POLICIES
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs
  FOR SELECT USING (true);

CREATE POLICY "Clients can create jobs" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Job owners can update their jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE POLICY "Clients can delete their own jobs" ON public.jobs
  FOR DELETE USING (auth.uid() = client_id);

-- ORDERS POLICIES
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE POLICY "Providers can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Participants can update orders" ON public.orders
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- MESSAGES POLICIES
CREATE POLICY "Chat participants can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = messages.job_id 
      AND (jobs.client_id = auth.uid() OR jobs.provider_id = auth.uid())
    )
  );

CREATE POLICY "Chat participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_id 
      AND (jobs.client_id = auth.uid() OR jobs.provider_id = auth.uid())
    )
  );

-- CHAT THREADS POLICIES
CREATE POLICY "Participants can view their threads" ON public.chat_threads
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE POLICY "Participants can create threads" ON public.chat_threads
  FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE POLICY "Participants can update threads" ON public.chat_threads
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- REVIEWS POLICIES
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews for their jobs" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- REPORTS POLICIES
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- CASH EARNINGS POLICIES
CREATE POLICY "Providers can manage their own cash earnings" ON public.cash_earnings
  FOR ALL USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);

-- ============================================
-- STORAGE: avatars bucket + RLS
-- ============================================
-- Creates a public bucket `avatars` and policies so each user can manage only
-- their own folder: `{userId}/...`.

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow everyone to read avatars (public bucket)
CREATE POLICY "Public can read avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to manage their own avatar objects under `{uid}/...`
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- STORAGE: uploads bucket + RLS (job images + chat images)
-- Where: used for job request images and chat attachment images
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read uploads" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads');

-- Admin policies (admins can do everything)
CREATE POLICY "Admins can do everything with profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can do everything with jobs" ON public.jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can do everything with orders" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can do everything with messages" ON public.messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can do everything with reports" ON public.reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, phone, specialties, language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'phone',
    CASE
      WHEN jsonb_typeof(NEW.raw_user_meta_data->'specialties') = 'array'
        THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'specialties'))
      ELSE '{}'::text[]
    END,
    'sl'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update chat thread's last_message_at when a new message is sent
CREATE OR REPLACE FUNCTION public.update_chat_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_threads
  SET last_message_at = NEW.created_at
  WHERE job_id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_chat_thread_timestamp();

-- Function to increment completed_requests when a job is completed
CREATE OR REPLACE FUNCTION public.increment_completed_requests()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Increment for provider
    IF NEW.provider_id IS NOT NULL THEN
      UPDATE public.profiles
      SET completed_requests = completed_requests + 1
      WHERE id = NEW.provider_id;
    END IF;
    -- Increment for client
    UPDATE public.profiles
    SET completed_requests = completed_requests + 1
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_job_completed
  AFTER UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.increment_completed_requests();

-- ============================================
-- ENABLE REALTIME FOR CHAT
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

