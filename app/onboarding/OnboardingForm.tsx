"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  ShieldCheck, UserCircle, ArrowRight, Loader2, 
  CheckCircle2, UploadCloud, MapPin, Phone, User,
  Briefcase, Building, Globe, Layers, Link as LinkIcon, Image as ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { completeOnboardingAction } from "@/app/actions/onboarding-actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OnboardingForm({ role }: { role: string }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [step, setStep] = React.useState(1)
  
  const [formData, setFormData] = React.useState({
    full_name: "",
    age: "",
    phone: "",
    address: "",
    resume_url: "",
    avatar_url: "",
    headline: "",
    experience_years: "",
    skills: "",
    portfolio_url: "",
    linkedin_url: "",
    company_name: "",
    company_website: "",
    company_logo: "",
    designation: "",
    company_size: "1-10",
    industry: "Technology",
    vibhaaga: ""
  })

  // Autocomplete State
  const [query, setQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  React.useEffect(() => {
    async function fetchCompanies() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([])
        return
      }
      try {
        const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${debouncedQuery}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data)
        }
      } catch (err) {
        console.error("Autocomplete error:", err)
      }
    }
    fetchCompanies()
  }, [debouncedQuery])

  const selectCompany = (company: any) => {
    setFormData(prev => ({
      ...prev,
      company_name: company.name,
      company_website: company.domain,
      company_logo: company.logo,
    }))
    setQuery(company.name)
    setShowSuggestions(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'resume_url' | 'avatar_url' | 'company_logo') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "kbueeplv")

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/auto/upload`, {
        method: "POST", body: data
      })
      if (!res.ok) throw new Error("Upload failed")

      const json = await res.json()
      setFormData(prev => ({ ...prev, [field]: json.secure_url }))
      toast.success(field === 'resume_url' ? "Resume Attached" : "Image Uploaded")
    } catch (err) {
      console.error(err)
      toast.error("Upload Failed", { description: "Please try a smaller file or different format." })
    } finally {
      setUploading(false)
    }
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (role === 'job_seeker' && !formData.resume_url) return toast.error("Resume Required", { description: "Please upload your resume." })
    
    setLoading(true)
    const submitData = new FormData()
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value) submitData.append(key, value as string)
    })

    const res = await completeOnboardingAction(submitData)
    
    if (res.success) {
      toast.success("Welcome Aboard!", { description: "Redirecting to dashboard..." })
      router.push(res.redirect || "/dashboard") 
    } else {
      toast.error(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col lg:flex-row overflow-hidden">
      
      {/* --- LEFT: BRANDING --- */}
      <div className="hidden lg:flex lg:w-[40%] bg-primary p-12 flex-col justify-between text-primary-foreground relative">
         <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 z-0" />
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
         
         <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-wider">
               <ShieldCheck className="w-3.5 h-3.5" /> Secure Onboarding
            </div>
            <div>
               <h1 className="text-5xl font-black tracking-tight mb-4">Complete your Profile.</h1>
               <p className="text-primary-foreground/80 text-lg max-w-md leading-relaxed font-medium">
                 {role === 'job_seeker' 
                   ? "A detailed profile dramatically increases your chances of getting hired by top-tier companies."
                   : "Detailed company profiles attract the best talent. Let candidates know what you stand for."}
               </p>
            </div>
         </div>

         {/* Steps Indicator */}
         <div className="relative z-10 space-y-6">
            <div className={`flex gap-4 items-center transition-opacity ${step === 1 ? 'opacity-100' : 'opacity-50'}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 shrink-0 ${step === 1 ? 'bg-white text-primary border-white' : 'border-white text-white'}`}>1</div>
               <div><h4 className="text-lg font-bold">Basic Information</h4></div>
            </div>
            <div className={`flex gap-4 items-center transition-opacity ${step === 2 ? 'opacity-100' : 'opacity-50'}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 shrink-0 ${step === 2 ? 'bg-white text-primary border-white' : 'border-white text-white'}`}>2</div>
               <div><h4 className="text-lg font-bold">Professional Details</h4></div>
            </div>
         </div>

         <div className="relative z-10 text-[10px] text-primary-foreground/60 uppercase tracking-widest font-bold">
            © {new Date().getFullYear()} Udyog Jagat Platform
         </div>
      </div>

      {/* --- RIGHT: FORM AREA --- */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 lg:p-16 bg-card h-full overflow-y-auto">
         <div className="w-full max-w-xl space-y-8 pb-10">
            
            <div className="space-y-2">
               <h2 className="text-3xl font-bold text-foreground">
                 {step === 1 ? "Basic Details" : (role === 'job_seeker' ? "Professional Details" : "Company Details")}
               </h2>
               <p className="text-muted-foreground text-sm">
                 Please provide accurate information for verification.
               </p>
            </div>

            <form onSubmit={step === 1 ? handleNext : handleProfileSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               
               {/* STEP 1: Basic Info (Both Roles) */}
               {step === 1 && (
                 <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center justify-center mb-6">
                       <label className="relative group cursor-pointer">
                          <div className="w-28 h-28 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-primary transition-all">
                             {formData.avatar_url ? (
                               <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                             ) : (
                               <UserCircle className="w-10 h-10 text-muted-foreground group-hover:text-primary" />
                             )}
                          </div>
                          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                             {uploading ? "Uploading..." : "Personal Photo"}
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar_url')} />
                       </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Legal Name</label>
                         <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input name="full_name" required value={formData.full_name} onChange={handleChange} className="h-12 pl-11 rounded-xl bg-background" placeholder="Rahul Sharma" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Phone</label>
                         <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input name="phone" required value={formData.phone} onChange={handleChange} className="h-12 pl-11 rounded-xl bg-background" placeholder="+91..." />
                         </div>
                      </div>
                    </div>

                    {role === 'job_seeker' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Age</label>
                           <Input name="age" type="number" required value={formData.age} onChange={handleChange} className="h-12 rounded-xl bg-background" placeholder="24" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Address Location</label>
                           <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input name="address" required value={formData.address} onChange={handleChange} className="h-12 pl-11 rounded-xl bg-background" placeholder="City, State" />
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Designation</label>
                           <div className="relative">
                              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input name="designation" required value={formData.designation} onChange={handleChange} className="h-12 pl-11 rounded-xl bg-background" placeholder="e.g. HR Manager, CEO" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department (Vibhaaga)</label>
                           <div className="relative">
                              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input name="vibhaaga" required value={formData.vibhaaga} onChange={handleChange} className="h-12 pl-11 rounded-xl bg-background" placeholder="e.g. Engineering, HR" />
                           </div>
                        </div>
                      </div>
                    )}
                 </div>
               )}

               {/* STEP 2: Professional Details (Seeker) */}
               {step === 2 && role === 'job_seeker' && (
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Professional Headline</label>
                       <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input name="headline" required value={formData.headline} onChange={handleChange} className="h-12 pl-11 rounded-xl bg-background" placeholder="e.g. Senior Frontend Engineer" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Years of Experience</label>
                         <Input name="experience_years" type="number" required value={formData.experience_years} onChange={handleChange} className="h-12 rounded-xl bg-background" placeholder="e.g. 5" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Skills (Comma separated)</label>
                         <Input name="skills" required value={formData.skills} onChange={handleChange} className="h-12 rounded-xl bg-background" placeholder="React, Node.js" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Portfolio URL (Optional)</label>
                         <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} className="h-12 pl-11 rounded-xl bg-background" placeholder="https://" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">LinkedIn URL (Optional)</label>
                         <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="h-12 pl-11 rounded-xl bg-background" placeholder="https://linkedin.com/in/..." />
                         </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Resume (PDF / DOCX)</label>
                       <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${formData.resume_url ? "border-primary bg-primary/5" : "border-input hover:bg-secondary/50"}`}>
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-lg ${formData.resume_url ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"}`}>
                               <UploadCloud className="w-6 h-6" />
                             </div>
                             <div className="text-left">
                               <p className={`text-sm font-bold ${formData.resume_url ? "text-primary" : "text-foreground"}`}>
                                 {formData.resume_url ? "Resume Attached" : "Upload your Resume"}
                               </p>
                             </div>
                          </div>
                          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : formData.resume_url && <CheckCircle2 className="w-6 h-6 text-primary" />}
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'resume_url')} />
                       </label>
                    </div>
                 </div>
               )}

               {/* STEP 2: Company Details (Poster) */}
               {step === 2 && role === 'job_poster' && (
                 <div className="space-y-6">
                    
                    {/* Autocomplete Company Name */}
                    <div className="space-y-2 relative">
                       <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company Name</label>
                       <div className="relative">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            required 
                            value={query} 
                            onChange={(e) => {
                               setQuery(e.target.value)
                               setFormData({...formData, company_name: e.target.value})
                               setShowSuggestions(true)
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            className="h-12 pl-11 rounded-xl bg-background border-input" 
                            placeholder="Type to search your company..." 
                          />
                       </div>
                       {/* Dropdown Suggestions */}
                       {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-[100%] mt-2 left-0 w-full bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                             {suggestions.map((company: any, i: number) => (
                               <div 
                                 key={i} 
                                 onClick={() => selectCompany(company)}
                                 className="flex items-center gap-3 p-3 hover:bg-secondary cursor-pointer transition-colors border-b border-border/50 last:border-0"
                               >
                                  {company.logo ? (
                                    <img src={company.logo} alt="logo" className="w-8 h-8 rounded-md object-contain bg-white" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center"><Building className="w-4 h-4 text-muted-foreground" /></div>
                                  )}
                                  <div>
                                     <p className="text-sm font-bold">{company.name}</p>
                                     <p className="text-xs text-muted-foreground">{company.domain}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       )}
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company Website</label>
                       <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input name="company_website" required value={formData.company_website} onChange={handleChange} className="h-12 pl-11 rounded-xl bg-background" placeholder="https://" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company Size</label>
                         <Select value={formData.company_size} onValueChange={(val) => handleSelectChange('company_size', val)}>
                           <SelectTrigger className="h-12 rounded-xl bg-background border-input">
                             <SelectValue placeholder="Select size" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="1-10">1-10 Employees</SelectItem>
                             <SelectItem value="11-50">11-50 Employees</SelectItem>
                             <SelectItem value="51-200">51-200 Employees</SelectItem>
                             <SelectItem value="201-500">201-500 Employees</SelectItem>
                             <SelectItem value="500+">500+ Employees</SelectItem>
                           </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Industry</label>
                         <Select value={formData.industry} onValueChange={(val) => handleSelectChange('industry', val)}>
                           <SelectTrigger className="h-12 rounded-xl bg-background border-input">
                             <SelectValue placeholder="Select industry" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="Technology">Technology</SelectItem>
                             <SelectItem value="Healthcare">Healthcare</SelectItem>
                             <SelectItem value="Finance">Finance</SelectItem>
                             <SelectItem value="Education">Education</SelectItem>
                             <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                             <SelectItem value="Retail">Retail</SelectItem>
                             <SelectItem value="Other">Other</SelectItem>
                           </SelectContent>
                         </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company Logo</label>
                       <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${formData.company_logo ? "border-primary bg-primary/5" : "border-input hover:bg-secondary/50"}`}>
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-lg ${formData.company_logo ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"}`}>
                               <ImageIcon className="w-6 h-6" />
                             </div>
                             <div className="text-left">
                               <p className={`text-sm font-bold ${formData.company_logo ? "text-primary" : "text-foreground"}`}>
                                 {formData.company_logo ? "Logo Attached" : "Upload Company Logo"}
                               </p>
                             </div>
                          </div>
                          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : formData.company_logo && <CheckCircle2 className="w-6 h-6 text-primary" />}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'company_logo')} />
                       </label>
                    </div>
                 </div>
               )}

               <div className="pt-6 border-t border-border/50 flex gap-4">
                 {step === 2 && (
                   <Button 
                     type="button" 
                     variant="outline"
                     onClick={() => setStep(1)}
                     className="w-1/3 h-14 rounded-xl font-bold"
                   >
                     Back
                   </Button>
                 )}
                 <Button 
                   type="submit" 
                   disabled={loading || uploading}
                   className={`${step === 1 ? 'w-full' : 'w-2/3'} h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-base shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 transition-all active:scale-[0.98]`}
                 >
                   {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                     <span className="flex items-center gap-2">
                       {step === 1 ? "Next Step" : "Launch your Profile"} <ArrowRight className="w-5 h-5" />
                     </span>
                   )}
                 </Button>
               </div>

            </form>
         </div>
      </div>
    </div>
  )
}