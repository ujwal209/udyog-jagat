"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Lock, ShieldCheck, Eye, EyeOff, 
  ArrowLeft, Loader2, ShieldAlert, CheckCircle2, ArrowRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { updateAdminPassword } from "@/app/actions/profile-actions"

export default function SecurityPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [showPass, setShowPass] = React.useState(false)
  const [formData, setFormData] = React.useState({
    newPassword: "",
    confirmPassword: ""
  })

  const requirements = [
    { label: "Minimum 8 characters", met: formData.newPassword.length >= 8 },
    { label: "Includes a symbol (!@#$)", met: /[!@#$%^&*]/.test(formData.newPassword) },
    { label: "Passwords match", met: formData.newPassword === formData.confirmPassword && formData.newPassword !== "" }
  ]

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) return toast.error("Keys do not match")
    
    setLoading(true)
    const res = await updateAdminPassword(formData.newPassword)
    setLoading(false)

    if (res.success) {
      toast.success("Identity credentials rotated successfully")
      router.push("/dashboard/admin/profile")
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 lg:py-12 space-y-10 px-4 md:px-6 animate-in fade-in duration-500">
      
      {/* --- BREADCRUMB --- */}
      <button 
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-[#1C3FA4] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> 
        Back to Profile
      </button>

      {/* --- HEADER --- */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> High Privilege Action
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
          Rotate <span className="text-[#1C3FA4]">Security Key</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm max-w-lg leading-relaxed">
          Update your administrative credentials. For your protection, this action will terminate all other active sessions across your devices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* --- FORM SECTION --- */}
        <form onSubmit={handleUpdate} className="lg:col-span-7 bg-white border border-slate-100 rounded-[2rem] p-6 md:p-10 shadow-sm space-y-8">
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">New Identity Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 rounded-lg">
                  <Lock className="w-4 h-4 text-[#1C3FA4]" />
                </div>
                <Input 
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="h-12 pl-12 pr-12 rounded-xl border-slate-200 bg-slate-50/30 text-slate-900 font-medium focus:bg-white focus:border-[#1C3FA4] focus:ring-0 transition-all shadow-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1C3FA4] transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Confirm Identity Key</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-[#1C3FA4]" />
                </div>
                <Input 
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="h-12 pl-12 rounded-xl border-slate-200 bg-slate-50/30 text-slate-900 font-medium focus:bg-white focus:border-[#1C3FA4] focus:ring-0 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <Button 
            disabled={loading || !requirements.every(r => r.met)}
            className="w-full h-14 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98] disabled:opacity-40 disabled:grayscale"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <div className="flex items-center gap-2">
                Update Security Credentials <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        {/* --- REQUIREMENTS & NOTES --- */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 text-white space-y-8 relative overflow-hidden shadow-xl shadow-blue-900/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px]" />
            
            <div className="space-y-1 relative z-10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Complexity Protocol</h3>
              <p className="text-sm font-medium text-slate-300">Password Requirements</p>
            </div>

            <div className="space-y-5 relative z-10">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${req.met ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-white/5 border border-white/10"}`}>
                    {req.met ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                  </div>
                  <span className={`text-xs font-medium tracking-tight transition-colors ${req.met ? "text-white" : "text-slate-500"}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-white/10 relative z-10">
              <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 border-dashed">
                <ShieldCheck className="w-5 h-5 text-[#1C3FA4] shrink-0" />
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Encryption standard: <span className="text-white font-semibold">AES-256</span> hashing with salt. All session tokens are re-generated upon successful rotation.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50/50 border border-blue-100/50 rounded-[1.5rem] flex gap-4 items-start">
             <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100">
               <ShieldAlert className="w-4 h-4 text-[#1C3FA4]" />
             </div>
             <p className="text-[11px] text-blue-800 font-semibold uppercase tracking-tight leading-normal">
               Rotating your key is a permanent action. Please ensure you have documented your new credentials securely.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}