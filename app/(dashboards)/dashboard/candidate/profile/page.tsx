"use client"

import * as React from "react"
import { 
  User, Mail, Phone, MapPin, Calendar, UploadCloud, 
  Loader2, Save, FileText, Download, Edit2, Camera, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getCandidateProfileAction, updateCandidateProfileAction } from "@/app/actions/candidate-profile-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false)
  const [uploadingResume, setUploadingResume] = React.useState(false)

  const [data, setData] = React.useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    age: "",
    avatar_url: "",
    resume_url: ""
  })

  // --- INITIAL LOAD ---
  React.useEffect(() => {
    async function init() {
      try {
        const profile = await getCandidateProfileAction()
        if (profile) {
          setData({
            full_name: profile.full_name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            age: profile.age?.toString() || "",
            avatar_url: profile.avatar_url || "",
            resume_url: profile.resume_url || ""
          })
        }
      } catch (error) {
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'resume') => {
    const file = e.target.files?.[0]
    if (!file) return

    const isAvatar = type === 'avatar'
    isAvatar ? setUploadingAvatar(true) : setUploadingResume(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "kbueeplv") 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/auto/upload`, {
        method: "POST", body: formData
      })
      
      if (!res.ok) throw new Error("Upload failed")
      
      const json = await res.json()
      
      setData(prev => ({
        ...prev,
        [isAvatar ? "avatar_url" : "resume_url"]: json.secure_url
      }))

      toast.success(isAvatar ? "Photo Updated" : "Resume Uploaded", {
        description: "Don't forget to save your changes.",
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      })

    } catch (error) {
      toast.error("Upload Error", { description: "Could not upload file. Please try again." })
    } finally {
      isAvatar ? setUploadingAvatar(false) : setUploadingResume(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => formData.append(key, value))

    const res = await updateCandidateProfileAction(formData)

    if (res.success) {
      toast.success("Profile Saved", {
        description: "Your details have been updated successfully.",
        icon: <Save className="w-4 h-4 text-[#1C3FA4]" />
      })
    } else {
      toast.error("Update Failed", { description: res.error })
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-[#1C3FA4]" /></div>

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-6 lg:p-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-3 mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          My <span className="text-[#1C3FA4]">Profile</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
          Manage your personal information and resume settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* --- LEFT COLUMN: AVATAR CARD --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
             
             {/* Avatar Upload */}
             <div className="relative mb-6">
                <div className="relative w-32 h-32 rounded-full p-1.5 bg-white border border-slate-100 shadow-lg group-hover:border-[#1C3FA4]/30 transition-all duration-300">
                   <Avatar className="w-full h-full rounded-full">
                      <AvatarImage src={data.avatar_url} className="object-cover" />
                      <AvatarFallback className="bg-[#1C3FA4] text-white text-3xl font-medium">
                        {data.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                   </Avatar>
                   
                   {/* Upload Overlay */}
                   <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      {uploadingAvatar ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                   </label>
                </div>
                {/* Edit Pencil Icon */}
                <div className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md border border-slate-100 text-[#1C3FA4]">
                   <Edit2 className="w-3.5 h-3.5" />
                </div>
             </div>

             <h2 className="text-xl font-semibold text-slate-900">{data.full_name || "Your Name"}</h2>
             <p className="text-sm text-slate-500 font-medium mb-8">{data.email}</p>

             <div className="w-full grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                   <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Age</p>
                   <p className="text-sm font-semibold text-slate-900">{data.age || "-"} Years</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                   <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Status</p>
                   <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-semibold text-slate-900">Active</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: DETAILS FORM --- */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Section: Personal Info */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2 bg-blue-50 rounded-lg text-[#1C3FA4]">
                   <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Personal Details</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label>Full Name</Label>
                   <Input 
                     name="full_name" 
                     value={data.full_name} 
                     onChange={handleChange}
                     className="h-12 rounded-xl bg-white border-slate-200 text-slate-900 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] transition-all" 
                   />
                </div>
                
                <div className="space-y-2">
                   <Label>Phone Number</Label>
                   <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        name="phone" 
                        value={data.phone} 
                        onChange={handleChange}
                        className="h-12 pl-10 rounded-xl bg-white border-slate-200 text-slate-900 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] transition-all" 
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label>Age</Label>
                   <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        name="age" 
                        type="number"
                        value={data.age} 
                        onChange={handleChange}
                        className="h-12 pl-10 rounded-xl bg-white border-slate-200 text-slate-900 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] transition-all" 
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label>Email (Read-only)</Label>
                   <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        disabled
                        value={data.email} 
                        className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed" 
                      />
                   </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                   <Label>Residential Address</Label>
                   <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        name="address" 
                        value={data.address} 
                        onChange={handleChange}
                        className="h-12 pl-10 rounded-xl bg-white border-slate-200 text-slate-900 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] transition-all" 
                      />
                   </div>
                </div>
             </div>
          </section>

          {/* Section: Resume */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2 bg-blue-50 rounded-lg text-[#1C3FA4]">
                   <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Resume</h3>
             </div>

             <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:border-[#1C3FA4]/50 hover:bg-slate-50/30">
                <div className="flex items-center gap-4 w-full">
                   <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0 border border-red-100">
                      <FileText className="w-6 h-6" />
                   </div>
                   <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">Current Resume.pdf</p>
                      {data.resume_url ? (
                        <a href={data.resume_url} target="_blank" rel="noreferrer" className="text-xs font-medium text-[#1C3FA4] hover:underline flex items-center gap-1 mt-1">
                           View File <Download className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 mt-1">No resume uploaded</span>
                      )}
                   </div>
                </div>

                <label className="shrink-0">
                   <Button 
                     type="button" 
                     variant="outline" 
                     disabled={uploadingResume}
                     className="bg-white border-slate-200 text-slate-600 hover:text-[#1C3FA4] hover:border-[#1C3FA4] pointer-events-none h-10 px-4 rounded-xl"
                   >
                     {uploadingResume ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                     {uploadingResume ? "Uploading..." : "Replace Resume"}
                   </Button>
                   <input type="file" className="hidden pointer-events-auto" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'resume')} />
                </label>
             </div>
          </section>

          {/* Actions */}
          <div className="pt-4 flex justify-end">
             <Button 
               type="submit" 
               disabled={saving || uploadingAvatar || uploadingResume}
               className="h-12 px-8 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-900/10 transition-all active:scale-95"
             >
               {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
               Save Changes
             </Button>
          </div>

        </div>
      </form>
    </div>
  )
}

// --- HELPER ---
function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{children}</label>
}