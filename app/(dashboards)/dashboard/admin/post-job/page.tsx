"use client"

import * as React from "react"
import { 
  Briefcase, MapPin, Layers, Loader2, Calendar, 
  Building2, Globe, CheckCircle2, User, Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { postJobAction } from "@/app/actions/job-actions"
import { toast } from "sonner"

export default function PostJobPage() {
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await postJobAction(formData)
    setLoading(false)

    if (res.success) {
      toast.success("Job posted successfully.")
      ;(e.target as HTMLFormElement).reset()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-6 lg:p-10 max-w-7xl mx-auto">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-100 pb-6">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Job Opening</h1>
            <p className="text-sm text-slate-500 mt-1">Fill in the details to broadcast a new position.</p>
         </div>
         <div className="flex items-center gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="h-10 px-5 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-[#1C3FA4] hover:border-[#1C3FA4] transition-all"
            >
               Save Draft
            </Button>
            <Button 
              type="submit" 
              form="job-form"
              disabled={loading}
              className="h-10 px-6 rounded-lg bg-[#1C3FA4] hover:bg-[#152d75] text-white font-semibold shadow-sm transition-all active:scale-95"
            >
               {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
               {loading ? "Publishing..." : "Publish Job"}
            </Button>
         </div>
      </div>

      {/* --- MAIN FORM GRID --- */}
      <form id="job-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: CORE DETAILS (Span 8) */}
        <div className="lg:col-span-8 space-y-10">
           
           {/* Section 1: Job Info */}
           <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                 <div className="h-6 w-1 bg-[#1C3FA4] rounded-full"></div>
                 <h3 className="text-lg font-bold text-slate-800">Job Information</h3>
              </div>

              <div className="grid gap-6">
                 <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Job Title</label>
                    <Input 
                      name="title" 
                      placeholder="e.g. Senior Backend Engineer" 
                      required 
                      className="h-11 rounded-lg border-slate-200 bg-white text-slate-900 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] placeholder:text-slate-400 shadow-sm"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-sm font-medium text-slate-700">Department</label>
                       <div className="relative">
                          {/* FIXED: Removed 'selected' from option, used defaultValue on select */}
                          <select 
                            name="department" 
                            defaultValue=""
                            className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] appearance-none cursor-pointer shadow-sm"
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
                          {/* FIXED: Added defaultValue */}
                          <select 
                            name="type" 
                            defaultValue="Full-Time"
                            className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] appearance-none cursor-pointer shadow-sm"
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
                 <h3 className="text-lg font-bold text-slate-800">Compensation & Schedule</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Salary Range (Annual LPA)</label>
                    <div className="flex gap-3">
                       <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">MIN</span>
                          <Input name="salary_min" placeholder="10" className="h-11 pl-10 rounded-lg border-slate-200 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] shadow-sm" />
                       </div>
                       <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">MAX</span>
                          <Input name="salary" placeholder="25" className="h-11 pl-10 rounded-lg border-slate-200 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] shadow-sm" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Target Start Date</label>
                    <div className="relative">
                       <Input type="date" className="h-11 px-3 rounded-lg border-slate-200 text-slate-700 focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] shadow-sm" />
                       <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
                 <div className="flex gap-1 bg-slate-50 p-1 rounded-md border border-slate-200">
                    <button type="button" className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-slate-900 transition-all font-serif font-bold text-xs">B</button>
                    <button type="button" className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-slate-900 transition-all italic text-xs font-serif">I</button>
                    <button type="button" className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-slate-900 transition-all underline text-xs font-serif">U</button>
                 </div>
              </div>

              <Textarea 
                name="description" 
                placeholder="Describe the responsibilities, required skills, and perks..." 
                className="min-h-[250px] p-4 rounded-lg border-slate-200 bg-white text-slate-800 text-sm leading-relaxed focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] resize-y shadow-sm"
              />
              <p className="text-xs text-slate-400">Markdown formatting is supported.</p>
           </section>
        </div>

        {/* RIGHT COLUMN: LOCATION & DETAILS (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* Location Manual Input Card */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                 <MapPin className="w-5 h-5 text-[#1C3FA4]" />
                 <h3 className="text-sm font-bold text-slate-900">Job Location</h3>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Office Address</label>
                    <Input 
                      name="location"
                      placeholder="e.g. 102, Tech Park, Koramangala" 
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1C3FA4]" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-slate-600">City</label>
                       <Input 
                         name="city"
                         placeholder="Bengaluru" 
                         className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1C3FA4]" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-slate-600">State</label>
                       <Input 
                         name="state"
                         placeholder="Karnataka" 
                         className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1C3FA4]" 
                       />
                    </div>
                 </div>

                 <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="remote" className="w-4 h-4 rounded border-slate-300 text-[#1C3FA4] focus:ring-[#1C3FA4]" />
                    <label htmlFor="remote" className="text-xs font-bold text-slate-500 cursor-pointer">This is a Remote / WFH role</label>
                 </div>
              </div>
           </div>

           {/* Hiring Contact Card */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                 <User className="w-5 h-5 text-[#1C3FA4]" />
                 <h3 className="text-sm font-bold text-slate-900">Hiring Contact</h3>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Hiring Manager Name</label>
                    <Input placeholder="John Doe" className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1C3FA4]" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Official Email</label>
                    <div className="relative">
                       <Input placeholder="careers@company.com" className="h-10 pl-9 rounded-lg border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#1C3FA4]" />
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Info Widget */}
           <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1C3FA4] shrink-0" />
              <div>
                 <h4 className="text-sm font-bold text-[#1C3FA4]">Pro Tip</h4>
                 <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                   Adding specific location details helps candidates calculate commute times, increasing application relevance by 25%.
                 </p>
              </div>
           </div>

        </div>

      </form>
    </div>
  )
}