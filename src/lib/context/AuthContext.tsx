'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '../supabase/client';
import { Profile, UserRole } from '../supabase/types';

export const translateAuthError = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Alamat email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali.';
  }
  if (lower.includes('user already registered') || lower.includes('user_already_exists') || lower.includes('email already')) {
    return 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau langsung masuk ke akun Anda.';
  }
  if (lower.includes('password should be at least') || lower.includes('password is too short')) {
    return 'Kata sandi minimal harus 6 karakter.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Alamat email Anda belum dikonfirmasi. Silakan periksa kotak masuk email Anda dan klik tautan verifikasi.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu beberapa saat sebelum mencoba kembali.';
  }
  if (lower.includes('unable to validate email') || lower.includes('invalid format') || lower.includes('invalid email')) {
    return 'Format alamat email tidak valid. Pastikan penulisan email sudah benar (contoh: nama@domain.com).';
  }
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network request failed')) {
    return 'Gagal terhubung ke server Supabase. Pastikan koneksi internet Anda aktif.';
  }
  if (lower.includes('database error')) {
    return 'Terjadi kendala pada database saat menyimpan data pengguna. Silakan coba sesaat lagi.';
  }
  return message;
};

export interface SignUpResult {
  error: Error | null;
  needsEmailConfirmation?: boolean;
  user?: User | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  demoSignIn: (role: UserRole, customEmail?: string, customName?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'ecommerce_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (configured) {
      const supabase = createClient();

      // Check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Demo / Mock Mode: Restore user from localStorage
      const savedDemoUser = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (savedDemoUser) {
        try {
          const parsed = JSON.parse(savedDemoUser);
          setUser(parsed.user);
          setProfile(parsed.profile);
        } catch {
          localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data as Profile);
      } else {
        // Fallback default profile
        setProfile({
          id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || 'Pengguna',
          avatar_url: null,
          role: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      // Demo sign in fallback
      const role: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
      demoSignIn(role, email);
      return { error: null };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      if (error) {
        return { error: new Error(translateAuthError(error.message)) };
      }
      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: new Error(translateAuthError(err?.message || 'Terjadi kesalahan saat masuk.')) };
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<SignUpResult> => {
    if (!isConfigured) {
      demoSignIn('customer', email, fullName);
      return { error: null, needsEmailConfirmation: false };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'customer',
          },
        },
      });

      if (error) {
        return { error: new Error(translateAuthError(error.message)), needsEmailConfirmation: false };
      }

      // Supabase privacy protection check:
      // When email confirmation is active and the email already exists, identities is []
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          error: new Error('Alamat email ini sudah terdaftar. Silakan gunakan email lain atau langsung masuk ke akun Anda.'),
          needsEmailConfirmation: false,
        };
      }

      // Check if email confirmation is required by Supabase
      const needsEmailConfirmation = !data?.session && Boolean(data?.user);

      if (data?.session?.user) {
        setUser(data.session.user);
        await fetchProfile(data.session.user.id);
      }

      return { 
        error: null, 
        needsEmailConfirmation,
        user: data?.user || null
      };
    } catch (err: any) {
      return { 
        error: new Error(translateAuthError(err?.message || 'Terjadi kesalahan saat mendaftar.')),
        needsEmailConfirmation: false 
      };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setUser(null);
    setProfile(null);
  };

  const demoSignIn = (role: UserRole, customEmail?: string, customName?: string) => {
    const isRoleAdmin = role === 'admin';
    const email = customEmail || (isRoleAdmin ? 'admin@store.id' : 'budi.santoso@gmail.com');
    const name = customName || (isRoleAdmin ? 'Administrator Pusat' : 'Budi Santoso');
    const mockId = isRoleAdmin ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002';

    const mockUser: User = {
      id: mockId,
      app_metadata: {},
      user_metadata: { full_name: name, role },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email,
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    };

    const mockProfile: Profile = {
      id: mockId,
      email,
      full_name: name,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: mockUser, profile: mockProfile }));
    setUser(mockUser);
    setProfile(mockProfile);
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        demoSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
