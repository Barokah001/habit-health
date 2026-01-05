"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getUserHabits, getWeekCheckins } from "../../lib/supabase";
import { AVAILABLE_HABITS } from "../../lib/habit";
import { Heart, ArrowLeft, Calendar } from "lucide-react";
import { format, subDays } from "date-fns";
import { User } from "@supabase/supabase-js";
import { EnrichedUserHabit, WeekData } from "../../types";

export default function Progress() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userHabits, setUserHabits] = useState<EnrichedUserHabit[]>([]);
  const [weekData, setWeekData] = useState<WeekData>({ dates: [], data: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

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
    const dataByDate: Record<string, Record<string, any>> = {};
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-[#2C3E50]">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white border-b border-[#B8C5D0] border-opacity-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-10 h-10 rounded-full hover:bg-[#B8C5D0] hover:bg-opacity-10 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C3E50]" />
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#5FB3B3]" />
              <span className="text-xl font-semibold text-[#2C3E50]">
                Progress
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
            Your Weekly Journey
          </h1>
          <p className="text-[#2C3E50] opacity-70">
            Last 7 days of habit tracking
          </p>
        </div>

        {/* Week Overview */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-[#B8C5D0] border-opacity-10 overflow-x-auto">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-[#5FB3B3]" />
            <h2 className="font-semibold text-[#2C3E50]">Weekly Overview</h2>
          </div>

          <div className="min-w-[600px]">
            {/* Date Headers */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div className="text-sm font-medium text-[#2C3E50] opacity-70"></div>
              {weekData.dates.map((date) => (
                <div key={date} className="text-center">
                  <div className="text-xs text-[#2C3E50] opacity-50">
                    {format(new Date(date), "EEE")}
                  </div>
                  <div className="text-sm font-medium text-[#2C3E50]">
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
                    <span className="text-sm text-[#2C3E50] font-medium truncate">
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
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-[#8BAA8C] bg-opacity-20"
                              : "bg-[#B8C5D0] bg-opacity-10"
                          }`}
                        >
                          {isCompleted && (
                            <div
                              className="w-3 h-3 rounded-full"
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
                className="bg-white rounded-2xl p-6 border border-[#B8C5D0] border-opacity-10"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: habit.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#2C3E50] mb-1">
                      {habit.habit_name}
                    </h3>
                    <p className="text-2xl font-bold text-[#2C3E50]">
                      {completedDays}/7 days
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2C3E50] opacity-70">
                      Consistency
                    </span>
                    <span className="font-medium text-[#2C3E50]">
                      {consistency}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#B8C5D0] bg-opacity-10 rounded-full overflow-hidden">
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
        <div className="mt-6 bg-[#5FB3B3] bg-opacity-10 rounded-2xl p-6">
          <p className="text-center text-[#2C3E50] font-medium">
            &quot;Small steps, repeated daily. That&apos;s the secret.&quot;
          </p>
        </div>
      </main>
    </div>
  );
}
