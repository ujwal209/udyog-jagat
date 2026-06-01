"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  Briefcase, MapPin, 
  IndianRupee, AlignLeft, UploadCloud, 
  Loader2, ArrowRight, ShieldCheck, Globe, Pencil, LayoutGrid
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
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest">Loading Job Data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-6 font-sans text-foreground animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
          <Pencil className="w-3 h-3" /> Edit Mode
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Edit Listing
        </h1>
        <p className="text-muted-foreground text-sm">
          Update job details, requirements, or compensation. Changes reflect immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        
        {/* DETAILS CARD */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-semibold text-foreground">Core Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Title</label>
              <div className="relative group">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input name="title" defaultValue={jobData.title} required className="h-10 pl-9 border-border bg-background focus-visible:ring-1" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</label>
              <div className="relative group">
                <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select name="category" defaultValue={jobData.department} required className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm focus-visible:ring-1 focus:outline-none appearance-none">
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
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <select name="type" defaultValue={jobData.type} required className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm focus-visible:ring-1 focus:outline-none appearance-none">
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
                <Input name="location" defaultValue={jobData.location} required className="h-10 pl-9 border-border bg-background focus-visible:ring-1" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salary Range</label>
              <div className="relative group">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input name="salary" defaultValue={jobData.salary_range} className="h-10 pl-9 border-border bg-background focus-visible:ring-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Description & Logo */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-semibold text-foreground">Description & Assets</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
             <div className="space-y-2 flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <AlignLeft className="w-3.5 h-3.5" /> Job Description & Requirements
                </label>
                <Textarea 
                  name="description" 
                  defaultValue={jobData.description}
                  required 
                  className="min-h-[250px] border-border bg-background focus-visible:ring-1"
                />
             </div>
             
             <div className="w-full md:w-48 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logo</label>
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
                <p className="text-xs text-center text-muted-foreground">Update to change</p>
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
                Save Changes
              </p>
              <p className="text-xs text-muted-foreground">Updates will be visible immediately.</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 md:flex-none"
            >
                Cancel
            </Button>
            <Button 
                type="submit" 
                disabled={saving}
                className="flex-1 md:flex-none gap-2"
            >
                {saving ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
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