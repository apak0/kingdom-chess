import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { User, AuthError } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  error: string | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  error: null,
  loading: true,

  initAuth: async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        const updatedUser = {
          ...session.user,
          user_metadata: {
            ...session.user.user_metadata,
            username:
              session.user.user_metadata?.username ||
              session.user.email?.split("@")[0],
          },
        };
        set({ user: updatedUser, error: null, loading: false });
      } else {
        set({ user: null, error: null, loading: false });
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const updatedUser = {
            ...session.user,
            user_metadata: {
              ...session.user.user_metadata,
              username:
                session.user.user_metadata?.username ||
                session.user.email?.split("@")[0],
            },
          };
          set({ user: updatedUser, error: null });
        } else {
          set({ user: null, error: null });
        }
      });

      return () => subscription.unsubscribe();
    } catch (error: any) {
      console.error("Error initializing auth:", error);
      set({ error: error.message, loading: false });
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Users tablosuna yeni kullanıcıyı ekle
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            email: data.user.email,
            username: username,
            score: 0,
          },
        ]);

        if (insertError) throw insertError;

        const updatedUser = {
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            username,
          },
        };
        set({ user: updatedUser, error: null });
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  signIn: async (email: string, password: string, rememberMe: boolean) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: rememberMe,
        },
      });

      if (error) throw error;

      // Users tablosundan kullanıcı bilgilerini al
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("username, score")
        .eq("id", data.user.id)
        .single();

      if (userError) throw userError;

      const updatedUser = {
        ...data.user,
        user_metadata: {
          ...data.user.user_metadata,
          username: userData.username,
          score: userData.score,
        },
      };
      set({ user: updatedUser, error: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, error: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
