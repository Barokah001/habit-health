"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, saveUserHabits } from "../../lib/supabase";
import { AVAILABLE_HABITS } from "../../lib/habit";
import { Check, ArrowRight } from "lucide-react";
import { User } from "@supabase/supabase-js";

export default function Onboarding() {
  const router = useRouter();
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getUser();
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
      }
    };
    checkUser();
  }, [router]);

  const toggleHabit = (habitKey: string) => {
    if (selectedHabits.includes(habitKey)) {
      setSelectedHabits(selectedHabits.filter((h) => h !== habitKey));
    } else {
      if (selectedHabits.length < 5) {
        setSelectedHabits([...selectedHabits, habitKey]);
      }
    }
  };

  const handleContinue = async () => {
    if (selectedHabits.length === 0 || !user) return;

    setLoading(true);
    const habitsToSave = AVAILABLE_HABITS.filter((h) =>
      selectedHabits.includes(h.key)
    ).map((h) => ({ key: h.key, name: h.name }));

    const { error } = await saveUserHabits(user.id, habitsToSave);

    if (error) {
      console.error("Error saving habits:", error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-[#2C3E50]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-6 py-12 flex-1 flex flex-col">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="h-2 bg-[#B8C5D0] bg-opacity-20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5FB3B3] transition-all duration-300 rounded-full"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-4">
            Choose Your Habits
          </h1>
          <p className="text-lg text-[#2C3E50] opacity-70 max-w-2xl mx-auto">
            Select 3-5 habits to track. Remember: you don't have to be perfect.
            These are gentle reminders, not strict rules.
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-[#F5A97F] bg-opacity-10 rounded-full">
            <span className="text-sm text-[#F5A97F] font-medium">
              {selectedHabits.length} of 5 selected
            </span>
          </div>
        </div>

        {/* Habit Selection Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {AVAILABLE_HABITS.map((habit) => {
            const isSelected = selectedHabits.includes(habit.key);
            const Icon = habit.icon;

            return (
              <button
                key={habit.key}
                onClick={() => toggleHabit(habit.key)}
                disabled={!isSelected && selectedHabits.length >= 5}
                className={`p-6 rounded-2xl border-2 transition-all text-left relative ${
                  isSelected
                    ? "border-[#5FB3B3] bg-[#5FB3B3] bg-opacity-5"
                    : "border-[#B8C5D0] border-opacity-20 bg-white hover:border-[#5FB3B3] hover:border-opacity-40"
                } ${
                  !isSelected && selectedHabits.length >= 5
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
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
                      {habit.name}
                    </h3>
                    <p className="text-sm text-[#2C3E50] opacity-70">
                      {habit.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#5FB3B3] flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="mt-auto">
          <button
            onClick={handleContinue}
            disabled={selectedHabits.length === 0 || loading}
            className="w-full py-4 px-6 bg-[#5FB3B3] hover:bg-[#4FA3A3] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Setting up..." : "Continue to Dashboard"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>

          {selectedHabits.length === 0 && (
            <p className="text-center text-sm text-[#2C3E50] opacity-50 mt-4">
              Select at least one habit to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
