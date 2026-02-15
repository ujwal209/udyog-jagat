"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Camera, Lock, ArrowRight, Loader2, 
  ShieldCheck, User, CheckCircle2, Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { completePosterOnboarding } from "@/app/actions/poster-onboarding"

export default function PosterOnboardingPage() {
  const [loading, setLoading] = React.useState(false)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      let finalAvatarUrl = ""

      if (avatarFile) {
        const uploadToast = toast.loading("Uploading avatar...")
        const uploadData = new FormData()
        uploadData.append("file", avatarFile)
        uploadData.append("upload_preset", "kbueeplv") 

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/image/upload`, {
          method: "POST",
          body: uploadData
        })
        
        const uploadJson = await uploadRes.json()
        if (uploadJson.secure_url) {
          finalAvatarUrl = uploadJson.secure_url
          toast.dismiss(uploadToast)
        } else {
          toast.error("Image upload failed", { id: uploadToast })
          setLoading(false)
          return
        }
      }

      const result = await completePosterOnboarding(formData, finalAvatarUrl)

      if (result.success) {
        toast.success("Account setup complete!")
        router.push("/dashboard/poster") 
      } else {
        toast.error(result.error)
      }

    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* --- LEFT SIDE: BRANDING --- */}
      <div className="hidden lg:flex w-5/12 bg-[#1C3FA4] relative overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Abstract Pattern */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">UDYOG JAGAT</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Secure Your <br/> Enterprise Access.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed font-medium">
            Complete your profile setup to begin managing job listings and talent acquisition workflows.
          </p>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-4 text-blue-50">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">Verified Identity Protection</span>
            </div>
            <div className="flex items-center gap-4 text-blue-50">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">Role-Based Dashboard Access</span>
            </div>
            <div className="flex items-center gap-4 text-blue-50">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">Seamless Hiring Pipeline</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-200 font-medium">
          © 2024 Udyog Jagat Systems. Secured & Encrypted.
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
          
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Account Setup</h2>
            <p className="text-slate-500 text-sm font-medium">
              Please update your credentials to activate your Job Poster account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="relative group cursor-pointer self-center lg:self-start">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-1 ring-slate-100">
                  <AvatarImage src={avatarPreview || ""} className="object-cover" />
                  <AvatarFallback className="bg-slate-50 text-slate-300">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                
                <label className="absolute bottom-0 -right-2 p-2 bg-[#1C3FA4] text-white rounded-xl shadow-lg hover:bg-[#152d75] transition-all cursor-pointer ring-4 ring-white flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <p className="text-center lg:text-left w-full text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Profile Photo</p>
            </div>

            {/* Inputs */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                  <Input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    minLength={6}
                    className="pl-11 h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                  <Input 
                    name="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    minLength={6}
                    className="pl-11 h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button 
              disabled={loading}
              className="w-full h-14 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-2xl font-bold uppercase tracking-wider text-xs shadow-xl shadow-blue-900/10 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Finalizing...
                </>
              ) : (
                <>
                  Complete Setup <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

          </form>
        </div>
      </div>
    </div>
  )
}