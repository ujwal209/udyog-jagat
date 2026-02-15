"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  ShieldCheck, UserCircle, ArrowRight, Loader2, 
  CheckCircle2, UploadCloud, Lock, MapPin, Phone, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { updatePasswordAction, completeOnboardingAction } from "@/app/actions/onboarding-actions"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1) 
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    password: "",
    confirmPassword: "",
    full_name: "", // <--- Added State
    age: "",
    phone: "",
    address: "",
    resume_url: "",
    avatar_url: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // --- STEP 1: SECURITY ---
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setLoading(false)
      return toast.error("Passwords do not match")
    }

    const passData = new FormData()
    passData.append("password", formData.password)
    passData.append("confirmPassword", formData.confirmPassword)

    const res = await updatePasswordAction(passData)
    setLoading(false)

    if (res.success) {
      toast.success("Security Updated")
      setStep(2) 
    } else {
      toast.error(res.error)
    }
  }

  // --- CLOUDINARY UPLOAD HANDLER ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'resume_url' | 'avatar_url') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "kbueeplv") // Your Preset

    try {
      // Use 'auto' resource type to handle both Images (Avatar) and Raw files (PDFs)
      const res = await fetch(`https://api.cloudinary.com/v1_1/drjq6b6xb/auto/upload`, {
        method: "POST", body: data
      })
      
      if (!res.ok) throw new Error("Upload failed")

      const json = await res.json()
      setFormData(prev => ({ ...prev, [field]: json.secure_url }))
      toast.success(field === 'avatar_url' ? "Photo Uploaded" : "Resume Attached")
    } catch (err) {
      console.error(err)
      toast.error("Upload Failed", { description: "Please try a smaller file or different format." })
    } finally {
      setUploading(false)
    }
  }

  // --- STEP 2: PROFILE ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.resume_url) return toast.error("Resume Required", { description: "Please upload your resume." })
    
    setLoading(true)
    const submitData = new FormData()
    submitData.append("full_name", formData.full_name) // <--- Added
    submitData.append("age", formData.age)
    submitData.append("phone", formData.phone)
    submitData.append("address", formData.address)
    submitData.append("resume_url", formData.resume_url)
    submitData.append("avatar_url", formData.avatar_url)

    const res = await completeOnboardingAction(submitData)
    
    if (res.success) {
      toast.success("Welcome Aboard!", { description: "Redirecting to dashboard..." })
      router.push("/dashboard/candidate") 
    } else {
      toast.error(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      
      {/* --- LEFT: BRANDING & STEPS --- */}
      <div className="lg:w-[45%] bg-[#1C3FA4] p-10 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-[#1C3FA4] to-[#0f256e] z-0" />
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
         
         <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-wider">
               <ShieldCheck className="w-3.5 h-3.5" /> Secure Onboarding
            </div>
            <div>
               <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Welcome to <br/> Udyog Jagat.</h1>
               <p className="text-blue-100 text-lg max-w-md leading-relaxed">
                 Complete your setup to access exclusive job opportunities tailored for you.
               </p>
            </div>
         </div>

         <div className="relative z-10 space-y-8 mt-12 lg:mt-0">
            <StepItem number={1} label="Security Setup" active={step === 1} completed={step > 1} description="Secure your account with a strong password." />
            <StepItem number={2} label="Profile Details" active={step === 2} completed={false} description="Add your contact info and resume." />
         </div>

         <div className="relative z-10 text-[10px] text-blue-300/60 uppercase tracking-widest mt-12 lg:mt-0">
            © 2026 Udyog Jagat Platform
         </div>
      </div>

      {/* --- RIGHT: FORM AREA --- */}
      <div className="lg:w-[55%] flex items-center justify-center p-6 lg:p-16 bg-white overflow-y-auto">
         <div className="w-full max-w-md space-y-8">
            
            <div className="space-y-2">
               <h2 className="text-2xl font-bold text-slate-900">
                 {step === 1 ? "Set Your Password" : "Complete Profile"}
               </h2>
               <p className="text-slate-500 text-sm">
                 {step === 1 ? "Create a secure password to access your dashboard." : "Tell us a bit about yourself."}
               </p>
            </div>

            <form onSubmit={step === 1 ? handleSecuritySubmit : handleProfileSubmit} className="space-y-6">
               
               {/* STEP 1 FIELDS */}
               {step === 1 && (
                 <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</label>
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            name="password" type="password" required 
                            value={formData.password} onChange={handleChange}
                            className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1C3FA4]/20 focus:border-[#1C3FA4] transition-all" 
                            placeholder="Min 6 characters"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            name="confirmPassword" type="password" required 
                            value={formData.confirmPassword} onChange={handleChange}
                            className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1C3FA4]/20 focus:border-[#1C3FA4] transition-all" 
                            placeholder="Re-enter password"
                          />
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 2 FIELDS */}
               {step === 2 && (
                 <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                    
                    {/* Avatar Upload */}
                    <div className="flex justify-center mb-4">
                       <label className="relative group cursor-pointer">
                          <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden hover:border-[#1C3FA4] transition-all">
                             {formData.avatar_url ? (
                               <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                             ) : (
                               <UserCircle className="w-8 h-8 text-slate-300 group-hover:text-[#1C3FA4]" />
                             )}
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#1C3FA4] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm min-w-[80px] text-center">
                             {uploading ? "..." : "Add Photo"}
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar_url')} />
                       </label>
                    </div>

                    {/* NEW: Full Name Field */}
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Legal Name</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            name="full_name" required 
                            value={formData.full_name} onChange={handleChange}
                            className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#1C3FA4]" placeholder="e.g. Rahul Sharma" 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Age</label>
                          <Input 
                            name="age" type="number" required 
                            value={formData.age} onChange={handleChange}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#1C3FA4]" placeholder="24" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone</label>
                          <Input 
                            name="phone" required 
                            value={formData.phone} onChange={handleChange}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#1C3FA4]" placeholder="+91..." 
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Address</label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            name="address" required 
                            value={formData.address} onChange={handleChange}
                            className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#1C3FA4]" placeholder="Full residential address" 
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Resume (PDF)</label>
                       <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${formData.resume_url ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${formData.resume_url ? "bg-emerald-100 text-emerald-600" : "bg-blue-50 text-[#1C3FA4]"}`}>
                               <UploadCloud className="w-5 h-5" />
                             </div>
                             <div className="text-left">
                               <p className={`text-sm font-semibold ${formData.resume_url ? "text-emerald-900" : "text-slate-700"}`}>
                                 {formData.resume_url ? "Resume Attached" : "Upload Resume"}
                               </p>
                             </div>
                          </div>
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : formData.resume_url && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'resume_url')} />
                       </label>
                    </div>
                 </div>
               )}

               <div className="pt-4">
                 <Button 
                   type="submit" 
                   disabled={loading || uploading}
                   className="w-full h-12 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                     <span className="flex items-center gap-2">
                       {step === 1 ? "Save & Continue" : "Finish Setup"} 
                       <ArrowRight className="w-4 h-4" />
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

// --- HELPER COMPONENT ---
function StepItem({ number, label, active, completed, description }: any) {
  return (
    <div className={`flex gap-4 ${active ? "opacity-100" : "opacity-60"}`}>
       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all shrink-0 ${
         completed ? "bg-emerald-500 border-emerald-500 text-white" : 
         active ? "bg-white text-[#1C3FA4] border-white" : "border-white/30 text-white"
       }`}>
         {completed ? <CheckCircle2 className="w-5 h-5" /> : number}
       </div>
       <div>
          <h4 className="text-lg font-bold text-white leading-none mb-1">{label}</h4>
          <p className="text-sm text-blue-100/80 font-medium leading-tight">{description}</p>
       </div>
    </div>
  )
}