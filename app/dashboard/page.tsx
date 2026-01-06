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

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] to-[#F9FAFB] flex items-center justify-center">
        <div className="text-[#1F2937]">Loading your habits...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] to-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C81] flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1F2937]">
              Habit to Health
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-[#64748B] hover:text-[#1F2937] hover:bg-[#F9FAFB] rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">
            Today&apos;s Check-In
          </h1>
          <p className="text-[#64748B]">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#10B981] bg-opacity-10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F2937]">
                  Today&apos;s Progress
                </h3>
                <p className="text-sm text-[#64748B]">
                  {completedCount} of {totalCount} habits
                </p>
              </div>
            </div>
          </div>

          <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#0F4C81] transition-all duration-500 rounded-full"
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
                className="bg-white rounded-2xl p-6 shadow-md border border-[#E5E7EB] hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: habit.color }} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1F2937] text-lg mb-1">
                      {habit.habit_name}
                    </h3>

                    {habit.trackingType === "boolean" ? (
                      <button
                        onClick={() => handleToggleHabit(habit.habit_key)}
                        className={`mt-3 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
                          checkin.completed
                            ? "bg-[#10B981] text-white shadow-[#10B981]/20"
                            : "bg-[#E5E7EB] text-[#64748B] hover:bg-[#0F4C81] hover:text-white"
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
                              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                                checkin.value === value
                                  ? "bg-[#A78BFA] text-white shadow-md"
                                  : "bg-[#E5E7EB] text-[#64748B] hover:bg-[#A78BFA] hover:bg-opacity-20"
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 px-1">
                          <span className="text-xs text-[#64748B]">Poor</span>
                          <span className="text-xs text-[#64748B]">
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
            className="bg-white rounded-2xl p-6 shadow-md border border-[#E5E7EB] hover:border-[#0F4C81] hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#38BDF8] bg-opacity-10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F2937]">
                    View Progress
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    See your weekly patterns
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#64748B] group-hover:text-[#0F4C81] transition-colors" />
            </div>
          </button>

          <button
            onClick={() => router.push("/insights")}
            className="bg-white rounded-2xl p-6 shadow-md border border-[#E5E7EB] hover:border-[#0F4C81] hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#A78BFA] bg-opacity-10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#A78BFA]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F2937]">
                    Weekly Insights
                  </h3>
                  <p className="text-sm text-[#64748B]">Gentle encouragement</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#64748B] group-hover:text-[#0F4C81] transition-colors" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
