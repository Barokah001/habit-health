import { createClient } from "@supabase/supabase-js";
import { UserHabit, DailyCheckin } from "../types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/onboarding`,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Habit data helpers
export const getUserHabits = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);
  return { data: data as UserHabit[] | null, error };
};

interface HabitToSave {
  key: string;
  name: string;
}

export const saveUserHabits = async (userId: string, habits: HabitToSave[]) => {
  const habitRecords = habits.map((habit) => ({
    user_id: userId,
    habit_key: habit.key,
    habit_name: habit.name,
    is_active: true,
  }));

  const { data, error } = await supabase
    .from("user_habits")
    .upsert(habitRecords, { onConflict: "user_id,habit_key" });
  return { data, error };
};

export const getTodayCheckins = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date);
  return { data: data as DailyCheckin[] | null, error };
};

export const saveCheckin = async (
  userId: string,
  date: string,
  habitKey: string,
  completed: boolean,
  value: number | null = null
) => {
  const { data, error } = await supabase.from("daily_checkins").upsert(
    {
      user_id: userId,
      date,
      habit_key: habitKey,
      completed,
      value,
    },
    { onConflict: "user_id,date,habit_key" }
  );
  return { data, error };
};

export const getWeekCheckins = async (
  userId: string,
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });
  return { data: data as DailyCheckin[] | null, error };
};
