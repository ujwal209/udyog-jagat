"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  User, Mail, MapPin, Camera, 
  LogOut, Loader2, ChevronRight,
  Edit3, Lock, BadgeCheck,Shield 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
// 1. IMPORT THE NEW GET ACTION
import { getAdminProfile, updateAdminAvatar, updateAdminProfile } from "@/app/actions/profile-actions"
import { createClient } from "@/utils/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export default function AdminProfilePage() {
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isEditing, setIsEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const router = useRouter()
  
  const supabase = createClient()

  // 2. USE SERVER ACTION INSTEAD OF CLIENT FETCH
  React.useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        console.log("🚀 Client: Requesting admin profile...")
        // This calls the server action which uses supabaseAdmin (Bypassing RLS)
        const profileData = await getAdminProfile()
        
        if (isMounted) {
          if (profileData) {
            console.log("✅ Client: Profile loaded", profileData)
            setUser(profileData)
          } else {
            console.error("❌ Client: No profile data returned")
            toast.error("Could not load admin profile")
          }
          setLoading(false)
        }
      } catch (err) {
        console.error("❌ Client: Fetch Error:", err)
        if (isMounted) setLoading(false)
      }
    }

    loadProfile()

    return () => { isMounted = false }
  }, [])

  // Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    toast.success("Logged out successfully")
  }

  // Upload Avatar
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "kbueeplv") 

    const toastId = toast.loading("Uploading...")
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/image/upload`, {
        method: "POST", body: formData
      })
      const data = await res.json()
      
      if (data.secure_url) {
        const updateRes = await updateAdminAvatar(data.secure_url)
        if (updateRes.success) {
          setUser({ ...user, avatar_url: data.secure_url })
          toast.success("Avatar updated", { id: toastId })
        } else {
          throw new Error(updateRes.error)
        }
      }
    } catch (err) {
      console.error("Upload Error:", err)
      toast.error("Upload failed", { id: toastId })
    }
  }

  // Update Profile Handler
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await updateAdminProfile(formData)

      if (res.success) {
        setUser({ 
          ...user, 
          full_name: formData.get("full_name"), 
          department: formData.get("department") 
        })
        toast.success("Profile updated successfully")
        setIsEditing(false)
      } else {
        toast.error(res.error || "Failed to update profile")
      }
    } catch (err) {
      console.error("Client Error:", err)
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 text-[#1C3FA4] animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Loading profile...</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 font-sans text-slate-900 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-slate-100 pb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          <div className="relative group">
            <Avatar className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-2xl shadow-blue-900/10">
              <AvatarImage src={user?.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-50 to-white text-[#1C3FA4] text-4xl font-medium">
                {user?.full_name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-2 -right-2 p-2.5 bg-[#1C3FA4] text-white rounded-xl shadow-lg hover:bg-[#152d75] transition-all cursor-pointer ring-4 ring-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            </label>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {user?.full_name || "Admin User"}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-blue-50 text-[#1C3FA4] text-[11px] font-medium uppercase tracking-wider border border-blue-100">
                {user?.role || "Administrator"}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <BadgeCheck className="w-4 h-4 text-[#1C3FA4]" /> Verified Account
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* EDIT DIALOG */}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#1C3FA4] hover:bg-[#152d75] text-white font-medium text-xs shadow-lg shadow-blue-900/10 gap-2">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-white border border-slate-100 shadow-2xl p-0 gap-0 overflow-hidden rounded-2xl">
              <DialogHeader className="p-6 border-b border-slate-50 bg-white">
                <DialogTitle className="text-xl font-semibold text-slate-900">Edit Profile</DialogTitle>
                <DialogDescription className="text-slate-500 text-sm">
                  Update your public profile information.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleUpdate}>
                <div className="p-6 space-y-6 bg-white">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-xs font-medium text-slate-500 uppercase tracking-wide ml-1">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="full_name" 
                        name="full_name" 
                        defaultValue={user?.full_name}
                        className="pl-10 h-12 bg-slate-50 border-transparent text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#1C3FA4] focus-visible:bg-white transition-all rounded-xl"
                        placeholder="e.g. Alex Johnson"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-xs font-medium text-slate-500 uppercase tracking-wide ml-1">Department</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="department" 
                        name="department" 
                        defaultValue={user?.department}
                        className="pl-10 h-12 bg-slate-50 border-transparent text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#1C3FA4] focus-visible:bg-white transition-all rounded-xl"
                        placeholder="e.g. Operations"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-11 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 h-11 bg-[#1C3FA4] hover:bg-[#152d75] text-white font-medium rounded-xl shadow-md"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* LOGOUT BUTTON */}
          <Button 
            onClick={handleLogout}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-100 font-medium text-xs gap-2 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* DETAILS COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          <section>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-1 h-6 bg-[#1C3FA4] rounded-full" />
              <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard label="Full Name" value={user?.full_name} icon={User} />
              <DetailCard label="Email Address" value={user?.email} icon={Mail} />
              <DetailCard label="System ID" value={user?.id} icon={Shield} />
              <DetailCard label="Department" value={user?.department} icon={MapPin} />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-1 h-6 bg-[#1C3FA4] rounded-full" />
              <h2 className="text-lg font-semibold text-slate-900">Security & Governance</h2>
            </div>
            
            <div 
              onClick={() => router.push("/dashboard/admin/profile/security")}
              className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#1C3FA4] hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1C3FA4] group-hover:bg-[#1C3FA4] group-hover:text-white transition-colors duration-300">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-base">Security Credentials</h4>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Update password and security keys.</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1C3FA4] transition-colors" />
            </div>
          </section>
        </div>

        {/* STATUS COLUMN */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1C3FA4] mb-8">
              Account Status
            </h3>
            
            <div className="space-y-8 relative z-10">
              <StatusRow label="Status" value="Active" active />
              <StatusRow label="Role" value="Admin" />
              <StatusRow label="Authentication" value="Standard" />
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 relative z-10">
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Your session is currently active and encrypted. Last login recorded just now.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function DetailCard({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-50 rounded-lg text-[#1C3FA4]">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-900 truncate pl-1">
        {value || "Not Set"}
      </p>
    </div>
  )
}

function StatusRow({ label, value, active }: { label: string, value: string, active?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className={`text-sm font-bold ${active ? "text-emerald-500" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  )
}