"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Key, ArrowRight, Loader2, Lock, Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  
  const [method, setMethod] = useState<"password" | "otp">("password")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return setError("Email and password are required")
    
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      router.push("/onboarding")
    } catch (err: any) {
      setError(err.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return setError("Email is required")
    
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOtpSent(true)
    } catch (err: any) {
      setError(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) return setError("OTP is required")
    
    setLoading(true)
    setError("")
    
    try {
      // Re-using the old verify-otp route for passwordless login
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, role: 'job_seeker' }) // default role if creating
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      router.push("/onboarding")
    } catch (err: any) {
      setError(err.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      {/* Left Column (Premium Design) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary relative overflow-hidden text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 z-0" />
        
        {/* Decorative blur elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />

        <Link href="/" className="relative z-10 text-3xl font-black tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
          UDYOG JAGAT
        </Link>
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-white" /> Welcome Back
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-[1.1]">
            Continue building your career.
          </h1>
          <p className="text-lg text-primary-foreground/80 font-medium">
            Log in to access personalized opportunities or scale your hiring process effortlessly.
          </p>
        </div>
        <div className="relative z-10 text-sm font-medium text-primary-foreground/60 uppercase tracking-widest">
          © {new Date().getFullYear()} Udyog Jagat Inc.
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-24 relative bg-card shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-10">
        <div className="max-w-md w-full mx-auto space-y-10">
          
          <div className="lg:hidden text-2xl font-black tracking-tighter mb-8 text-primary">
            UDYOG JAGAT
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">Log In</h2>
            <p className="text-base text-muted-foreground">
              Don't have an account? <Link href="/auth/signup" className="text-primary hover:underline font-bold">Sign up</Link>
            </p>
          </div>

          <div className="flex gap-2 p-1.5 bg-secondary/50 rounded-xl border border-border/50">
            <button
              onClick={() => { setMethod("password"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${method === "password" ? "bg-background shadow-sm text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"}`}
            >
              Password
            </button>
            <button
              onClick={() => { setMethod("otp"); setError(""); setOtpSent(false); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${method === "otp" ? "bg-background shadow-sm text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"}`}
            >
              Email OTP
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm font-semibold text-destructive flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              {error}
            </div>
          )}

          {method === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline font-bold">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          {method === "otp" && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Authentication Code"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          {method === "otp" && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">Authentication Code</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-input bg-background text-2xl font-mono tracking-[0.5em] text-center focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground font-medium text-center">Secure code sent to {email}</p>
              </div>
              <button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Log In"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setOtpSent(false)} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Wrong email address?</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
