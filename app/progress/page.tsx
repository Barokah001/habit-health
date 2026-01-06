"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getUserHabits, getWeekCheckins } from "../../lib/supabase";
import { AVAILABLE_HABITS } from "../../lib/habit";
import { Heart, ArrowLeft, Calendar } from "lucide-react";
import { format, subDays } from "date-fns";
import { User } from "@supabase/supabase-js";
import { DailyCheckin, EnrichedUserHabit, WeekData } from "../../types";

export default function Progress() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userHabits, setUserHabits] = useState<EnrichedUserHabit[]>([]);
  const [weekData, setWeekData] = useState<WeekData>({ dates: [], data: {} });
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
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

    // Organize data by date and habit
    const dataByDate: Record<string, Record<string, DailyCheckin>> = {};
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      last7Days.push(date);
      dataByDate[date] = {};
    }

    checkins?.forEach((checkin) => {
      if (!dataByDate[checkin.date]) {
        dataByDate[checkin.date] = {};
      }
      dataByDate[checkin.date][checkin.habit_key] = checkin;
    });

    setWeekData({ dates: last7Days, data: dataByDate });
    setLoading(false);
  };

  useEffect(() => {
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] to-[#F9FAFB] flex items-center justify-center">
        <div className="text-[#1F2937]">Loading progress...</div>
      </div>
    );
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
              <span className="text-xl font-bold text-[#1F2937]">Progress</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">
            Your Weekly Journey
          </h1>
          <p className="text-[#64748B]">Last 7 days of habit tracking</p>
        </div>

        {/* Week Overview */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-[#0F4C81]" />
            <h2 className="font-semibold text-[#1F2937]">Weekly Overview</h2>
          </div>

          <div className="min-w-[600px]">
            {/* Date Headers */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div className="text-sm font-medium text-[#64748B]"></div>
              {weekData.dates.map((date) => (
                <div key={date} className="text-center">
                  <div className="text-xs text-[#64748B]">
                    {format(new Date(date), "EEE")}
                  </div>
                  <div className="text-sm font-semibold text-[#1F2937]">
                    {format(new Date(date), "d")}
                  </div>
                </div>
              ))}
            </div>

            {/* Habit Rows */}
            {userHabits.map((habit) => {
              const Icon = habit.icon;
              return (
                <div
                  key={habit.habit_key}
                  className="grid grid-cols-8 gap-2 mb-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: habit.color }}
                      />
                    </div>
                    <span className="text-sm text-[#1F2937] font-semibold truncate">
                      {habit.habit_name.split(" ")[0]}
                    </span>
                  </div>

                  {weekData.dates.map((date) => {
                    const checkin = weekData.data[date]?.[habit.habit_key];
                    const isCompleted = checkin?.completed;

                    return (
                      <div
                        key={date}
                        className="flex items-center justify-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-[#10B981] bg-opacity-10 shadow-sm"
                              : "bg-[#E5E7EB]"
                          }`}
                        >
                          {isCompleted && (
                            <div
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: habit.color }}
                            ></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit Stats */}
        <div className="grid md:grid-cols-2 gap-4">
          {userHabits.map((habit) => {
            const Icon = habit.icon;
            const completedDays = weekData.dates.filter(
              (date) => weekData.data[date]?.[habit.habit_key]?.completed
            ).length;
            const consistency = Math.round((completedDays / 7) * 100);

            return (
              <div
                key={habit.habit_key}
                className="bg-white rounded-2xl p-6 shadow-md border border-[#E5E7EB] hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: habit.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1F2937] mb-1">
                      {habit.habit_name}
                    </h3>
                    <p className="text-2xl font-bold text-[#1F2937]">
                      {completedDays}/7 days
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Consistency</span>
                    <span className="font-semibold text-[#1F2937]">
                      {consistency}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${consistency}%`,
                        backgroundColor: habit.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Encouragement */}
        <div className="mt-6 bg-gradient-to-r from-[#10B981] to-[#0F4C81] bg-opacity-10 rounded-2xl p-6 shadow-md">
          <p className="text-center text-[#1F2937] font-semibold text-lg">
            &quot;Small steps, repeated daily. That&apos;s the secret.&quot;
          </p>
        </div>
      </main>
    </div>
  );
}
