import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  ready: boolean;
  busy: boolean;
  error: string | null;
  notice: string | null;

  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  ready: false,
  busy: false,
  error: null,
  notice: null,

  init: async () => {
    const { data } = await supabase.auth.getSession();

    set({
      session: data.session,
      ready: true,
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
    });
  },

  signIn: async (email, password) => {
    set({ busy: true, error: null, notice: null });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ busy: false, error: error.message });
      return false;
    }

    set({ busy: false });
    return true;
  },

  signUp: async (name, email, password) => {
    set({ busy: true, error: null, notice: null });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      set({ busy: false, error: error.message });
      return false;
    }

    if (data.session) {
      set({ busy: false });
      return true;
    }

    set({
      busy: false,
      notice: "Check your email to confirm your account, then sign in.",
    });
    return false;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
