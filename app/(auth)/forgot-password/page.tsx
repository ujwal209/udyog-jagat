"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { ArrowLeft, Moon, Sun, ShieldCheck, ChevronRight, Lock, KeyRound, Loader2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { requestOTPAction, verifyOTPAction, resetPasswordAction } from "@/app/actions/forgot-password-actions"

type Step = "request" | "verify" | "reset" | "success"

export default function ForgotPassword() {
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)
  const [step, setStep] = React.useState<Step>("request")
  const [loading, setLoading] = React.useState(false)

  // Form State
  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === 'dark'

  // --- PRECISE COLOR VARIABLES (Matching Login Page) ---
  const bgRight = isDark ? "bg-[#050505]" : "bg-[#ffffff]"
  const textPrimary = isDark ? "text-white" : "text-[#0f172a]"
  const textSecondary = isDark ? "text-[#94a3b8]" : "text-[#64748b]"
  const borderColor = isDark ? "border-[#1e293b]" : "border-[#e2e8f0]"
  
  // Input Field Aesthetic
  const inputClass = isDark 
    ? "bg-[#0f172a] border-[#1e293b] text-white placeholder:text-[#334155] focus-visible:ring-[#1C3FA4] focus-visible:border-[#1C3FA4] h-12 text-sm" 
    : "bg-white border-[#e2e8f0] text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:ring-[#1C3FA4] focus-visible:border-[#1C3FA4] h-12 text-sm shadow-sm"

  if (!mounted) return null

  // --- HANDLERS ---
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error("Please enter your email")
    
    setLoading(true)
    const res = await requestOTPAction(email)
    setLoading(false)

    if (res.success) {
      toast.success("Recovery connection established. OTP sent.")
      setStep("verify")
    } else {
      toast.error(res.error || "Failed to process request")
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) return toast.error("Please enter a valid OTP")
    
    setLoading(true)
    const res = await verifyOTPAction(email, otp)
    setLoading(false)

    if (res.success) {
      toast.success("Identity verified securely.")
      setStep("reset")
    } else {
      toast.error(res.error || "Invalid OTP code")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters")
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match")

    setLoading(true)
    const res = await resetPasswordAction(email, otp, newPassword)
    setLoading(false)

    if (res.success) {
      toast.success("Security credentials updated successfully")
      setStep("success")
    } else {
      toast.error(res.error || "Failed to reset password")
    }
  }

  return (
    <div className={`w-full h-screen grid lg:grid-cols-2 overflow-hidden transition-colors duration-300 ${bgRight}`}>
      
      {/* --- LEFT COLUMN: IMMERSIVE BRANDING (Identical to Login) --- */}
      <div className="hidden lg:flex h-full relative flex-col justify-between p-16 xl:p-20 overflow-hidden bg-[#1C3FA4]">
        
        {/* 1. Cinematic Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C3FA4] via-[#11286b] to-[#020617] opacity-100 z-0" />
        
        {/* 2. Abstract Geometric Mesh */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.03] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#4f75e8] opacity-[0.1] rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />

        {/* 3. Branding Content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-blue-200" />
            <span className="text-sm font-semibold tracking-wide text-white uppercase">Enterprise Gateway</span>
          </div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-8 tracking-tighter leading-[1.1]">
            Security & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              Continuity.
            </span>
          </h1>
          <div className="h-1 w-20 bg-blue-400 rounded-full mb-8" />
          <p className="text-blue-100/80 text-lg font-light leading-relaxed max-w-lg">
            Recover access to your Udyog Jagat account. Secure identity verification protocols are in effect.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs font-medium text-blue-300/60 uppercase tracking-widest">
          <span>© 2026 Udyog Jagat</span>
          <div className="w-1 h-1 bg-blue-500 rounded-full" />
          <span>ISO 27001 Certified</span>
        </div>
      </div>

      {/* --- RIGHT COLUMN: PRECISION INTERFACE --- */}
      <div className={`h-full flex flex-col items-center justify-center p-8 lg:p-12 relative ${bgRight}`}>
        
        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`absolute top-8 right-8 p-2.5 rounded-full border transition-all duration-300 flex items-center justify-center z-50 ${isDark ? "border-[#1e293b] text-slate-400 hover:text-white bg-[#0f172a]" : "border-slate-200 text-slate-500 hover:text-slate-900 bg-white"}`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Back to Login Link */}
          {step !== "success" && (
            <div className="mb-8">
              <Link 
                href="/login" 
                className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wider ${textSecondary} hover:text-[#1C3FA4] transition-colors group cursor-pointer`}
              >
                <ArrowLeft className="mr-2 w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
                Cancel Recovery
              </Link>
            </div>
          )}

          {/* STEP 1: REQUEST OTP */}
          {step === "request" && (
            <>
              <div className="mb-8">
                <h2 className={`text-3xl font-bold tracking-tight mb-2 ${textPrimary}`}>
                  Reset Password
                </h2>
                <p className={`${textSecondary} text-sm`}>
                  Enter your work email to receive a recovery link.
                </p>
              </div>

              <form onSubmit={handleRequestOTP} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1.5">
                  <label className={`text-[11px] font-bold uppercase tracking-wider pl-1 ${textSecondary}`}>
                    Work Email
                  </label>
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com" 
                    required
                    disabled={loading}
                    className={`rounded-lg transition-all ${inputClass}`} 
                  />
                </div>

                <Button disabled={loading} type="submit" className="w-full h-12 bg-[#1C3FA4] hover:bg-[#16307a] text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 group">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Send Recovery Link <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === "verify" && (
            <>
              <div className="mb-8">
                <h2 className={`text-3xl font-bold tracking-tight mb-2 ${textPrimary}`}>
                  Identity Check
                </h2>
                <p className={`${textSecondary} text-sm`}>
                  Enter the secondary token dispatched to <span className="font-semibold text-[#1C3FA4]">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1.5 relative">
                  <label className={`text-[11px] font-bold uppercase tracking-wider pl-1 ${textSecondary}`}>
                    Recovery Token (OTP)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Numeric only
                      maxLength={6}
                      placeholder="000000" 
                      required
                      disabled={loading}
                      style={{ letterSpacing: '8px', paddingLeft: '2.5rem' }}
                      className={`rounded-lg transition-all font-mono text-lg font-bold ${inputClass}`} 
                    />
                  </div>
                </div>

                <Button disabled={loading || otp.length < 6} type="submit" className="w-full h-12 bg-[#1C3FA4] hover:bg-[#16307a] text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 group">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Authenticate Token <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === "reset" && (
            <>
              <div className="mb-8">
                <h2 className={`text-3xl font-bold tracking-tight mb-2 ${textPrimary}`}>
                  New Keys
                </h2>
                <p className={`${textSecondary} text-sm`}>
                  Define strong, unique access credentials for your session.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1.5">
                  <label className={`text-[11px] font-bold uppercase tracking-wider pl-1 ${textSecondary}`}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••" 
                      required
                      minLength={8}
                      disabled={loading}
                      className={`pl-10 rounded-lg transition-all ${inputClass}`} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[11px] font-bold uppercase tracking-wider pl-1 ${textSecondary}`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" 
                      required
                      minLength={8}
                      disabled={loading}
                      className={`pl-10 rounded-lg transition-all ${inputClass}`} 
                    />
                  </div>
                </div>

                <Button disabled={loading || newPassword.length < 8} type="submit" className="w-full h-12 bg-[#1C3FA4] hover:bg-[#16307a] text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 group">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Update Credentials <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* STEP 4: SUCCESS */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 animate-in zoom-in-95 duration-700">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-emerald-100 border text-emerald-500 shadow-xl shadow-emerald-500/10">
                 <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold tracking-tight mb-2 ${textPrimary}`}>Access Restored</h2>
                <p className={`${textSecondary} text-sm max-w-[280px]`}>
                  Your security credentials have been successfully rotated in the database.
                </p>
              </div>
              <Button onClick={() => router.push("/login")} className="w-full h-12 bg-[#1C3FA4] hover:bg-[#16307a] text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] group mt-4">
                Proceed to Gateway
              </Button>
            </div>
          )}

          {/* Footer Security Badge */}
          <div className={`mt-8 pt-6 border-t ${borderColor} flex items-center justify-center gap-2 opacity-60`}>
             <ShieldCheck className={`w-3 h-3 ${textSecondary}`} />
             <span className={`text-[10px] uppercase tracking-widest ${textSecondary}`}>
               End-to-End Encrypted Session
             </span>
          </div>
          
        </div>
      </div>
    </div>
  )
}