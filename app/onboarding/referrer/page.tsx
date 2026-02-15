"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Building2, User, Phone, Linkedin, 
  Loader2, CheckCircle2, Lock, Camera, ArrowRight, Zap 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { completeReferrerOnboardingAction } from "@/app/actions/referrer-onboarding-actions"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ReferrerOnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState("")

  // --- IMAGE UPLOAD ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "kbueeplv") 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/auto/upload`, {
        method: "POST", body: formData
      })
      const json = await res.json()
      if (json.secure_url) {
        setAvatarUrl(json.secure_url)
        toast.success("Photo Uploaded")
      } else {
        throw new Error("No url returned")
      }
    } catch (err) {
      toast.error("Upload failed")
      console.error("Upload Error:", err)
    } finally {
      setUploading(false)
    }
  }

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    console.log("🔵 [CLIENT] Submitting...")

    try {
      const formData = new FormData(e.currentTarget)
      if (avatarUrl) formData.append("avatar_url", avatarUrl)

      // Call Server Action
      const res = await completeReferrerOnboardingAction(formData)
      console.log("🔵 [CLIENT] Response:", res)

      if (res.success) {
        toast.success("Profile Setup Complete!", {
          description: "Redirecting to dashboard...",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        })
        
        // Force Redirect
        setTimeout(() => {
           window.location.href = "/dashboard/referrer"
        }, 1000)
      } else {
        toast.error("Setup Failed", { description: res.error })
        setLoading(false)
      }
    } catch (err: any) {
      console.error("🔴 [CLIENT] Crash:", err)
      toast.error("Application Error", { description: err.message })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 grid lg:grid-cols-2">
      
      {/* --- LEFT SIDE (BRANDING) --- */}
      <div className="hidden lg:flex flex-col justify-between bg-[#1C3FA4] p-12 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-20">
               <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white fill-current" />
               </div>
               <span className="text-2xl font-bold tracking-tight">UDYOG</span>
            </div>

            <div className="max-w-md space-y-6">
               <h1 className="text-5xl font-bold leading-tight">
                  Start hiring the best talent.
               </h1>
               <p className="text-blue-100 text-lg font-medium leading-relaxed">
                  Join thousands of referrers helping candidates find their dream jobs while earning rewards.
               </p>
            </div>
         </div>

         <div className="relative z-10 flex items-center gap-4 text-sm text-blue-200 font-medium">
            <span>© 2026 Udyog Inc.</span>
            <span className="w-1 h-1 bg-blue-400 rounded-full" />
            <span>Privacy Policy</span>
         </div>
      </div>

      {/* --- RIGHT SIDE (FORM) --- */}
      <div className="flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
         <div className="w-full max-w-lg space-y-10">
            
            <div className="space-y-2">
               <h2 className="text-3xl font-bold tracking-tight text-slate-900">Setup Profile</h2>
               <p className="text-slate-500">Enter your details to create your referrer account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
               
               {/* Avatar */}
               <div className="flex items-center gap-6">
                  <div className="relative group shrink-0">
                     <div className="w-24 h-24 rounded-full border border-slate-200 shadow-sm bg-slate-50 overflow-hidden relative">
                        {uploading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                            <Loader2 className="w-6 h-6 text-[#1C3FA4] animate-spin" />
                          </div>
                        ) : (
                          <Avatar className="w-full h-full">
                            <AvatarImage src={avatarUrl} className="object-cover" />
                            <AvatarFallback className="bg-blue-50 text-[#1C3FA4] text-2xl font-bold">
                                {avatarUrl ? "" : <User className="w-8 h-8 opacity-50" />}
                            </AvatarFallback>
                          </Avatar>
                        )}
                     </div>
                     <label className="absolute bottom-0 right-0 p-2 bg-[#1C3FA4] text-white rounded-full cursor-pointer hover:bg-[#152d75] transition-all shadow-md active:scale-90 z-30">
                        <Camera className="w-3.5 h-3.5" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                     </label>
                  </div>
                  <div className="space-y-1">
                     <h3 className="font-semibold text-slate-900">Profile Photo</h3>
                     <p className="text-xs text-slate-500 max-w-[200px]">
                        Upload a clear professional photo to build trust with candidates.
                     </p>
                  </div>
               </div>

               <div className="space-y-6">
                   {/* Personal Info */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                         <Label>Full Name</Label>
                         <Input name="full_name" required placeholder="John Doe" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1C3FA4]" />
                      </div>
                      <div className="space-y-2">
                         <Label>Phone Number</Label>
                         <Input name="phone" required placeholder="+91..." className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1C3FA4]" />
                      </div>
                   </div>

                   {/* Professional Info */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                         <Label>Current Company</Label>
                         <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input name="company_name" required placeholder="Ex. Google" className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1C3FA4]" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <Label>LinkedIn Profile</Label>
                         <div className="relative">
                            <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input name="linkedin_url" placeholder="linkedin.com/in/..." className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1C3FA4]" />
                         </div>
                      </div>
                   </div>

                   <div className="h-px bg-slate-100 my-4" />

                   {/* Security */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Lock className="w-4 h-4 text-[#1C3FA4]" />
                         <span className="text-sm font-bold text-slate-900">Set Password</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input type="password" name="new_password" required minLength={6} placeholder="••••••••" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1C3FA4]" />
                         </div>
                         <div className="space-y-2">
                            <Label>Confirm</Label>
                            <Input type="password" name="confirm_password" required minLength={6} placeholder="••••••••" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1C3FA4]" />
                         </div>
                      </div>
                   </div>
               </div>

               <Button 
                 type="submit" 
                 disabled={loading || uploading}
                 className="w-full h-12 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
               </Button>

            </form>
         </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{children}</label>
}