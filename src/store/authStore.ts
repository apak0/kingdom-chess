import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, loading: false });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          // Get user data from the users table
          const { data: userData } = await supabase
            .from('users')
            .select('username')
            .eq('id', session.user.id)
            .single();

          // Update user metadata with username from database
          const updatedUser = {
            ...session.user,
            user_metadata: {
              ...session.user.user_metadata,
              username: userData?.username
            }
          };
          set({ user: updatedUser });
        } else {
          set({ user: null });
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          username,
          email
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        await supabase.auth.signOut();
        throw new Error('Failed to create user profile: ' + profileError.message);
      }

      // Update user with metadata
      const updatedUser = {
        ...data.user,
        user_metadata: {
          ...data.user.user_metadata,
          username
        }
      };
      set({ user: updatedUser });
    }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get username from users table
    const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', data.user.id)
      .single();

    // Update user with metadata
    const updatedUser = {
      ...data.user,
      user_metadata: {
        ...data.user.user_metadata,
        username: userData?.username
      }
    };
    set({ user: updatedUser });
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
}));