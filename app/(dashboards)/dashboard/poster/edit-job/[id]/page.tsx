"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  Briefcase, Building2, MapPin, 
  IndianRupee, AlignLeft, UploadCloud, 
  Loader2, ArrowRight, ShieldCheck, Zap, Globe, Info, Save, Pencil
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getJobForEditAction, updateJobAction } from "@/app/actions/poster-edit-job"

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [jobData, setJobData] = React.useState<any>(null)
  
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [logoFile, setLogoFile] = React.useState<File | null>(null)

  // Load Data
  React.useEffect(() => {
    async function load() {
      const res = await getJobForEditAction(jobId)
      if (res.success) {
        setJobData(res.data)
        if (res.data.company_logo_url) setLogoPreview(res.data.company_logo_url)
      } else {
        toast.error("Could not load job details")
        router.push("/dashboard/poster/my-jobs")
      }
      setLoading(false)
    }
    load()
  }, [jobId, router])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo must be less than 2MB")
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const toastId = toast.loading("Updating listing...")

    const formData = new FormData(e.currentTarget)
    
    try {
      let finalLogoUrl = undefined

      if (logoFile) {
        const uploadData = new FormData()
        uploadData.append("file", logoFile)
        uploadData.append("upload_preset", "kbueeplv") 
        
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/image/upload`, {
          method: "POST",
          body: uploadData
        })
        const uploadJson = await uploadRes.json()
        if (uploadJson.secure_url) finalLogoUrl = uploadJson.secure_url
      }

      const result = await updateJobAction(jobId, formData, finalLogoUrl)

      if (result.success) {
        toast.success("Job updated successfully!", { id: toastId })
        router.push("/dashboard/poster/my-jobs")
      } else {
        toast.error(result.error || "Update failed", { id: toastId })
      }
    } catch (err) {
      toast.error("Network error", { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1C3FA4] animate-spin mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Job Data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 font-sans text-slate-900 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold uppercase tracking-wider shadow-sm">
          <Pencil className="w-3 h-3" /> Edit Mode
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Edit <span className="text-[#1C3FA4]">Listing</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm max-w-lg leading-relaxed">
            Update job details, requirements, or compensation. Changes reflect immediately.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-24">
        
        {/* DETAILS CARD */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Job Title</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                <Input name="title" defaultValue={jobData.title} required className="h-14 pl-11 rounded-2xl border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Department</label>
              <div className="relative group">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select name="category" defaultValue={jobData.department} required className="w-full h-14 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 outline-none text-sm appearance-none cursor-pointer transition-all">
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Product">Product</option>
                  <option value="Operations">Operations</option>
                  <option value="HR">HR & Legal</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Job Type</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select name="type" defaultValue={jobData.type} required className="w-full h-14 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 outline-none text-sm appearance-none cursor-pointer transition-all">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Location</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                <Input name="location" defaultValue={jobData.location} required className="h-14 pl-11 rounded-2xl border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Salary Range</label>
              <div className="relative group">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                <Input name="salary" defaultValue={jobData.salary_range} className="h-14 pl-11 rounded-2xl border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all" />
              </div>
            </div>
          </div>

          {/* Description & Logo */}
          <div className="flex flex-col md:flex-row gap-8 pt-6 border-t border-slate-50">
             <div className="space-y-2.5 flex-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-2">
                  <AlignLeft className="w-3.5 h-3.5 text-[#1C3FA4]" /> Job Description & Requirements
                </label>
                <Textarea 
                  name="description" 
                  defaultValue={jobData.description}
                  required 
                  className="min-h-[250px] rounded-[1.8rem] border-slate-200 bg-white p-6 text-slate-900 font-medium focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all leading-relaxed"
                />
             </div>
             
             <div className="w-full md:w-48 space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Logo</label>
                <div className="relative group w-full aspect-square">
                  <div className="absolute inset-0 rounded-[1.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-[#1C3FA4] group-hover:bg-blue-50/30 cursor-pointer shadow-inner">
                    {logoPreview ? (
                      <img src={logoPreview} className="w-full h-full object-cover" alt="Logo preview" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-[#1C3FA4] transition-colors" />
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoChange} />
                  </div>
                </div>
                <p className="text-xs text-center text-slate-400 font-medium">Update to change</p>
             </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-8 left-0 right-0 z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-white/80 backdrop-blur-md border border-blue-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                Save Changes
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Updates will be visible immediately.</p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="flex-1 md:flex-none h-14 px-8 rounded-2xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
                Cancel
            </Button>
            <Button 
                type="submit" 
                disabled={saving}
                className="flex-1 md:flex-none h-14 px-10 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-blue-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-none"
            >
                {saving ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
                ) : (
                <>Update Job <ArrowRight className="w-4 h-4" /></>
                )}
            </Button>
          </div>
        </div>

      </form>
    </div>
  )
}