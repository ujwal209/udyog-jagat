"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Briefcase, MapPin, Layers, Loader2, Calendar, 
  ArrowLeft, Save, CheckCircle2, User, Mail, UploadCloud, Image as ImageIcon, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getJobById, updateJobAction } from "@/app/actions/job-actions"

export default function EditJobPage({ params }: { params: any }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploadingLogo, setUploadingLogo] = React.useState(false)
  
  // Unwrap params safely
  const unwrappedParams = React.use(params) as { id: string }
  const jobId = unwrappedParams?.id

  const [job, setJob] = React.useState<any>({
    title: "",
    department: "",
    type: "Full-Time",
    location: "",
    city: "",
    state: "",
    salary_min: "",
    salary_max: "",
    description: "",
    status: "active",
    hiring_manager: "",
    contact_email: "",
    company_logo_url: ""
  })

  // --- FETCH JOB DETAILS ---
  React.useEffect(() => {
    let isMounted = true
    
    async function fetchJob() {
      if (!jobId) return setLoading(false)

      try {
        const data = await getJobById(jobId)
        
        if (!isMounted) return

        if (data) {
          // Parse salary range
          let min = "", max = ""
          if (data.salary_range) {
             const parts = data.salary_range.replace(" LPA", "").split(" - ")
             if (parts.length === 2) {
               min = parts[0]
               max = parts[1]
             }
          }

          setJob({
            ...data,
            salary_min: min,
            salary_max: max
          })
        } else {
          toast.error("Job not found")
          router.push("/dashboard/admin/posted-jobs")
        }
      } catch (error) {
        toast.error("Failed to fetch job details")
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    fetchJob()
    return () => { isMounted = false }
  }, [jobId, router])

  // --- LOGO UPLOAD HANDLER ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "kbueeplv") 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/image/upload`, {
        method: "POST",
        body: formData
      })
      
      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      setJob((prev: any) => ({ ...prev, company_logo_url: data.secure_url }))
      toast.success("Logo uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingLogo(false)
    }
  }

  const removeLogo = () => {
    setJob((prev: any) => ({ ...prev, company_logo_url: "" }))
  }

  // --- HANDLE SUBMIT ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append("id", jobId)
    // Manually append logo URL since it's controlled state, not a visible input
    formData.append("company_logo_url", job.company_logo_url || "")
    
    const res = await updateJobAction(formData)
    setSaving(false)

    if (res.success) {
      toast.success("Job updated successfully")
      router.push("/dashboard/admin/posted-jobs")
    } else {
      toast.error(res.error || "Failed to update job")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setJob({ ...job, [e.target.name]: e.target.value })
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1C3FA4]" />
        <p className="text-sm font-medium">Retrieving job details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-6 lg:p-10 max-w-7xl mx-auto">
      
      <form id="edit-job-form" onSubmit={handleSubmit}>
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-100 pb-6">
           <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Link href="/dashboard/admin/posted-jobs" className="text-slate-400 hover:text-[#1C3FA4] transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Job Details</h1>
              </div>
              <p className="text-sm text-slate-500 ml-7">Update information for <span className="font-semibold text-slate-700">{job.title || "Untitled Role"}</span></p>
           </div>
           
           <div className="flex items-center gap-3">
              <Link href="/dashboard/admin/posted-jobs">
                <Button variant="outline" type="button" className="h-10 px-5 rounded-lg border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all">
                   Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={saving}
                className="h-10 px-6 rounded-lg bg-[#1C3FA4] hover:bg-[#152d75] text-white font-semibold shadow-sm transition-all active:scale-95"
              >
                 {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                 {saving ? "Saving..." : "Save Changes"}
              </Button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN - MAIN FORM (Span 8) */}
          <div className="lg:col-span-8 space-y-10">
             
             {/* Section 1: Overview */}
             <section className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-1 bg-[#1C3FA4] rounded-full"></div>
                     <h3 className="text-lg font-bold text-slate-800">Core Details</h3>
                   </div>
                   
                   {/* Status Toggle */}
                   <div className="relative">
                      <select 
                        name="status" 
                        value={job.status} 
                        onChange={handleChange}
                        className={`h-9 pl-3 pr-8 rounded-lg text-xs font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer border ${
                          job.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          job.status === 'closed' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}
                      >
                         <option value="active">Active</option>
                         <option value="closed">Closed</option>
                         <option value="draft">Draft</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className={`w-2 h-2 rounded-full ${
                          job.status === 'active' ? 'bg-emerald-500' : 
                          job.status === 'closed' ? 'bg-slate-400' : 
                          'bg-amber-500'
                        }`} />
                      </div>
                   </div>
                </div>

                <div className="grid gap-6">
                   <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Job Title</label>
                      <Input 
                        name="title" 
                        value={job.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior Backend Engineer" 
                        required 
                        className="h-11 rounded-lg border-slate-200 bg-white text-slate-900 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4]"
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-slate-700">Department</label>
                         <div className="relative">
                            <select 
                              name="department" 
                              value={job.department}
                              onChange={handleChange}
                              className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] appearance-none cursor-pointer"
                            >
                               <option value="" disabled>Select Category</option>
                               <option value="Engineering">Engineering</option>
                               <option value="Product">Product & Design</option>
                               <option value="Marketing">Marketing</option>
                               <option value="Sales">Sales & Operations</option>
                            </select>
                            <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                         </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-slate-700">Employment Type</label>
                         <div className="relative">
                            <select 
                              name="type" 
                              value={job.type}
                              onChange={handleChange}
                              className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] appearance-none cursor-pointer"
                            >
                               <option value="Full-Time">Full-Time</option>
                               <option value="Part-Time">Part-Time</option>
                               <option value="Contract">Contract</option>
                               <option value="Internship">Internship</option>
                            </select>
                            <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                         </div>
                      </div>
                   </div>
                </div>
             </section>

             <div className="h-px bg-slate-100 w-full" />

             {/* Section 2: Compensation */}
             <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <div className="h-6 w-1 bg-[#1C3FA4] rounded-full"></div>
                   <h3 className="text-lg font-bold text-slate-800">Compensation</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Salary Range (Annual LPA)</label>
                      <div className="flex gap-3">
                         <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">MIN</span>
                            <Input 
                              name="salary_min" 
                              value={job.salary_min}
                              onChange={handleChange}
                              placeholder="10" 
                              className="h-11 pl-10 rounded-lg border-slate-200 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4]" 
                            />
                         </div>
                         <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">MAX</span>
                            <Input 
                              name="salary_max" 
                              value={job.salary_max}
                              onChange={handleChange}
                              placeholder="25" 
                              className="h-11 pl-10 rounded-lg border-slate-200 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4]" 
                            />
                         </div>
                      </div>
                   </div>
                </div>
             </section>

             <div className="h-px bg-slate-100 w-full" />

             {/* Section 3: Description */}
             <section className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-[#1C3FA4] rounded-full"></div>
                      <h3 className="text-lg font-bold text-slate-800">Job Description</h3>
                   </div>
                </div>

                <Textarea 
                  name="description" 
                  value={job.description}
                  onChange={handleChange}
                  placeholder="Describe the responsibilities..." 
                  className="min-h-[300px] p-4 rounded-lg border-slate-200 bg-white text-slate-800 text-sm leading-relaxed focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] resize-y shadow-sm"
                />
             </section>
          </div>

          {/* RIGHT COLUMN - SIDEBAR INFO (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* BRANDING CARD (Logo Upload) */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                   <h3 className="text-sm font-bold text-slate-900">Company Branding</h3>
                   {job.company_logo_url && (
                     <button type="button" onClick={removeLogo} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                   )}
                </div>

                <div className="flex flex-col items-center gap-4">
                   <div className="relative group w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden hover:border-[#1C3FA4] transition-colors">
                      {uploadingLogo ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#1C3FA4]" />
                      ) : job.company_logo_url ? (
                        <img src={job.company_logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-center p-2">
                           <ImageIcon className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                           <span className="text-[9px] text-slate-400 font-bold uppercase">Upload Logo</span>
                        </div>
                      )}
                      
                      {/* Hidden Input Trigger */}
                      <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/5 transition-colors">
                         <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                      </label>
                   </div>
                   
                   <p className="text-[10px] text-slate-400 text-center leading-tight px-4">
                      Recommended: 200x200px PNG or JPG. Max 2MB.
                   </p>
                </div>
             </div>

             {/* Location Card */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                   <MapPin className="w-5 h-5 text-[#1C3FA4]" />
                   <h3 className="text-sm font-bold text-slate-900">Location</h3>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Office Address</label>
                      <Input 
                        name="location"
                        value={job.location}
                        onChange={handleChange}
                        placeholder="e.g. 102, Tech Park" 
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1C3FA4]" 
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-xs font-semibold text-slate-600">City</label>
                         <Input 
                           name="city"
                           value={job.city}
                           onChange={handleChange}
                           placeholder="Bengaluru" 
                           className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1C3FA4]" 
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-xs font-semibold text-slate-600">State</label>
                         <Input 
                           name="state"
                           value={job.state}
                           onChange={handleChange}
                           placeholder="Karnataka" 
                           className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1C3FA4]" 
                         />
                      </div>
                   </div>
                </div>
             </div>

             {/* Hiring Contact Card */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                   <User className="w-5 h-5 text-[#1C3FA4]" />
                   <h3 className="text-sm font-bold text-slate-900">Hiring Manager</h3>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Name</label>
                      <Input 
                        name="hiring_manager"
                        value={job.hiring_manager}
                        onChange={handleChange}
                        placeholder="Manager Name" 
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1C3FA4]" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Email</label>
                      <div className="relative">
                         <Input 
                           name="contact_email"
                           value={job.contact_email}
                           onChange={handleChange}
                           placeholder="careers@company.com" 
                           className="h-10 pl-9 rounded-lg border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1C3FA4]" 
                         />
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                   </div>
                </div>
             </div>

             {/* Update Info Widget */}
             <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1C3FA4] shrink-0" />
                <div>
                   <h4 className="text-sm font-bold text-[#1C3FA4]">Update Live</h4>
                   <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                      Changes made here will be reflected immediately on the public job board.
                   </p>
                </div>
             </div>

          </div>

        </div>
      </form>
    </div>
  )
}