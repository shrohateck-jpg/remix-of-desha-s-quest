import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Challenge = Tables<"challenges">;

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async (): Promise<Profile> => {
    const { data, error } = await supabase.rpc("ensure_profile");
    if (error) throw error;
    return data as Profile;
  },
  staleTime: 15_000,
});

export const activeChallengeQuery = queryOptions({
  queryKey: ["challenge", "active"],
  queryFn: async (): Promise<Challenge | null> => {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .in("status", ["running", "waiting_proof", "verifying"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  staleTime: 5_000,
});

export const historyQuery = queryOptions({
  queryKey: ["challenge", "history"],
  queryFn: async (): Promise<Challenge[]> => {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .in("status", ["completed", "failed", "cancelled"])
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 30_000,
});
