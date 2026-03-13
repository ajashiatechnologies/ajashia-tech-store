import { createContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthProvider";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;

  avatar_url: string | null;
  avatar_source: "google" | "preset" | null;

  phone: string | null;
  country_code: string | null;
  phone_completed: boolean;
  phone_verified: boolean;

  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  address_completed: boolean;

  role: "user" | "admin";
};

type ProfileContextType = {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

export const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Profile fetch error:", error);
      setLoading(false);
      return;
    }

    /**
     * 🔐 Avatar resolution logic
     * - Google avatar only if avatar_source === 'google'
     * - Preset avatar if avatar_source === 'preset'
     */
    let resolvedAvatar = data.avatar_url;

    if (data.avatar_source === "google") {
      resolvedAvatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null;
    }

    setProfile({
      ...data,
      avatar_url: resolvedAvatar,
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
