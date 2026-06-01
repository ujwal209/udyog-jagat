"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return setError("Email is required")
    
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset link")
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
            <ShieldAlert className="w-4 h-4 text-white" /> Security Protocol
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-[1.1]">
            Regain access to your account.
          </h1>
          <p className="text-lg text-primary-foreground/80 font-medium">
            Enter your email and we'll send you a secure link to reset your password instantly.
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
            <h2 className="text-4xl font-bold tracking-tight text-foreground">Forgot Password</h2>
            <p className="text-base text-muted-foreground">
              Remembered your password? <Link href="/auth/login" className="text-primary hover:underline font-bold">Log in</Link>
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm font-semibold text-destructive flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-10 text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
               <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner shadow-primary/20">
                 <CheckCircle2 className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-bold text-foreground tracking-tight">Check your inbox</h3>
               <p className="text-muted-foreground text-base">We've securely sent a password reset link to <br/><span className="font-bold text-foreground mt-1 inline-block">{email}</span></p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6 animate-in fade-in duration-500">
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
