'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '../lib/supabase'
import { Sparkles, Heart, TrendingUp, Shield } from 'lucide-react'

export default function Landing() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const authFunction = isSignUp ? signUp : signIn
    const { data, error: authError } = await authFunction(email, password)

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      if (isSignUp && data?.user?.identities?.length === 0) {
        setError('This email is already registered. Please sign in instead.')
        setLoading(false)
        setIsSignUp(false)
      } else if (isSignUp) {
        setError('Check your email to confirm your account, then sign in.')
        setLoading(false)
        setIsSignUp(false)
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] to-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C81] flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1F2937]">Habit to Health</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Value Proposition */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981] bg-opacity-10 border border-[#10B981] border-opacity-20">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
              <span className="text-sm text-[#10B981] font-semibold">Your gentle health companion</span>
            </div>

            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#1F2937] leading-tight mb-6">
                Build healthy habits,<br />
                <span className="text-[#0F4C81]">one day at a time</span>
              </h1>
              <p className="text-lg text-[#64748B] leading-relaxed">
                No pressure. No guilt. Just simple daily check-ins that help you understand what works for your body and mind.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-5 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#10B981] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F2937] text-lg mb-1">30-Second Check-ins</h3>
                  <p className="text-[#64748B]">Quick daily tracking that fits into your busiest days.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#38BDF8] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F2937] text-lg mb-1">Non-Judgmental Insights</h3>
                  <p className="text-[#64748B]">See your patterns without pressure. Progress, not perfection.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#A78BFA] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[#A78BFA]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F2937] text-lg mb-1">Privacy-First</h3>
                  <p className="text-[#64748B]">Your health data stays yours. Secure and private.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth Form */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-[#0F4C81]/10 p-10 border border-[#E5E7EB]">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-[#1F2937] mb-2">
                  {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
                </h2>
                <p className="text-[#64748B]">
                  {isSignUp ? 'Create your free account' : 'Sign in to continue'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#1F2937] mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-[#1F2937] transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[#1F2937] mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-[#1F2937] transition-all"
                    placeholder="At least 6 characters"
                  />
                  <p className="text-xs text-[#64748B] mt-2">Minimum 6 characters required</p>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-[#F87171] bg-opacity-10 border border-[#F87171] border-opacity-20">
                    <p className="text-sm text-[#F87171] font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-[#0F4C81] hover:bg-[#0D3F6A] text-white font-semibold rounded-xl shadow-lg shadow-[#0F4C81]/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E7EB]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#64748B]">or</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="w-full text-center text-[#0F4C81] hover:text-[#0D3F6A] font-semibold transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 text-center text-sm text-[#64748B]">
        <p>Track what matters. Build lasting health habits.</p>
      </footer>
    </div>
  )
}