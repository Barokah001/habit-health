"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "../lib/supabase";
import { Sparkles, Heart, TrendingUp } from "lucide-react";

export default function Landing() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const authFunction = isSignUp ? signUp : signIn;
    const { error: authError } = await authFunction(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      if (isSignUp) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#5FB3B3]" />
          <span className="text-xl font-semibold text-[#2C3E50]">
            Habit to Health
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Value Proposition */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5FB3B3] bg-opacity-10">
              <Sparkles className="w-4 h-4 text-[#5FB3B3]" />
              <span className="text-sm text-[#5FB3B3] font-medium">
                A behavior-first health companion
              </span>
            </div>

            <h1 className="text-5xl font-bold text-[#2C3E50] leading-tight">
              Small habits.
              <br />
              Real health.
            </h1>

            <p className="text-lg text-[#2C3E50] opacity-70 leading-relaxed">
              Track what matters, without pressure. Build sustainable habits
              with gentle guidance and encouragement.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8BAA8C] bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-[#8BAA8C]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50]">
                    Simple Daily Check-ins
                  </h3>
                  <p className="text-sm text-[#2C3E50] opacity-70">
                    Takes less than 30 seconds. No complex tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5A97F] bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-[#F5A97F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50]">
                    Non-judgmental Progress
                  </h3>
                  <p className="text-sm text-[#2C3E50] opacity-70">
                    See patterns without guilt. Focus on effort, not perfection.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#B4A7D6] bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#B4A7D6]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50]">
                    Gentle Encouragement
                  </h3>
                  <p className="text-sm text-[#2C3E50] opacity-70">
                    Supportive insights that motivate, never criticize.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#2C3E50]">
                  {isSignUp ? "Start Your Journey" : "Welcome Back"}
                </h2>
                <p className="text-sm text-[#2C3E50] opacity-70 mt-2">
                  {isSignUp
                    ? "Create your account to begin"
                    : "Sign in to continue"}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#2C3E50] mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#B8C5D0] border-opacity-30 focus:outline-none focus:ring-2 focus:ring-[#5FB3B3] focus:border-transparent text-[#2C3E50]"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#2C3E50] mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg border border-[#B8C5D0] border-opacity-30 focus:outline-none focus:ring-2 focus:ring-[#5FB3B3] focus:border-transparent text-[#2C3E50]"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-[#F5A97F] bg-opacity-10 text-[#F5A97F] text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#5FB3B3] hover:bg-[#4FA3A3] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Processing..."
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-[#5FB3B3] hover:text-[#4FA3A3] font-medium"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-sm text-[#2C3E50] opacity-50">
        Track what matters. Live healthier.
      </footer>
    </div>
  );
}
