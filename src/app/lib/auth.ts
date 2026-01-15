import { createClient } from './supabase/client';
import type { Profile, UserRole } from '@/types/database';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export type { UserRole };

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  specialties?: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  language: 'en' | 'sl';
  phone?: string;
  avatar_url?: string;
  specialties?: string[];
  completed_requests: number;
}

// Login with email and password
export async function login({ email, password }: LoginCredentials): Promise<AuthUser> {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AuthError(error.message);
  }

  if (!data.user) {
    throw new AuthError('Login failed');
  }

  // Get the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    throw new AuthError('Failed to load user profile');
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as UserRole,
    language: profile.language === 'en' ? 'en' : 'sl',
    phone: profile.phone || undefined,
    avatar_url: profile.avatar_url || undefined,
    specialties: profile.specialties || undefined,
    completed_requests: profile.completed_requests,
  };
}

// Sign up a new user
export async function signup({ email, password, name, role, phone, specialties }: SignupCredentials): Promise<AuthUser> {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        phone,
        specialties: role === 'provider' ? specialties ?? [] : [],
      },
    },
  });

  if (error) {
    throw new AuthError(error.message);
  }

  if (!data.user) {
    throw new AuthError('Signup failed');
  }

  // The profile is created automatically by the database trigger
  // Wait a moment for the trigger to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get the created profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    // Profile might not exist yet due to trigger timing
    return {
      id: data.user.id,
      email,
      name,
      role,
      language: 'sl',
      phone,
      specialties: role === 'provider' ? specialties ?? [] : [],
      completed_requests: 0,
    };
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as UserRole,
    language: profile.language === 'en' ? 'en' : 'sl',
    phone: profile.phone || undefined,
    avatar_url: profile.avatar_url || undefined,
    specialties: profile.specialties || undefined,
    completed_requests: profile.completed_requests,
  };
}

// Log out the current user
export async function logout(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new AuthError(error.message);
  }
}

// Get the current logged-in user
export async function getUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Get the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }
  
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as UserRole,
    language: profile.language === 'en' ? 'en' : 'sl',
    phone: profile.phone || undefined,
    avatar_url: profile.avatar_url || undefined,
    specialties: profile.specialties || undefined,
    completed_requests: profile.completed_requests,
  };
}

// Get a user's profile by ID
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
  return null;
}

  return data as Profile;
}

// Update the current user's profile
export async function updateProfile(
  updates: Partial<Pick<Profile, 'name' | 'phone' | 'bio' | 'avatar_url' | 'specialties' | 'language'>>
): Promise<Profile> {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new AuthError('Not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new AuthError(error.message);
  }

  return data as Profile;
}

// Request password reset
export async function resetPassword(email: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new AuthError(error.message);
  }
}

// Update password (after reset)
export async function updatePassword(newPassword: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new AuthError(error.message);
  }
}

// Listen for auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const supabase = createClient();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        callback({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role as UserRole,
          language: profile.language === 'en' ? 'en' : 'sl',
          phone: profile.phone || undefined,
          avatar_url: profile.avatar_url || undefined,
          specialties: profile.specialties || undefined,
          completed_requests: profile.completed_requests,
        });
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });

  return () => subscription.unsubscribe();
}
