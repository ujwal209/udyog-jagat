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
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest">Loading Profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 px-4 md:px-6 font-sans text-foreground animate-in fade-in duration-300">
      
      {/* --- HEADER --- */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal information, organizational alignment, and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PROFILE FORM (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileSubmit} className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-primary">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Personal & Organization</h3>
                <p className="text-xs text-muted-foreground">Update your public profile details.</p>
              </div>
            </div>

            {/* AVATAR UPLOAD */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="w-20 h-20 rounded-md border border-border bg-secondary shadow-sm">
                  <AvatarImage src={avatarPreview || user?.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-secondary text-muted-foreground font-bold text-lg">
                    {user?.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 transition-all cursor-pointer ring-2 ring-background flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Profile Photo</p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG (Max 2MB)</p>
              </div>
            </div>

            {/* INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="fullName" defaultValue={user?.full_name} className="pl-9 h-10 border-border bg-background focus-visible:ring-1" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input defaultValue={user?.email} disabled className="pl-9 h-10 border-border bg-secondary text-muted-foreground cursor-not-allowed" />
                </div>
              </div>

              {/* ORG FIELDS */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vibhaaga</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="vibhaaga" defaultValue={user?.vibhaaga} className="pl-9 h-10 border-border bg-background focus-visible:ring-1" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Khanda</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="khanda" defaultValue={user?.khanda} className="pl-9 h-10 border-border bg-background focus-visible:ring-1" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valaya</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="valaya" defaultValue={user?.valaya} className="pl-9 h-10 border-border bg-background focus-visible:ring-1" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Milan</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="milan" defaultValue={user?.milan} className="pl-9 h-10 border-border bg-background focus-visible:ring-1" />
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <Button disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: SECURITY (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handlePasswordSubmit} className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-amber-500">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Security</h3>
                <p className="text-xs text-muted-foreground">Update credentials.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="newPassword" type="password" placeholder="••••••••" required minLength={6} className="pl-9 h-10 border-border bg-background focus-visible:ring-1" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} className="pl-9 h-10 border-border bg-background focus-visible:ring-1" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button disabled={passLoading} variant="outline" className="w-full">
                {passLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
              </Button>
            </div>
          </form>

          {/* Status Card */}
          <div className="bg-primary rounded-lg p-6 text-primary-foreground shadow-sm">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold opacity-90">Account Status</p>
                <p className="text-xl font-bold">Active</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}