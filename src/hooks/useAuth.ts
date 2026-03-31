import { supabase } from "@/lib/supabase";

export const useAuth = () => {
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error?.message ?? null };
  };

  const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error.message;
  }
  };

  const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://ajashiatechstore.in/auth/update-password",
  });
};

const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  return { error };
};




  const signUp = async (name: string, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // ⚠️ User may be null until email verification
  const userId = data.user?.id;

  if (userId) {
    await supabase.from("profiles").upsert({
      id: userId,
      full_name: name,
      email,
      role: "user",
      phone: null, // will be required later
      updated_at: new Date().toISOString(),
    });
  }

  return { error: null };
};


  return { signIn, signUp, signOut, signInWithGoogle};

};
