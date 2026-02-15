"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Briefcase, MapPin, DollarSign, User, Building2, 
  FileText, CheckCircle2, Loader2, ArrowLeft, Image as ImageIcon, UploadCloud, Sparkles, Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { createJobAction } from "@/app/actions/job-posting-actions"
import { toast } from "sonner"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Internship", "Freelance"]

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [logoUrl, setLogoUrl] = React.useState("")

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
        setLogoUrl(json.secure_url)
        toast.success("Logo Uploaded")
      }
    } catch (err) {
      toast.error("Upload failed")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      if (logoUrl) formData.append("company_logo_url", logoUrl)

      const res = await createJobAction(formData)

      if (res?.error) {
        toast.error("Failed to Post", { description: res.error })
        setLoading(false)
      } else {
        toast.success("Job Posted Successfully!", { 
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 
        })
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20 animate-in fade-in duration-700">
      
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <Link href="/dashboard/referrer" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-[#1C3FA4] uppercase tracking-wider transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
           </Link>
           <h1 className="text-sm font-bold text-slate-900 uppercase tracking-widest">New Job Post</h1>
           <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* --- LEFT COLUMN: FORM --- */}
          <div className="lg:col-span-8 space-y-10">
             
             <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                  Create a <span className="text-[#1C3FA4]">Job Post</span>
                </h1>
                <p className="text-slate-500 font-medium">
                  Fill in the details to find your next star employee.
                </p>
             </div>

             <form id="job-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Basic Info */}
                <SectionWrapper title="The Basics" icon={Briefcase}>
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <Label>Job Title</Label>
                         <Input name="title" required placeholder="e.g. Senior Product Designer" className="h-14 rounded-2xl bg-white border-slate-200 text-lg font-medium focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] transition-all" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <Label>Department</Label>
                            <Input name="department" required placeholder="e.g. Design" className="h-14 rounded-2xl bg-white border-slate-200 font-medium focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4]" />
                         </div>
                         <div className="space-y-3">
                            <Label>Employment Type</Label>
                            {/* FIXED SELECT: Added styles to ensure text is dark */}
                            <Select name="type" required>
                               <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200 font-medium text-slate-900 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4]">
                                  <SelectValue placeholder="Select type" />
                               </SelectTrigger>
                               <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl z-50">
                                  {JOB_TYPES.map(t => (
                                    <SelectItem 
                                      key={t} 
                                      value={t} 
                                      className="text-slate-700 font-medium cursor-pointer py-3 hover:bg-blue-50 hover:text-[#1C3FA4] focus:bg-blue-50 focus:text-[#1C3FA4]"
                                    >
                                      {t}
                                    </SelectItem>
                                  ))}
                               </SelectContent>
                            </Select>
                         </div>
                      </div>
                   </div>
                </SectionWrapper>

                {/* 2. Details */}
                <SectionWrapper title="Location & Compensation" icon={MapPin}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <Label>Work Location</Label>
                         <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                            <Input name="location" required placeholder="e.g. Bengaluru, Remote" className="pl-12 h-14 rounded-2xl bg-white border-slate-200 font-medium focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4]" />
                         </div>
                      </div>
                      <div className="space-y-3">
                         <Label>Salary Range (INR)</Label>
                         <div className="relative group">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                            <Input name="salary_range" required placeholder="e.g. ₹18L - ₹24L PA" className="pl-12 h-14 rounded-2xl bg-white border-slate-200 font-medium focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4]" />
                         </div>
                      </div>
                   </div>
                </SectionWrapper>

                {/* 3. Description & Branding */}
                <SectionWrapper title="Role Description & Branding" icon={Sparkles}>
                   <div className="space-y-6">
                      
                      {/* Logo Upload */}
                      <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row items-center gap-6">
                         <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-2xl border-2 border-white shadow-sm bg-white flex items-center justify-center overflow-hidden">
                               {uploading ? (
                                 <Loader2 className="w-6 h-6 text-[#1C3FA4] animate-spin" />
                               ) : logoUrl ? (
                                 <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
                               ) : (
                                 <Building2 className="w-8 h-8 text-slate-300" />
                               )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 p-2 bg-[#1C3FA4] text-white rounded-full cursor-pointer hover:bg-[#152d75] shadow-lg transition-transform active:scale-95">
                               <UploadCloud className="w-4 h-4" />
                               <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                         </div>
                         <div className="text-center sm:text-left">
                            <h4 className="font-bold text-slate-900">Company Logo</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                               Upload a high-res square image (PNG/JPG). This will be displayed on the job card.
                            </p>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <Label>Hiring Manager Name</Label>
                         <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                            <Input name="hiring_manager" placeholder="e.g. Sarah Smith" className="pl-12 h-14 rounded-2xl bg-white border-slate-200 font-medium focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4]" />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <Label>Job Description</Label>
                         <Textarea 
                           name="description" 
                           required 
                           placeholder="Describe the responsibilities, requirements, and perks..." 
                           className="min-h-[250px] rounded-2xl bg-white border-slate-200 font-normal focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] p-5 text-base leading-relaxed resize-y" 
                         />
                      </div>
                   </div>
                </SectionWrapper>

             </form>
          </div>

          {/* --- RIGHT COLUMN: TIPS & ACTION (Sticky) --- */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
             
             {/* Publish Card */}
             <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 space-y-6">
                <div>
                   <h3 className="text-lg font-bold text-slate-900">Ready to hire?</h3>
                   <p className="text-sm text-slate-500 mt-1">
                      Your job post will be live immediately after publishing.
                   </p>
                </div>
                
                <Button 
                  form="job-form"
                  type="submit" 
                  disabled={loading || uploading}
                  className="w-full h-14 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Job"}
                </Button>
             </div>

             {/* Tips Card */}
             <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                   <Lightbulb className="w-5 h-5 fill-current" />
                   <h4 className="font-bold text-sm uppercase tracking-wide">Pro Tips</h4>
                </div>
                <ul className="space-y-3">
                   <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                      Keep the job title concise and standard.
                   </li>
                   <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                      Mention specific salary ranges to attract 3x more candidates.
                   </li>
                   <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                      List key technologies if it's a technical role.
                   </li>
                </ul>
             </div>

          </div>

        </div>
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS ---

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{children}</label>
}

function SectionWrapper({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
       <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
          <div className="p-2.5 bg-blue-50 text-[#1C3FA4] rounded-xl">
             <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
       </div>
       {children}
    </div>
  )
}