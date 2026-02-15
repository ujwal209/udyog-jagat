"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Loader2, Camera, ShieldCheck, ArrowRight, 
  User, Lock, Building2, MapPin, LayoutGrid, Globe, ChevronRight, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { completeAdminOnboardingAction } from "@/app/actions/admin-onboarding"

export default function AdminOnboardingPage() {
  const [loading, setLoading] = React.useState(false)
  const [step, setStep] = React.useState(1) // 1: Profile, 2: Organization, 3: Security
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB")
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading("Finalizing setup...")
    const formData = new FormData(e.currentTarget)

    try {
      let finalAvatarUrl = undefined
      if (avatarFile) {
        const uploadData = new FormData()
        uploadData.append("file", avatarFile)
        uploadData.append("upload_preset", "kbueeplv") 
        const res = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/image/upload`, {
          method: "POST",
          body: uploadData
        })
        const json = await res.json()
        finalAvatarUrl = json.secure_url
      }

      const result = await completeAdminOnboardingAction(formData, finalAvatarUrl)
      if (result?.error) {
        toast.error(result.error, { id: toastId })
        setLoading(false)
      } else {
        toast.success("Account verified successfully", { id: toastId })
        router.refresh() 
      }
    } catch (err: any) {
      toast.error("Connection error", { id: toastId })
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans text-slate-900">
      
      {/* --- LEFT SIDE: PREMIUM BRANDING --- */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#1C3FA4] relative flex-col justify-between p-12 text-white">
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-8">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Secure Admin Onboarding
          </div>
          <h1 className="text-5xl font-semibold tracking-tighter leading-tight mb-6">
            Configure Your <br /> <span className="text-blue-300">Workspace.</span>
          </h1>
          <p className="text-blue-100/80 text-lg font-medium max-w-sm leading-relaxed">
            Verify your administrative credentials to access the central management console.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-4">
            <StepIndicator current={step} target={1} label="Identity & Photo" />
            <StepIndicator current={step} target={2} label="Organization Details" />
            <StepIndicator current={step} target={3} label="Security Credentials" />
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: STEPPED FORM --- */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        <form onSubmit={handleSubmit} className="flex flex-col h-full w-full max-w-xl mx-auto px-8 py-12">
          
          <div className="flex-1">
            {/* --- STEP 1: IDENTITY --- */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900">Professional Identity</h2>
                  <p className="text-sm text-slate-500 font-medium">How you will appear to other administrators.</p>
                </div>

                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="relative">
                    <Avatar className="w-32 h-32 rounded-[2.5rem] border-4 border-slate-50 shadow-xl bg-slate-50 transition-transform hover:scale-105 duration-300">
                      <AvatarImage src={avatarPreview || ""} className="object-cover" />
                      <AvatarFallback className="bg-blue-50 text-[#1C3FA4]">
                        <User className="w-12 h-12 opacity-20" />
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute -bottom-2 -right-2 p-3 bg-[#1C3FA4] text-white rounded-2xl shadow-lg cursor-pointer hover:bg-[#152d75] ring-4 ring-white transition-all">
                      <Camera className="w-5 h-5" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <FormInput name="fullName" label="Full Name" placeholder="e.g. Rahul Sharma" icon={User} required />
                  <FormInput name="department" label="Primary Department" placeholder="e.g. Operations / HR" icon={Building2} required />
                </div>
              </div>
            )}

            {/* --- STEP 2: ORGANIZATION --- */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900">Organizational Mapping</h2>
                  <p className="text-sm text-slate-500 font-medium">Define your hierarchy within the system.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormInput name="vibhaaga" label="Vibhaaga" placeholder="Region" icon={LayoutGrid} />
                  <FormInput name="khanda" label="Khanda" placeholder="Zone" icon={Globe} />
                  <FormInput name="valaya" label="Valaya" placeholder="Area" icon={MapPin} />
                  <FormInput name="milan" label="Milan" placeholder="Unit" icon={MapPin} />
                </div>
              </div>
            )}

            {/* --- STEP 3: SECURITY --- */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900">Access Security</h2>
                  <p className="text-sm text-slate-500 font-medium">Initialize your permanent password for future logins.</p>
                </div>

                <div className="space-y-6">
                  <FormInput name="password" label="Permanent Password" type="password" placeholder="••••••••" icon={Lock} required minLength={6} />
                  <FormInput name="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} required minLength={6} />
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-[11px] text-[#1C3FA4] font-bold uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Password Policy
                  </p>
                  <p className="text-xs text-slate-600 mt-1 font-medium">Minimum 6 characters required. We recommend a mix of symbols and numbers.</p>
                </div>
              </div>
            )}
          </div>

          {/* --- FOOTER NAVIGATION --- */}
          <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1 || loading}
              className="rounded-xl font-bold text-slate-400 hover:text-slate-900 transition-all"
            >
              {step > 1 && "Previous"}
            </Button>

            {step < 3 ? (
              <Button 
                type="button" 
                onClick={() => setStep(s => s + 1)}
                className="bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-blue-900/10 transition-all active:scale-95 flex items-center gap-2"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-blue-900/10 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Finalize Setup"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

/* --- HELPER COMPONENTS --- */

function StepIndicator({ current, target, label }: { current: number, target: number, label: string }) {
  const isActive = current === target
  const isCompleted = current > target

  return (
    <div className={`flex items-center gap-4 transition-all duration-500 ${isActive ? "translate-x-2 opacity-100" : "opacity-40"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
        isActive ? "bg-white border-white text-[#1C3FA4] shadow-lg shadow-white/20" : 
        isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/30 text-white"
      }`}>
        {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-sm font-bold">{target}</span>}
      </div>
      <span className={`text-sm font-bold uppercase tracking-widest ${isActive ? "text-white" : "text-white/60"}`}>
        {label}
      </span>
    </div>
  )
}

function FormInput({ label, icon: Icon, ...props }: any) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#1C3FA4] transition-colors" />
        <Input 
          {...props} 
          className="h-12 pl-11 rounded-xl border-slate-200 bg-white font-medium focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300" 
        />
      </div>
    </div>
  )
}