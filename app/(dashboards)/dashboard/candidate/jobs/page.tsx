"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Search, MapPin, Briefcase, DollarSign, 
  Filter, Building2, Zap, X, 
  SlidersHorizontal, FileText, Bookmark, CheckCircle2, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import { 
  getJobsWithStatusAction, 
  applyToJobAction, 
  withdrawApplicationAction,
  toggleSaveJobAction 
} from "@/app/actions/job-board-actions"

// --- TYPES ---
type Job = {
  id: string
  title: string
  department: string
  type: string
  location: string
  salary_range: string | null
  company_logo_url: string | null
  created_at: string
  description: string
  hiring_manager?: string
  application_id?: string | null
  is_saved: boolean
}

const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Internship", "Freelance"]

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = React.useState<Job[]>([])
  const [loading, setLoading] = React.useState(true)
  
  // -- FILTERS --
  const [query, setQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState("All")
  const [filterStatus, setFilterStatus] = React.useState("All")
  
  // Salary Inputs
  const [minSalaryInput, setMinSalaryInput] = React.useState("")
  const [maxSalaryInput, setMaxSalaryInput] = React.useState("")

  const [isFilterOpen, setIsFilterOpen] = React.useState(false) 
  const [processingId, setProcessingId] = React.useState<string | null>(null)

  // --- INIT ---
  React.useEffect(() => {
    async function init() {
      try {
        const data = await getJobsWithStatusAction()
        setJobs(data as any) // Type assertion due to join complexity
      } catch (err) {
        toast.error("Unable to fetch jobs")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // --- FILTERING LOGIC ---
  const filteredJobs = jobs.filter(job => {
    const q = query.toLowerCase()
    
    // 1. Text Search
    const matchesQuery = job.title.toLowerCase().includes(q) || 
                         job.location.toLowerCase().includes(q) ||
                         job.department.toLowerCase().includes(q)
    
    // 2. Job Type
    const matchesType = filterType === "All" || job.type === filterType
    
    // 3. Application Status
    const matchesStatus = 
      filterStatus === "All" ? true :
      filterStatus === "Applied" ? !!job.application_id :
      !job.application_id 

    // 4. Salary Range Logic (Extracting numbers from string like "10-20 LPA")
    const matchesSalary = (() => {
      if (!minSalaryInput && !maxSalaryInput) return true
      if (!job.salary_range) return false 

      // Extract first number found in string as estimate
      const match = job.salary_range.match(/(\d+)/)
      if (!match) return false
      const jobSal = parseInt(match[0])

      const min = minSalaryInput ? parseInt(minSalaryInput) : 0
      const max = maxSalaryInput ? parseInt(maxSalaryInput) : 999999

      return jobSal >= min && jobSal <= max
    })()

    return matchesQuery && matchesType && matchesSalary && matchesStatus
  })

  // --- ACTIONS ---

  const handleApply = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation() 
    if (processingId) return
    setProcessingId(job.id)

    // Optimistic
    const originalJobs = [...jobs]
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, application_id: 'temp' } : j))

    const res = await applyToJobAction(job.id)

    if (res && res.success) {
      toast.success("Application Submitted", { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> })
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, application_id: res.applicationId } : j))
    } else {
      toast.error("Failed", { description: res?.error })
      setJobs(originalJobs)
    }
    setProcessingId(null)
  }

  const handleWithdraw = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation()
    if (processingId || !job.application_id) return
    setProcessingId(job.id)

    const originalJobs = [...jobs]
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, application_id: null } : j))

    const res = await withdrawApplicationAction(job.application_id)

    if (res && res.success) {
      toast.info("Withdrawn", { icon: <Trash2 className="w-4 h-4 text-slate-500" /> })
    } else {
      toast.error("Failed", { description: res?.error })
      setJobs(originalJobs)
    }
    setProcessingId(null)
  }

  const handleSave = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation()
    
    // Optimistic Update
    const originalJobs = [...jobs]
    const newState = !job.is_saved
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_saved: newState } : j))

    const res = await toggleSaveJobAction(job.id, job.is_saved)

    if (res.success) {
      toast(newState ? "Job Saved" : "Job Removed", {
        icon: <Bookmark className={`w-4 h-4 ${newState ? "text-[#1C3FA4] fill-current" : "text-slate-400"}`} />
      })
    } else {
      toast.error("Error updating save status")
      setJobs(originalJobs)
    }
  }

  const resetFilters = () => {
    setQuery("")
    setFilterType("All")
    setFilterStatus("All")
    setMinSalaryInput("")
    setMaxSalaryInput("")
    setIsFilterOpen(false)
  }

  // --- FILTER COMPONENT ---
  const FilterContent = () => (
    <div className="space-y-8">
       <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
             <SlidersHorizontal className="w-4 h-4" /> Filters
          </div>
          <button 
            onClick={resetFilters}
            className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            Reset <X className="w-3 h-3" />
          </button>
       </div>

       {/* Status */}
       <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Application Status</label>
          <div className="flex flex-col gap-2">
             {["All", "New", "Applied"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                    filterStatus === status 
                      ? "bg-blue-50 border-[#1C3FA4] text-[#1C3FA4] shadow-sm" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span>{status} Jobs</span>
                  {filterStatus === status && <div className="w-1.5 h-1.5 rounded-full bg-[#1C3FA4]" />}
                </button>
             ))}
          </div>
       </div>

       {/* Job Type */}
       <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Job Type</label>
          <div className="flex flex-col gap-2">
             <button
               onClick={() => setFilterType("All")}
               className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                 filterType === "All" 
                   ? "bg-[#1C3FA4] border-[#1C3FA4] text-white shadow-md" 
                   : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
               }`}
             >
               <span>All Types</span>
               {filterType === "All" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
             </button>
             
             {JOB_TYPES.map((type) => (
               <button
                 key={type}
                 onClick={() => setFilterType(type)}
                 className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                   filterType === type 
                     ? "bg-[#1C3FA4] border-[#1C3FA4] text-white shadow-md" 
                     : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                 }`}
               >
                 <span>{type}</span>
                 {filterType === type && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
               </button>
             ))}
          </div>
       </div>

       {/* Custom Salary Range Input */}
       <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Salary Range (LPA)</label>
          <div className="flex items-center gap-2">
             <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Min</span>
                <Input 
                  type="number" 
                  value={minSalaryInput}
                  onChange={(e) => setMinSalaryInput(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-xs font-medium focus:border-[#1C3FA4] focus:ring-0"
                  placeholder="0"
                />
             </div>
             <span className="text-slate-300">-</span>
             <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Max</span>
                <Input 
                  type="number" 
                  value={maxSalaryInput}
                  onChange={(e) => setMaxSalaryInput(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs font-medium focus:border-[#1C3FA4] focus:ring-0"
                  placeholder="Any"
                />
             </div>
          </div>
       </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-6 lg:p-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-6 mb-8 lg:mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-[#1C3FA4] uppercase tracking-wider w-fit">
             <Zap className="w-3 h-3 fill-current" /> Live Opportunities
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
            Find Your <span className="text-[#1C3FA4]">Next Role</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm max-w-lg">
            Browse active listings and manage your applications.
          </p>
        </div>

        {/* --- MOBILE SEARCH BAR --- */}
        <div className="sticky top-4 z-20 flex gap-3 lg:static">
           <div className="relative flex-1 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
             <Input 
               placeholder="Search job title, skill, or location..." 
               className="h-12 pl-11 rounded-2xl bg-white border-slate-200 shadow-sm focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] transition-all text-base text-slate-900 placeholder:text-slate-400"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
             />
           </div>
           
           <div className="lg:hidden">
             <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
               <SheetTrigger asChild>
                 <Button className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm p-0">
                   <SlidersHorizontal className="w-5 h-5" />
                 </Button>
               </SheetTrigger>
               <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto bg-white border-r border-slate-200 text-slate-900">
                 <SheetHeader className="mb-6 text-left">
                   <SheetTitle className="text-xl font-bold text-slate-900">Filters</SheetTitle>
                 </SheetHeader>
                 <FilterContent />
                 <div className="mt-8 pt-4 border-t border-slate-100">
                   <Button onClick={() => setIsFilterOpen(false)} className="w-full bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl">
                     Show Results
                   </Button>
                 </div>
               </SheetContent>
             </Sheet>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden lg:block w-80 shrink-0 space-y-8 sticky top-10">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
             <FilterContent />
          </div>
          
          {/* Promo */}
          <div className="bg-[#1C3FA4] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
             <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                   <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                   <h3 className="font-bold text-lg leading-tight mb-1">Boost Your Profile</h3>
                   <p className="text-xs text-blue-100/80 leading-relaxed">Complete your profile to appear in top recruiter searches.</p>
                </div>
                <Button size="sm" variant="secondary" className="w-full bg-white text-[#1C3FA4] hover:bg-blue-50 font-bold text-xs uppercase tracking-wide">
                   Update Now
                </Button>
             </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 min-w-0 space-y-4 w-full">
          
          <div className="flex items-center justify-between pb-2">
             <p className="text-sm text-slate-500">
               Showing <span className="font-bold text-slate-900">{filteredJobs.length}</span> active opportunities
             </p>
             {(filterType !== "All" || minSalaryInput || maxSalaryInput || filterStatus !== "All") && (
                <button onClick={resetFilters} className="lg:hidden text-xs font-bold text-red-500 uppercase tracking-wide">Reset Filters</button>
             )}
          </div>

          {loading ? (
            <div className="space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="h-48 rounded-[1.5rem] bg-slate-50 animate-pulse border border-slate-200" />
               ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredJobs.map((job) => {
                const isSaved = job.is_saved
                const isApplied = !!job.application_id

                return (
                  <div 
                    key={job.id}
                    onClick={() => router.push(`/dashboard/candidate/jobs/${job.id}`)}
                    className={`group bg-white rounded-[1.5rem] p-5 sm:p-6 border shadow-sm hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 relative cursor-pointer ${
                        isApplied ? "border-emerald-100 bg-emerald-50/10" : "border-slate-200 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      
                      {/* Logo */}
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 sm:p-3 shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                         {job.company_logo_url ? (
                           <img src={job.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
                         ) : (
                           <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-slate-300" />
                         )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 w-full">
                         <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1C3FA4] transition-colors truncate pr-2">
                                {job.title}
                              </h3>
                              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                                {job.department}
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-slate-400 truncate max-w-[150px] sm:max-w-none">Hiring: {job.hiring_manager || "Recruiter"}</span>
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 self-start">
                                {isApplied && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                                        <CheckCircle2 className="w-3 h-3" /> Applied
                                    </span>
                                )}
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                                    {new Date(job.created_at).toLocaleDateString()}
                                </span>
                            </div>
                         </div>

                         <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4 pr-2">
                           {job.description}
                         </p>

                         {/* Tags */}
                         <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
                            <Badge variant="secondary" className="bg-white text-slate-600 border border-slate-200 font-medium rounded-lg px-2.5 py-0.5 text-xs">
                               <Briefcase className="w-3 h-3 mr-1.5 opacity-70" /> {job.type}
                            </Badge>
                            <Badge variant="secondary" className="bg-white text-slate-600 border border-slate-200 font-medium rounded-lg px-2.5 py-0.5 text-xs">
                               <DollarSign className="w-3 h-3 mr-1.5 opacity-70" /> {job.salary_range || "Competitive"}
                            </Badge>
                            <Badge variant="secondary" className="bg-white text-slate-600 border border-slate-200 font-medium rounded-lg px-2.5 py-0.5 text-xs">
                               <MapPin className="w-3 h-3 mr-1.5 opacity-70" /> {job.location}
                            </Badge>
                         </div>
                      </div>

                      {/* Actions */}
                      <div className="w-full sm:w-auto pt-4 sm:pt-0 sm:pl-6 sm:border-l border-slate-100 flex flex-row sm:flex-col gap-3 justify-end items-center sm:items-end shrink-0 self-stretch">
                         
                         {isApplied ? (
                             <Button 
                               onClick={(e) => handleWithdraw(e, job)}
                               className="flex-1 sm:flex-none w-full sm:w-32 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 rounded-xl h-10 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                             >
                               Withdraw
                             </Button>
                         ) : (
                             <Button 
                               onClick={(e) => handleApply(e, job)}
                               className="flex-1 sm:flex-none w-full sm:w-32 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl h-10 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                             >
                               Apply Now
                             </Button>
                         )}
                         
                         <div className="flex items-center gap-3 sm:pr-1">
                           <button 
                             onClick={(e) => handleSave(e, job)}
                             className={`text-xs font-medium flex items-center gap-1.5 transition-colors p-2 rounded-lg hover:bg-slate-50 ${
                               isSaved ? "text-[#1C3FA4]" : "text-slate-400 hover:text-slate-600"
                             }`}
                           >
                             <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} /> 
                             <span className="sm:hidden">Save</span>
                           </button>

                           <button className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors p-2 rounded-lg hover:bg-slate-50">
                             <FileText className="w-4 h-4" /> 
                             <span className="sm:hidden">Details</span>
                           </button>
                         </div>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                  <Filter className="w-6 h-6 text-slate-300" />
               </div>
               <h3 className="text-lg font-semibold text-slate-900">No jobs found</h3>
               <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 mb-6">
                 Try adjusting your filters or search keywords.
               </p>
               <Button 
                 variant="outline" 
                 onClick={resetFilters}
                 className="border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl"
               >
                 Reset All Filters
               </Button>
            </div>
          )}
        </main>

      </div>
    </div>
  )
}