"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getUserHabits, getWeekCheckins } from "../../lib/supabase";
import {
  AVAILABLE_HABITS,
  calculateConsistency,
  getEncouragementLevel,
  getRandomMessage,
  ENCOURAGEMENT_MESSAGES,
} from "../../lib/habit";
import { Heart, ArrowLeft, Sparkles, TrendingUp, Award } from "lucide-react";
import { format, subDays } from "date-fns";
import { User } from "@supabase/supabase-js";
import { EnrichedUserHabit, HabitStat, InsightsData } from "../../types";

export default function Insights() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userHabits, setUserHabits] = useState<EnrichedUserHabit[]>([]);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInsights = async () => {
    const currentUser = await getUser();
    if (!currentUser) {
      router.push("/");
      return;
    }

    setUser(currentUser);

    const { data: habits } = await getUserHabits(currentUser.id);
    const enrichedHabits: EnrichedUserHabit[] =
      habits?.map((h) => {
        const habitDef = AVAILABLE_HABITS.find((ah) => ah.key === h.habit_key)!;
        return { ...h, ...habitDef };
      }) || [];
    setUserHabits(enrichedHabits);

    // Get last 7 days
    const endDate = format(new Date(), "yyyy-MM-dd");
    const startDate = format(subDays(new Date(), 6), "yyyy-MM-dd");

    const { data: checkins } = await getWeekCheckins(
      currentUser.id,
      startDate,
      endDate
    );

    // Calculate insights
    const habitStats: Record<string, HabitStat> = {};
    let totalCompleted = 0;
    const totalPossible = enrichedHabits.length * 7;

    enrichedHabits.forEach((habit) => {
      const habitCheckins =
        checkins?.filter((c) => c.habit_key === habit.habit_key) || [];
      const completedCount = habitCheckins.filter((c) => c.completed).length;
      const consistency = calculateConsistency(habitCheckins, 7);

      habitStats[habit.habit_key] = {
        habit,
        completedCount,
        consistency,
        checkins: habitCheckins,
      };

      totalCompleted += completedCount;
    });

    const overallConsistency = Math.round(
      (totalCompleted / totalPossible) * 100
    );
    const encouragementLevel = getEncouragementLevel(overallConsistency);
    const mainMessage = getRandomMessage(
      ENCOURAGEMENT_MESSAGES[encouragementLevel]
    );

    // Find strongest habit
    const sortedHabits = Object.values(habitStats).sort(
      (a, b) => b.consistency - a.consistency
    );
    const strongestHabit = sortedHabits[0] || null;

    setInsights({
      habitStats,
      overallConsistency,
      mainMessage,
      strongestHabit,
      totalCompleted,
      totalPossible,
    });

    setLoading(false);
  };

  useEffect(() => {
    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] to-[#F9FAFB] flex items-center justify-center">
        <div className="text-[#1F2937]">Generating insights...</div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] to-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-10 h-10 rounded-xl hover:bg-[#E8F4F8] flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F4C81] flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1F2937]">Insights</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">
            Weekly Insights
          </h1>
          <p className="text-[#64748B]">
            Your gentle health companion reflects on your week
          </p>
        </div>

        {/* Main Encouragement Card */}
        <div className="bg-gradient-to-br from-[#0F4C81] to-[#0D3F6A] rounded-2xl p-8 mb-6 text-white shadow-xl shadow-[#0F4C81]/20">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">
                {insights.mainMessage}
              </h2>
              <p className="text-white text-opacity-90 text-lg">
                You completed {insights.totalCompleted} out of{" "}
                {insights.totalPossible} possible check-ins this week.
              </p>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Overall Consistency</span>
              <span className="text-2xl font-bold">
                {insights.overallConsistency}%
              </span>
            </div>
            <div className="h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${insights.overallConsistency}%` }}
              />
            </div>
          </div>
        </div>

        {/* Strongest Habit */}
        {insights.strongestHabit && insights.strongestHabit.consistency > 0 && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-[#E5E7EB]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FBBF24] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-[#FBBF24]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
                  Your Strongest Habit
                </h3>
                <div className="flex items-center gap-3">
                  {insights.strongestHabit.habit.icon && (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${insights.strongestHabit.habit.color}20`,
                      }}
                    >
                      {(() => {
                        const Icon = insights.strongestHabit.habit.icon;
                        return (
                          <Icon
                            className="w-5 h-5"
                            style={{
                              color: insights.strongestHabit.habit.color,
                            }}
                          />
                        );
                      })()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#1F2937]">
                      {insights.strongestHabit.habit.habit_name}
                    </p>
                    <p className="text-sm text-[#64748B]">
                      {insights.strongestHabit.completedCount} days this week (
                      {insights.strongestHabit.consistency}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Habit Breakdown */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#0F4C81]" />
            <h2 className="font-semibold text-[#1F2937]">Habit Breakdown</h2>
          </div>

          <div className="space-y-6">
            {Object.values(insights.habitStats).map((stat) => {
              const Icon = stat.habit.icon;
              const daysText = stat.completedCount === 1 ? "day" : "days";

              return (
                <div key={stat.habit.habit_key} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${stat.habit.color}20` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: stat.habit.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-[#1F2937]">
                            {stat.habit.habit_name}
                          </h3>
                          <p className="text-sm text-[#64748B]">
                            You stayed consistent {stat.completedCount}{" "}
                            {daysText} this week
                          </p>
                        </div>
                        <span className="text-lg font-bold text-[#1F2937]">
                          {stat.consistency}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${stat.consistency}%`,
                            backgroundColor: stat.habit.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closing Encouragement */}
        <div className="bg-gradient-to-r from-[#A78BFA] to-[#0F4C81] bg-opacity-10 rounded-2xl p-6 text-center shadow-md">
          <Sparkles className="w-8 h-8 text-[#A78BFA] mx-auto mb-3" />
          <p className="text-[#1F2937] font-semibold mb-2">
            Remember: Progress isn&apos;t perfection
          </p>
          <p className="text-sm text-[#64748B]">
            Every small action you take is building a healthier version of
            yourself.
          </p>
        </div>
      </main>
    </div>
  );
}
