"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Key, ArrowRight, Loader2, Lock, User, Briefcase, Tag, Sparkles } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [role, setRole] = useState<"job_seeker" | "job_poster">("job_seeker")
  const [hasReferral, setHasReferral] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) return setError("All fields are required")
    if (password.length < 6) return setError("Password must be at least 6 characters")
    if (password !== confirmPassword) return setError("Passwords do not match")
    
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
      setStep(2)
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
      const res = await fetch("/api/auth/verify-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }) 
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setStep(3)
    } catch (err: any) {
      setError(err.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hasReferral && !referralCode) return setError("Referral code is required if checked")
    
    setLoading(true)
    setError("")
    
    try {
      if (hasReferral && referralCode) {
         const refRes = await fetch("/api/auth/validate-referral", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: referralCode })
         })
         const refData = await refRes.json()
         if (!refRes.ok) throw new Error(refData.error || "Invalid referral code")
      }

      const res = await fetch("/api/auth/finalize-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, referralCode: hasReferral ? referralCode : undefined }) 
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      router.push("/onboarding")
    } catch (err: any) {
      setError(err.message || "Failed to create account")
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
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />

        <Link href="/" className="relative z-10 text-3xl font-black tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
          UDYOG JAGAT
        </Link>
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-white" /> Secure Ecosystem
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-[1.1]">
            Start your professional journey.
          </h1>
          <p className="text-lg text-primary-foreground/80 font-medium">
            Join thousands of elite professionals and top-tier companies inside the most advanced hiring platform.
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
            <h2 className="text-4xl font-bold tracking-tight text-foreground">
              {step === 1 ? "Create Account" : step === 2 ? "Verify Email" : "Choose Role"}
            </h2>
            <p className="text-base text-muted-foreground">
              {step === 1 ? (
                <>Already have an account? <Link href="/auth/login" className="text-primary hover:underline font-bold">Log in</Link></>
              ) : step === 2 ? (
                `We sent a secure 6-digit code to ${email}`
              ) : (
                "Select your profile type to personalize your experience."
              )}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-3">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-primary' : 'bg-secondary'}`} />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm font-semibold text-destructive flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
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
                <label className="text-sm font-bold text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          {step === 2 && (
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
              </div>
              <button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Email"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Wrong email address?</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleFinalize} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("job_seeker")}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                    role === "job_seeker"
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border bg-background hover:border-primary/50 text-muted-foreground"
                  }`}
                >
                  <User className={`w-8 h-8 mb-3 ${role === "job_seeker" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-base font-bold">Job Seeker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("job_poster")}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                    role === "job_poster"
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border bg-background hover:border-primary/50 text-muted-foreground"
                  }`}
                >
                  <Briefcase className={`w-8 h-8 mb-3 ${role === "job_poster" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-base font-bold">Employer</span>
                </button>
              </div>

              {role === 'job_seeker' && (
                 <div className="space-y-4 pt-4 border-t border-border/50">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input 
                          type="checkbox" 
                          checked={hasReferral}
                          onChange={(e) => setHasReferral(e.target.checked)}
                          className="w-5 h-5 rounded border-input text-primary focus:ring-primary focus:ring-offset-background"
                       />
                       <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">I have an invite code</span>
                    </label>
                    
                    {hasReferral && (
                       <div className="relative animate-in slide-in-from-top-2 duration-300">
                         <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                         <input
                           type="text"
                           required={hasReferral}
                           value={referralCode}
                           onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                           placeholder="Enter Code (e.g. UDYOG-XXXX)"
                           className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono font-bold"
                         />
                       </div>
                    )}
                 </div>
              )}

              <button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Sign Up"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
