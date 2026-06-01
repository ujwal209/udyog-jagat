"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Briefcase, MapPin, 
  IndianRupee, AlignLeft, ListChecks, 
  UploadCloud, Loader2, ArrowRight,
  ShieldCheck, Zap, Globe, Sparkles, LayoutGrid
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
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-6 font-sans text-foreground animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
          <Zap className="w-3 h-3" /> Recruitment Workflow
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Publish New Listing
        </h1>
        <p className="text-muted-foreground text-sm">
          Initialize an enterprise job posting. Use AI to draft the perfect description.
        </p>
      </div>

      {/* AI BAR */}
      <div className="mb-8 bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-sm font-semibold">AI Content Generator</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Senior React Developer for a Fintech startup in Bangalore..." 
                className="min-h-[80px] border-border bg-background resize-none"
              />
            </div>
            <Button 
              onClick={handleAiGenerate}
              disabled={aiLoading || !prompt}
              className="h-10 px-6 gap-2"
            >
              {aiLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Autofill</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        
        {/* KEY DETAILS CARD */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-semibold text-foreground">Core Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Title</label>
              <div className="relative group">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input ref={titleRef} name="title" placeholder="e.g. Product Manager" required className="h-10 pl-9 border-border bg-background focus-visible:ring-1" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</label>
              <div className="relative group">
                <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select ref={categoryRef} name="category" required className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm focus-visible:ring-1 focus:outline-none appearance-none">
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Product">Product</option>
                  <option value="Operations">Operations</option>
                  <option value="HR">HR & Legal</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Type</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select ref={typeRef} name="type" required className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm focus-visible:ring-1 focus:outline-none appearance-none">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input ref={locRef} name="location" placeholder="e.g. Bengaluru, Karnataka" required className="h-10 pl-9 border-border bg-background focus-visible:ring-1" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salary Range</label>
              <div className="relative group">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input ref={salaryRef} name="salary" placeholder="e.g. 12,00,000 - 18,00,000 PA" className="h-10 pl-9 border-border bg-background focus-visible:ring-1" />
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPTION & LOGO CARD */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-semibold text-foreground">Description & Assets</h3>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
               <div className="space-y-2 flex-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <AlignLeft className="w-3.5 h-3.5" /> Job Description
                  </label>
                  <Textarea 
                    ref={descRef}
                    name="description" 
                    required 
                    placeholder="Overview of the role, responsibilities, and mission..." 
                    className="min-h-[200px] border-border bg-background focus-visible:ring-1"
                  />
               </div>
               
               {/* Logo Upload - Compact */}
               <div className="w-full md:w-48 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Logo</label>
                  <div className="relative group w-full aspect-square">
                    <div className="absolute inset-0 rounded-md bg-secondary border border-dashed border-border flex flex-col items-center justify-center overflow-hidden transition-all duration-300 hover:border-primary hover:bg-secondary/50 cursor-pointer">
                      {logoPreview ? (
                        <img src={logoPreview} className="w-full h-full object-cover" alt="Logo preview" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoChange} />
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Max 2MB</p>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ListChecks className="w-3.5 h-3.5" /> Requirements (Appended to Description)
              </label>
              <Textarea 
                ref={reqRef}
                name="requirements" 
                placeholder="List required skills, education, and experience..." 
                className="min-h-[140px] border-border bg-background focus-visible:ring-1"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-4 left-0 right-0 z-10 flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-card/90 backdrop-blur-md border border-border rounded-lg shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center border border-border shrink-0">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                Ready to Publish <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </p>
              <p className="text-xs text-muted-foreground">Your listing will be instantly visible to all candidates.</p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
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