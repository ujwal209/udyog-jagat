"use client"

import * as React from "react"
import { 
  Mail, ArrowRight, ShieldCheck, Loader2, Zap, 
  User, Calendar, Copy, CheckCircle2, RefreshCcw, Sparkles, AlertCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { provisionCandidateAction } from "@/app/actions/provision-candidate"
import { toast } from "sonner"

export default function GenerateCodePage() {
  const [loading, setLoading] = React.useState(false)
  const [validityType, setValidityType] = React.useState("hours")
  const [durationValue, setDurationValue] = React.useState("24")
  const [successData, setSuccessData] = React.useState<{ code: string; email: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get("email") as string
      const name = formData.get("fullName") as string
      
      // Calculate duration
      const value = parseFloat(durationValue)
      let totalHours = value
      if (validityType === "minutes") totalHours = value / 60
      if (validityType === "days") totalHours = value * 24
      formData.set("duration", totalHours.toString())

      // Server Action
      const res = await provisionCandidateAction(formData)

      if (res.success) {
        setSuccessData({ code: res.code, email })
        // ✅ Success Toast with Details
        toast.success("Identity Provisioned", {
          description: `Access granted for ${name}. Credentials sent.`,
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          duration: 5000,
        })
      } else {
        // ❌ Logic Error Toast
        console.error("Provisioning Error:", res.error)
        toast.error("Provisioning Failed", {
          description: res.error || "Could not generate token. Please check the logs.",
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        })
      }
    } catch (error) {
      // ❌ Network/System Error Toast
      console.error("System Error:", error)
      toast.error("System Error", {
        description: "Something went wrong connecting to the server.",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (successData?.code) {
      navigator.clipboard.writeText(successData.code)
      toast.success("Copied to clipboard", {
        description: "Token is ready to paste."
      })
    }
  }

  const resetForm = () => {
    setSuccessData(null)
    setDurationValue("24")
    setValidityType("hours")
  }

  // --- SUCCESS STATE (Modern Ticket Style) ---
  if (successData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl shadow-blue-900/5 max-w-md w-full relative overflow-hidden group">
          
          {/* Confetti Effect Background */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-[#1C3FA4]" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm animate-in bounce-in duration-700">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Access Granted</h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Token generated for <span className="font-semibold text-slate-900">{successData.email}</span>
            </p>
          </div>

          {/* Code Ticket */}
          <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 group-hover:border-[#1C3FA4]/30 transition-colors">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-100 rounded-full shadow-sm">
              One-Time Token
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
               <span className="text-3xl md:text-4xl font-mono font-bold text-[#1C3FA4] tracking-widest selection:bg-blue-100">
                 {successData.code}
               </span>
            </div>
            <Button 
              onClick={copyToClipboard}
              variant="ghost" 
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-[#1C3FA4] hover:bg-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl text-left border border-blue-100">
               <Mail className="w-4 h-4 text-[#1C3FA4] mt-0.5 shrink-0" />
               <p className="text-xs text-slate-600 font-medium leading-relaxed">
                 A secure email has automatically been dispatched to the candidate with login instructions.
               </p>
            </div>

            <Button 
              onClick={resetForm} 
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-slate-900/10"
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Provision Another User
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // --- FORM STATE ---
  return (
    <div className="max-w-6xl mx-auto py-8 lg:py-12 px-6 space-y-10 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1C3FA4] border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 fill-current" /> Instant Access
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
          Deploy <span className="text-[#1C3FA4]">New Identity</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm max-w-lg leading-relaxed">
          Generate temporary credentials for candidates. Tokens are valid for a single session setup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* --- MAIN FORM --- */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 lg:p-10 shadow-sm space-y-8 relative overflow-hidden">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#1C3FA4] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Candidate Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-[#1C3FA4] transition-colors">Full Legal Name</label>
                  <Input 
                    name="fullName" 
                    placeholder="e.g. Sarah Miller" 
                    required 
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 font-medium focus:bg-white focus:border-[#1C3FA4] focus:ring-0 transition-all" 
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-[#1C3FA4] transition-colors">Enterprise Email</label>
                  <Input 
                    name="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    required 
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 font-medium focus:bg-white focus:border-[#1C3FA4] focus:ring-0 transition-all" 
                  />
                </div>
              </div>

              <div className="pt-6">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#1C3FA4] flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Validity Period</h3>
                 </div>

                 <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full sm:w-auto">
                      <Input 
                        name="validityValue" 
                        type="number" 
                        value={durationValue}
                        onChange={(e) => setDurationValue(e.target.value)}
                        required 
                        className="h-12 pl-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold text-lg focus:border-[#1C3FA4] focus:ring-0 text-center sm:text-left shadow-sm" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-wider pointer-events-none">
                        Value
                      </span>
                    </div>
                    
                    <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 w-full sm:w-auto">
                      {["minutes", "hours", "days"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setValidityType(type)}
                          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                            validityType === type 
                              ? "bg-[#1C3FA4] text-white shadow-md" 
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <Button 
                disabled={loading} 
                className="w-full h-14 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-blue-900/10 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 fill-white/20" /> Initialize & Send Token
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* --- SIDEBAR SUMMARY --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">Deployment Summary</h3>
            <div className="space-y-4">
              <SummaryRow label="Access Level" value="Candidate" />
              <SummaryRow label="Method" value="Token-Based" />
              <SummaryRow label="Encryption" value="AES-256" />
              <div className="h-px bg-slate-50 my-2" />
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                 <span className="text-[11px] font-semibold text-blue-700 uppercase">Expires In</span>
                 <span className="text-sm font-bold text-[#1C3FA4]">{durationValue} {validityType}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1C3FA4] rounded-[2.5rem] p-8 text-white space-y-5 relative overflow-hidden shadow-lg shadow-blue-900/20">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -ml-10 -mb-10" />
            
            <div className="relative z-10 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider">Security Protocol</p>
                <p className="text-[11px] text-blue-100 leading-relaxed font-medium opacity-90">
                  This token grants one-time access to the onboarding portal. It will automatically revoke after use or expiration.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// --- HELPER COMPONENT ---
function SummaryRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-xs font-bold text-slate-700">{value}</span>
    </div>
  )
}