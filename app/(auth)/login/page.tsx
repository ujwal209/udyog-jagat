"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ShieldCheck, ChevronRight, AlertCircle, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginAction } from "@/app/actions/login"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      disabled={pending} 
      type="submit"
      className="w-full h-12 bg-[#1C3FA4] hover:bg-[#152d75] text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-70 group"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Authenticating...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          Authenticate Access <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      )}
    </Button>
  )
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <div className="w-full h-screen grid lg:grid-cols-2 overflow-hidden bg-white">
      
      {/* --- LEFT COLUMN: Cinematic Branding --- */}
      <div className="hidden lg:flex h-full relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0 bg-[#1C3FA4] z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C3FA4] via-[#11286b] to-[#020617] opacity-90 z-0" />
        
        <div className="absolute inset-0 opacity-10 z-0" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} 
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">Secured by Udyog Stack</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
           <div className="space-y-2">
              <h1 className="text-6xl font-bold text-white tracking-tighter leading-tight">UDYOG <br/>JAGAT</h1>
              <div className="h-1.5 w-20 bg-blue-400 rounded-full" />
           </div>
           <p className="text-blue-100/70 text-lg font-medium max-w-md leading-relaxed">
             The next generation workforce management portal. Built for speed, secured for enterprise.
           </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-white/40">
           <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">© 2026 Platform Registry</span>
        </div>
      </div>

      {/* --- RIGHT COLUMN: Form Area --- */}
      <div className="h-full flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative bg-white">
        
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="text-slate-500 font-medium text-sm">Please identify yourself to access the console.</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Access Denied</p>
                <p className="text-sm font-medium text-red-600/80">
                  {error === "Profile not found" ? "Your account has no assigned administrative role." : error}
                </p>
              </div>
            </div>
          )}

          <form action={loginAction} className="space-y-5">
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1 group-focus-within:text-[#1C3FA4] transition-colors">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  name="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  className="h-12 pl-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-[#1C3FA4] focus:border-[#1C3FA4] transition-all rounded-xl font-medium" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1 group-focus-within:text-[#1C3FA4] transition-colors">Credential Key</label>
                <Link href="/forgot-password" size="sm" className="text-[10px] font-bold uppercase text-[#1C3FA4] hover:underline tracking-wider">Recover?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••••••" 
                  className="h-12 pl-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-[#1C3FA4] focus:border-[#1C3FA4] transition-all rounded-xl font-medium" 
                  required 
                />
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>

          <div className="text-center">
             <p className="text-xs text-slate-400 font-medium">
               Need an account? <Link href="/request-access" className="text-[#1C3FA4] font-bold hover:underline">Request access</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}