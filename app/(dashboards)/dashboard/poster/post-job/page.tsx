"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Briefcase, MapPin, 
  IndianRupee, AlignLeft, ListChecks, 
  UploadCloud, Loader2, ArrowRight,
  ShieldCheck, Zap, Globe, Info, Sparkles, LayoutGrid
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createPosterJobAction } from "@/app/actions/poster-job-actions"
import { generateJobDetailsWithAIAction } from "@/app/actions/poster-job-generation-ai"

export default function PostJobPage() {
  const [loading, setLoading] = React.useState(false)
  const [aiLoading, setAiLoading] = React.useState(false)
  const [prompt, setPrompt] = React.useState("") 
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const router = useRouter()

  // Form Refs
  const titleRef = React.useRef<HTMLInputElement>(null)
  const categoryRef = React.useRef<HTMLSelectElement>(null)
  const typeRef = React.useRef<HTMLSelectElement>(null)
  const descRef = React.useRef<HTMLTextAreaElement>(null)
  const reqRef = React.useRef<HTMLTextAreaElement>(null)
  const salaryRef = React.useRef<HTMLInputElement>(null)
  const locRef = React.useRef<HTMLInputElement>(null)

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

  // --- AI GENERATION ---
  const handleAiGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first")
      return
    }
    setAiLoading(true)
    const toastId = toast.loading("Generating job details with AI...")

    try {
      const result = await generateJobDetailsWithAIAction(prompt)
      
      if (result.success && result.data) {
        if (titleRef.current) titleRef.current.value = result.data.title
        if (categoryRef.current) categoryRef.current.value = result.data.category
        if (typeRef.current) typeRef.current.value = result.data.type
        if (descRef.current) descRef.current.value = result.data.description
        if (reqRef.current) reqRef.current.value = result.data.requirements
        // AI doesn't always guess salary/loc accurately, but we can try if returned
        
        toast.success("Form autofilled successfully!", { id: toastId })
      } else {
        toast.error("AI could not generate details.", { id: toastId })
      }
    } catch (err) {
      toast.error("AI Service Unavailable", { id: toastId })
    } finally {
      setAiLoading(false)
    }
  }

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading("Deploying job to network...", {
      description: "Uploading assets and syncing database."
    })

    const formData = new FormData(e.currentTarget)
    
    try {
      let finalLogoUrl = ""
      
      // Cloudinary Upload
      if (logoFile) {
        const uploadData = new FormData()
        uploadData.append("file", logoFile)
        uploadData.append("upload_preset", "kbueeplv") 
        
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/image/upload`, {
          method: "POST",
          body: uploadData
        })
        
        const uploadJson = await uploadRes.json()
        if (uploadJson.secure_url) {
          finalLogoUrl = uploadJson.secure_url
        } else {
          throw new Error("Logo upload failed")
        }
      }

      // Server Action
      const result = await createPosterJobAction(formData, finalLogoUrl)

      if (result.success) {
        toast.success("Job Listing Live!", { 
          id: toastId,
          description: "Redirecting to your listings...",
          duration: 3000
        })
        setTimeout(() => {
          router.push("/dashboard/poster/my-jobs")
        }, 1500)
      } else {
        console.error("Action Error:", result.error)
        toast.error(result.error || "Failed to create job", { id: toastId })
        setLoading(false)
      }

    } catch (err: any) {
      console.error("Submission Error:", err)
      toast.error("Network error. Please try again.", { id: toastId })
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 font-sans text-slate-900 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1C3FA4] border border-blue-100 text-[10px] font-bold uppercase tracking-wider shadow-sm">
          <Zap className="w-3.5 h-3.5" /> Recruitment Workflow
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Publish <span className="text-[#1C3FA4]">New Listing</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm max-w-lg leading-relaxed">
            Initialize an enterprise job posting. Use AI to draft the perfect description.
          </p>
        </div>
      </div>

      {/* AI BAR */}
      <div className="mb-12 bg-gradient-to-r from-[#1C3FA4] to-[#152d75] rounded-[2rem] p-8 shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-blue-100">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="text-sm font-bold uppercase tracking-widest">AI Content Generator</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Senior React Developer for a Fintech startup in Bangalore..." 
                className="h-14 pl-6 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-blue-200/70 focus:bg-white/20 focus:border-white focus:ring-0 transition-all font-medium backdrop-blur-sm"
              />
            </div>
            <Button 
              onClick={handleAiGenerate}
              disabled={aiLoading || !prompt}
              className="h-14 px-8 bg-white text-[#1C3FA4] hover:bg-blue-50 rounded-2xl font-bold uppercase tracking-wide text-xs shadow-lg transition-all active:scale-95"
            >
              {aiLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Magic Autofill</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-24">
        
        {/* KEY DETAILS CARD */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-10">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 bg-[#1C3FA4] rounded-full" />
            <h3 className="text-lg font-semibold text-slate-900">Core Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Job Title</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                <Input ref={titleRef} name="title" placeholder="e.g. Product Manager" required className="h-14 pl-11 rounded-2xl border-slate-200 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Department</label>
              <div className="relative group">
                <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                <select ref={categoryRef} name="category" required className="w-full h-14 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 outline-none text-sm appearance-none cursor-pointer transition-all">
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
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select ref={typeRef} name="type" required className="w-full h-14 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 outline-none text-sm appearance-none cursor-pointer transition-all">
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
                <Input ref={locRef} name="location" placeholder="e.g. Bengaluru, Karnataka" required className="h-14 pl-11 rounded-2xl border-slate-200 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Salary Range</label>
              <div className="relative group">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                <Input ref={salaryRef} name="salary" placeholder="e.g. 12,00,000 - 18,00,000 PA" className="h-14 pl-11 rounded-2xl border-slate-200 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPTION & LOGO CARD */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-10">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 bg-[#1C3FA4] rounded-full" />
            <h3 className="text-lg font-semibold text-slate-900">Description & Assets</h3>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
               <div className="space-y-2.5 flex-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-2">
                    <AlignLeft className="w-3.5 h-3.5 text-[#1C3FA4]" /> Job Description
                  </label>
                  <Textarea 
                    ref={descRef}
                    name="description" 
                    required 
                    placeholder="Overview of the role, responsibilities, and mission..." 
                    className="min-h-[200px] rounded-[1.8rem] border-slate-200 bg-white p-6 text-slate-900 font-medium placeholder:text-slate-400 focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all leading-relaxed"
                  />
               </div>
               
               {/* Logo Upload - Compact */}
               <div className="w-full md:w-48 space-y-2.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Company Logo</label>
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
                  <p className="text-xs text-center text-slate-400 font-medium">Max 2MB</p>
               </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-2">
                <ListChecks className="w-3.5 h-3.5 text-[#1C3FA4]" /> Requirements (Appended to Description)
              </label>
              <Textarea 
                ref={reqRef}
                name="requirements" 
                placeholder="List required skills, education, and experience..." 
                className="min-h-[140px] rounded-[1.8rem] border-slate-200 bg-white p-6 text-slate-900 font-medium placeholder:text-slate-400 focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-8 left-0 right-0 z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-white/80 backdrop-blur-md border border-blue-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#1C3FA4]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                Ready to Publish <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Your listing will be instantly visible to all candidates.</p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto h-16 px-12 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-blue-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : (
              <>Deploy Opportunity <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>

      </form>
    </div>
  )
}