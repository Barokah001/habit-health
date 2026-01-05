"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getUser,
  getUserHabits,
  getTodayCheckins,
  saveCheckin,
  signOut,
} from "../../lib/supabase";
import { AVAILABLE_HABITS } from "../../lib/habit";
import {
  Heart,
  TrendingUp,
  Sparkles,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { User } from "@supabase/supabase-js";
import { EnrichedUserHabit, CheckinStatus } from "../../types";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userHabits, setUserHabits] = useState<EnrichedUserHabit[]>([]);
  const [todayCheckins, setTodayCheckins] = useState<
    Record<string, CheckinStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const currentUser = await getUser();
    if (!currentUser) {
      router.push("/");
      return;
    }

    setUser(currentUser);

    const { data: habits } = await getUserHabits(currentUser.id);
    if (!habits || habits.length === 0) {
      router.push("/onboarding");
      return;
    }

    const enrichedHabits: EnrichedUserHabit[] = habits.map((h) => {
      const habitDef = AVAILABLE_HABITS.find((ah) => ah.key === h.habit_key)!;
      return { ...h, ...habitDef };
    });
    setUserHabits(enrichedHabits);

    const { data: checkins } = await getTodayCheckins(currentUser.id, today);
    const checkinsMap: Record<string, CheckinStatus> = {};
    checkins?.forEach((c) => {
      checkinsMap[c.habit_key] = {
        completed: c.completed,
        value: c.value,
      };
    });
    setTodayCheckins(checkinsMap);
    setLoading(false);
  };

  const handleToggleHabit = async (habitKey: string) => {
    if (!user) return;
    const currentStatus = todayCheckins[habitKey]?.completed || false;
    const newStatus = !currentStatus;

    setTodayCheckins({
      ...todayCheckins,
      [habitKey]: { completed: newStatus, value: null },
    });

    await saveCheckin(user.id, today, habitKey, newStatus);
  };

  const handleScaleChange = async (habitKey: string, value: number) => {
    if (!user) return;
    setTodayCheckins({
      ...todayCheckins,
      [habitKey]: { completed: true, value },
    });

    await saveCheckin(user.id, today, habitKey, true, value);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const completedCount = Object.values(todayCheckins).filter(
    (c) => c.completed
  ).length;
  const totalCount = userHabits.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-[#2C3E50]">Loading your habits...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white border-b border-[#B8C5D0] border-opacity-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#5FB3B3]" />
            <span className="text-xl font-semibold text-[#2C3E50]">
              Habit to Health
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-[#2C3E50] opacity-70 hover:opacity-100 transition-opacity"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
            Today's Check-In
          </h1>
          <p className="text-[#2C3E50] opacity-70">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-[#B8C5D0] border-opacity-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#5FB3B3] bg-opacity-10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#5FB3B3]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2C3E50]">
                  Today's Progress
                </h3>
                <p className="text-sm text-[#2C3E50] opacity-70">
                  {completedCount} of {totalCount} habits
                </p>
              </div>
            </div>
          </div>

          <div className="h-3 bg-[#B8C5D0] bg-opacity-10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5FB3B3] transition-all duration-500 rounded-full"
              style={{
                width: `${
                  totalCount > 0 ? (completedCount / totalCount) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-4 mb-8">
          {userHabits.map((habit) => {
            const Icon = habit.icon;
            const checkin = todayCheckins[habit.habit_key] || {
              completed: false,
              value: null,
            };

            return (
              <div
                key={habit.habit_key}
                className="bg-white rounded-2xl p-6 border border-[#B8C5D0] border-opacity-10"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: habit.color }} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-[#2C3E50] text-lg mb-1">
                      {habit.habit_name}
                    </h3>

                    {habit.trackingType === "boolean" ? (
                      <button
                        onClick={() => handleToggleHabit(habit.habit_key)}
                        className={`mt-3 px-6 py-2 rounded-lg font-medium transition-all ${
                          checkin.completed
                            ? "bg-[#8BAA8C] text-white"
                            : "bg-[#B8C5D0] bg-opacity-20 text-[#2C3E50] hover:bg-opacity-30"
                        }`}
                      >
                        {checkin.completed ? "Completed ✓" : "Mark Complete"}
                      </button>
                    ) : (
                      <div className="mt-3">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              onClick={() =>
                                handleScaleChange(habit.habit_key, value)
                              }
                              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                checkin.value === value
                                  ? "bg-[#B4A7D6] text-white"
                                  : "bg-[#B8C5D0] bg-opacity-10 text-[#2C3E50] hover:bg-opacity-20"
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 px-1">
                          <span className="text-xs text-[#2C3E50] opacity-50">
                            Poor
                          </span>
                          <span className="text-xs text-[#2C3E50] opacity-50">
                            Excellent
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/progress")}
            className="bg-white rounded-2xl p-6 border border-[#B8C5D0] border-opacity-10 hover:border-[#5FB3B3] hover:border-opacity-40 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F5A97F] bg-opacity-10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#F5A97F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50]">
                    View Progress
                  </h3>
                  <p className="text-sm text-[#2C3E50] opacity-70">
                    See your weekly patterns
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2C3E50] opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          <button
            onClick={() => router.push("/insights")}
            className="bg-white rounded-2xl p-6 border border-[#B8C5D0] border-opacity-10 hover:border-[#5FB3B3] hover:border-opacity-40 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#B4A7D6] bg-opacity-10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#B4A7D6]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50]">
                    Weekly Insights
                  </h3>
                  <p className="text-sm text-[#2C3E50] opacity-70">
                    Gentle encouragement
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2C3E50] opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
