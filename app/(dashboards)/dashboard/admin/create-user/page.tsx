"use client"

import * as React from "react"
import { 
  UserPlus, Mail, ShieldCheck, ArrowRight, 
  Loader2, ShieldAlert, User, Briefcase, 
  Shield, Crown, CheckCircle2, RefreshCcw,
  FileText, LayoutGrid, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createUserAction } from "@/app/actions/create-user"
import { toast } from "sonner"

export default function CreateUserPage() {
  const [loading, setLoading] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState("candidate")
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [lastCreated, setLastCreated] = React.useState({ email: "", name: "" })

  const roles = [
    { id: "candidate", label: "Candidate", desc: "Standard Access", icon: User },
    { id: "referrer", label: "Referrer", desc: "Partner Tier", icon: Briefcase },
    { id: "job_poster", label: "Job Poster", desc: "Listing Manager", icon: FileText },
    { id: "admin", label: "Admin", desc: "Management", icon: Shield },
    { id: "super_admin", label: "Super Admin", desc: "System Root", icon: Crown }
  ]

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    
    const formData = new FormData(event.currentTarget)
    formData.append("role", selectedRole)
    const email = formData.get("email") as string
    const fullName = formData.get("fullName") as string

    try {
      const result = await createUserAction(formData, "super_admin") 
      
      if (result.success) {
        setLastCreated({ email, name: fullName })
        setShowSuccess(true)
        toast.success("User provisioned successfully")
        // Reset form data manually if needed or just use the success view
      } else {
        toast.error(result.error || "Failed to create user")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowSuccess(false)
    setSelectedRole("candidate")
    setLastCreated({ email: "", name: "" })
  }

  // --- SUCCESS VIEW (Card) ---
  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center shadow-2xl shadow-blue-900/5 space-y-8 relative overflow-hidden">
          {/* Decorative Background Blur */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[#1C3FA4]" />
          
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm ring-1 ring-emerald-100">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Provisioning Complete</h2>
            <p className="text-slate-500 font-medium text-base">
              The identity for <span className="text-[#1C3FA4] font-semibold">{lastCreated.name}</span> is now active.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Network ID</span>
              <span className="text-sm font-semibold text-slate-900 font-mono">{lastCreated.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={resetForm}
              className="w-full h-14 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Provision Another Identity
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // --- FORM VIEW ---
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-10 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1C3FA4] border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> Secure Protocol
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Provision <span className="text-[#1C3FA4]">Identity</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm max-w-lg leading-relaxed">
            Initialize a new secure account. Credentials will be automatically dispatched via enterprise mail.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 space-y-12 relative overflow-hidden">
        
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* 1. ROLE SELECTION */}
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-[#1C3FA4] rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-900">Access Level</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-start p-5 rounded-[1.5rem] border-2 text-left transition-all duration-200 relative group outline-none focus:ring-4 focus:ring-blue-100 ${
                  selectedRole === role.id 
                    ? "border-[#1C3FA4] bg-white shadow-lg shadow-blue-900/5 ring-1 ring-[#1C3FA4]" 
                    : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-md"
                }`}
              >
                {selectedRole === role.id && (
                  <div className="absolute top-4 right-4 text-[#1C3FA4] animate-in zoom-in duration-200">
                    <CheckCircle2 className="w-5 h-5 fill-blue-50" />
                  </div>
                )}
                
                <div className={`p-3 rounded-2xl mb-4 transition-colors duration-200 ${
                  selectedRole === role.id 
                    ? "bg-[#1C3FA4] text-white shadow-md shadow-blue-600/20" 
                    : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#1C3FA4]"
                }`}>
                  <role.icon className="w-5 h-5" />
                </div>
                
                <div className="space-y-1">
                  <p className={`font-bold text-sm uppercase tracking-tight ${selectedRole === role.id ? "text-slate-900" : "text-slate-600"}`}>
                    {role.label}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {role.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-slate-100 w-full" />

        {/* 2. PERSONAL DETAILS */}
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-[#1C3FA4] rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Legal Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                <Input 
                  name="fullName" 
                  placeholder="e.g. Alexander Pierce" 
                  required 
                  className="pl-11 h-14 rounded-2xl border-slate-200 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Enterprise Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                <Input 
                  name="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  className="pl-11 h-14 rounded-2xl border-slate-200 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-slate-100 w-full" />

        {/* 3. ORGANIZATIONAL HIERARCHY */}
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-[#1C3FA4] rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-900">Organizational Alignment</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { id: 'vibhaaga', label: 'Vibhaaga', ph: 'Region Code...' },
              { id: 'khanda', label: 'Khanda', ph: 'Zone Code...' },
              { id: 'valaya', label: 'Valaya', ph: 'Sector Code...' },
              { id: 'milan', label: 'Milan', ph: 'Unit Code...' }
            ].map((field) => (
              <div key={field.id} className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">{field.label}</label>
                <div className="relative group">
                  <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#1C3FA4] transition-colors" />
                  <Input 
                    name={field.id} 
                    placeholder={field.ph} 
                    className="pl-11 h-12 rounded-2xl border-slate-200 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:border-[#1C3FA4] focus:ring-2 focus:ring-blue-50 transition-all" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INFO BOX */}
        <div className="p-6 rounded-[1.5rem] bg-blue-50 border border-blue-100 flex gap-5 items-start">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-blue-100 shadow-sm shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-[#1C3FA4]" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#1C3FA4] uppercase tracking-wide">Security Protocol</p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              A temporary high-entropy password will be generated automatically. The recipient will be forced to reset their credentials upon their first successful login attempt.
            </p>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4">
          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-[1.5rem] font-bold uppercase tracking-wider text-sm shadow-xl shadow-blue-900/10 transition-all active:scale-[0.98] hover:shadow-2xl hover:shadow-blue-900/20 flex items-center justify-center gap-3 border-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Provisioning Identity...
              </>
            ) : (
              <>
                Deploy User Identity <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  )
}