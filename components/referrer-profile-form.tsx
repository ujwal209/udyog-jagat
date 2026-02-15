"use client"

import * as React from "react"
import { 
  User, Phone, Building2, Linkedin, Camera, 
  Loader2, Save, Mail, CheckCircle2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateReferrerProfileAction } from "@/app/actions/referrer-profile-actions"
import { toast } from "sonner"

interface ProfileFormProps {
  initialData: {
    full_name: string
    email: string
    phone: string
    company_name: string
    linkedin_url: string
    avatar_url: string
  }
}

export function ReferrerProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState(initialData.avatar_url || "")

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
        toast.success("New photo uploaded", { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> })
      }
    } catch (err) {
      console.error("Upload error:", err)
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  // --- SAVE PROFILE ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("avatar_url", avatarUrl)

      const res = await updateReferrerProfileAction(formData)

      if (res.success) {
        toast.success("Profile Updated", {
          description: "Your changes have been saved successfully.",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        })
      } else {
        toast.error("Update Failed", { description: res.error })
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Avatar Card */}
      <div className="flex flex-col sm:flex-row items-center gap-8 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40">
        <div className="relative group shrink-0">
           <div className="w-28 h-28 rounded-full border-4 border-white ring-1 ring-slate-100 shadow-lg overflow-hidden relative bg-slate-50">
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                  <Loader2 className="w-8 h-8 text-[#1C3FA4] animate-spin" />
                </div>
              ) : (
                <Avatar className="w-full h-full">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-blue-50 text-[#1C3FA4] text-2xl font-bold">
                    {initialData.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
           </div>
           <label className="absolute bottom-0 right-0 p-2.5 bg-[#1C3FA4] text-white rounded-full cursor-pointer hover:bg-[#152d75] transition-all shadow-md active:scale-90 z-30 group-hover:scale-110">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
           </label>
        </div>
        
        <div className="text-center sm:text-left space-y-1">
           <h3 className="text-lg font-bold text-slate-900">Profile Picture</h3>
           <p className="text-sm text-slate-500 font-medium max-w-xs">
             Upload a professional photo. Recommended size is 400x400px.
           </p>
        </div>
      </div>

      {/* 2. Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personal Info */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
             <User className="w-4 h-4 text-[#1C3FA4]" /> Personal Details
           </h3>
           
           <div className="space-y-4">
              <div className="space-y-2">
                 <Label>Full Name</Label>
                 <Input 
                   name="full_name" 
                   defaultValue={initialData.full_name} 
                   className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#1C3FA4]" 
                 />
              </div>
              <div className="space-y-2">
                 <Label>Email Address</Label>
                 <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      disabled 
                      value={initialData.email} 
                      className="pl-10 h-12 rounded-xl bg-slate-50 text-slate-500 border-slate-100 cursor-not-allowed" 
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <Label>Phone Number</Label>
                 <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      name="phone" 
                      defaultValue={initialData.phone} 
                      className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#1C3FA4]" 
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
             <Building2 className="w-4 h-4 text-[#1C3FA4]" /> Professional Info
           </h3>
           
           <div className="space-y-4">
              <div className="space-y-2">
                 <Label>Company Name</Label>
                 <Input 
                   name="company_name" 
                   defaultValue={initialData.company_name} 
                   className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#1C3FA4]" 
                 />
              </div>
              <div className="space-y-2">
                 <Label>LinkedIn Profile</Label>
                 <div className="relative">
                    <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      name="linkedin_url" 
                      defaultValue={initialData.linkedin_url} 
                      className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#1C3FA4]" 
                    />
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* 3. Action Bar */}
      <div className="flex justify-end pt-4">
         <Button 
           type="submit" 
           disabled={loading || uploading}
           className="h-12 px-8 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/10 transition-all active:scale-95 disabled:opacity-70"
         >
           {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
           Save Changes
         </Button>
      </div>

    </form>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{children}</label>
}