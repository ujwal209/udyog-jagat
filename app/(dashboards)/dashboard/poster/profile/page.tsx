"use client"

import * as React from "react"
import { 
  User, Mail, LayoutGrid, MapPin, 
  Shield, Lock, Camera, Loader2, 
  Save, KeyRound, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { 
  getPosterProfileAction, 
  updatePosterProfileAction, 
  updatePosterPasswordAction 
} from "@/app/actions/poster-profile"

export default function PosterProfilePage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [passLoading, setPassLoading] = React.useState(false)
  
  const [user, setUser] = React.useState<any>(null)
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)

  // Load Profile
  React.useEffect(() => {
    async function load() {
      const res = await getPosterProfileAction()
      if (res.success) {
        setUser(res.data)
      } else {
        toast.error("Failed to load profile")
      }
      setLoading(false)
    }
    load()
  }, [])

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image too large (Max 2MB)")
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Submit Profile Info
  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const toastId = toast.loading("Saving changes...")
    const formData = new FormData(e.currentTarget)

    try {
      let finalAvatarUrl = undefined

      // Upload to Cloudinary if new image selected
      if (avatarFile) {
        const uploadData = new FormData()
        uploadData.append("file", avatarFile)
        uploadData.append("upload_preset", "kbueeplv") // Keep your preset

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/image/upload`, {
          method: "POST",
          body: uploadData
        })
        const json = await uploadRes.json()
        if (json.secure_url) finalAvatarUrl = json.secure_url
      }

      const res = await updatePosterProfileAction(formData, finalAvatarUrl)

      if (res.success) {
        toast.success("Profile updated successfully", { id: toastId })
      } else {
        toast.error(res.error, { id: toastId })
      }
    } catch (err) {
      toast.error("Failed to save changes", { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  // Submit Password Change
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPassLoading(true)
    const toastId = toast.loading("Updating security credentials...")
    const formData = new FormData(e.currentTarget)

    const res = await updatePosterPasswordAction(formData)

    if (res.success) {
      toast.success("Password changed successfully", { id: toastId })
      // Optional: Reset form fields
      ;(e.target as HTMLFormElement).reset()
    } else {
      toast.error(res.error, { id: toastId })
    }
    setPassLoading(false)
  }

  if (loading) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1C3FA4] animate-spin mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 font-sans text-slate-900 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="mb-10 space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
          Account <span className="text-[#1C3FA4]">Settings</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm max-w-lg">
          Manage your personal information, organizational alignment, and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: PROFILE FORM (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleProfileSubmit} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1C3FA4]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Personal & Organization</h3>
                <p className="text-xs text-slate-400 font-medium">Update your public profile details.</p>
              </div>
            </div>

            {/* AVATAR UPLOAD */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 rounded-[1.5rem] border-4 border-slate-50 shadow-sm">
                  <AvatarImage src={avatarPreview || user?.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 text-[#1C3FA4] font-bold text-xl">
                    {user?.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-2 -right-2 p-2.5 bg-[#1C3FA4] text-white rounded-xl shadow-lg hover:bg-[#152d75] transition-all cursor-pointer ring-4 ring-white flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Profile Photo</p>
                <p className="text-xs text-slate-400">Supports JPG, PNG (Max 2MB)</p>
              </div>
            </div>

            {/* INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input name="fullName" defaultValue={user?.full_name} className="pl-11 h-12 rounded-xl border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input defaultValue={user?.email} disabled className="pl-11 h-12 rounded-xl border-slate-100 bg-slate-50 text-slate-500 font-medium cursor-not-allowed" />
                </div>
              </div>

              {/* ORG FIELDS */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Vibhaaga</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input name="vibhaaga" defaultValue={user?.vibhaaga} className="pl-11 h-12 rounded-xl border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Khanda</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input name="khanda" defaultValue={user?.khanda} className="pl-11 h-12 rounded-xl border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Valaya</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input name="valaya" defaultValue={user?.valaya} className="pl-11 h-12 rounded-xl border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Milan</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input name="milan" defaultValue={user?.milan} className="pl-11 h-12 rounded-xl border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4]" />
                </div>
              </div>

            </div>

            <div className="pt-4 flex justify-end">
              <Button disabled={saving} className="bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-900/10">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</div>}
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: SECURITY (1/3 width) */}
        <div className="lg:col-span-1 space-y-8">
          <form onSubmit={handlePasswordSubmit} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6 h-fit">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Security</h3>
                <p className="text-xs text-slate-400 font-medium">Update credentials.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input name="newPassword" type="password" placeholder="••••••••" required minLength={6} className="pl-11 h-12 rounded-xl border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} className="pl-11 h-12 rounded-xl border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4]" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button disabled={passLoading} className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#1C3FA4] hover:border-blue-100 rounded-xl h-12 font-bold transition-all">
                {passLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
              </Button>
            </div>
          </form>

          {/* Status Card */}
          <div className="bg-[#1C3FA4] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
              <div>
                <p className="text-sm font-bold opacity-90">Account Status</p>
                <p className="text-xl font-bold">Active</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}