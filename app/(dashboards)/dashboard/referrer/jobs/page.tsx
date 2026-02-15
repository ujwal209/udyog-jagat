"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Search, Plus, Filter, MoreHorizontal, MapPin, 
  Users, Calendar, Briefcase, Trash2, Edit, 
  CheckCircle2, Ban, Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getReferrerJobsAction, deleteJobAction, toggleJobStatusAction } from "@/app/actions/referrer-jobs-actions"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function MyJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "closed">("all")

  // --- FETCH DATA ---
  React.useEffect(() => {
    async function loadJobs() {
      const data = await getReferrerJobsAction()
      setJobs(data)
      setLoading(false)
    }
    loadJobs()
  }, [])

  // --- ACTIONS ---
  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This cannot be undone.")) return

    const original = [...jobs]
    setJobs(prev => prev.filter(j => j.id !== jobId)) // Optimistic
    toast.info("Deleting job...")

    const res = await deleteJobAction(jobId)
    if (res.success) {
      toast.success("Job deleted successfully")
    } else {
      setJobs(original) // Revert
      toast.error("Failed to delete job")
    }
  }

  const handleToggleStatus = async (job: any) => {
    const original = [...jobs]
    const newStatus = job.status === "active" ? "closed" : "active"
    
    // Optimistic Update
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j))
    
    const res = await toggleJobStatusAction(job.id, job.status)
    
    if (res.success) {
      toast.success(`Job marked as ${newStatus}`)
    } else {
      setJobs(original)
      toast.error("Update failed")
    }
  }

  // --- FILTERING ---
  const filteredJobs = jobs.filter(job => {
    const matchesQuery = job.title.toLowerCase().includes(query.toLowerCase()) || 
                         job.location.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="min-h-screen bg-white p-6 lg:p-10 font-sans text-slate-900 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
             <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
               My Job <span className="text-[#1C3FA4]">Posts</span>
             </h1>
             <p className="text-slate-500 text-sm font-medium">
               Manage your active listings and track applicants.
             </p>
          </div>
          <Link href="/dashboard/referrer/jobs/new">
             <Button className="h-11 px-6 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/10 transition-all active:scale-95 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Post New Job
             </Button>
          </Link>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-1 sticky top-4 z-30">
           {/* Search */}
           <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
              <Input 
                placeholder="Search jobs..." 
                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1C3FA4] transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
           </div>

           {/* Filters */}
           <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
              {["all", "active", "closed"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter as any)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    statusFilter === filter 
                      ? "bg-white text-[#1C3FA4] shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
           </div>
        </div>

        {/* --- JOB LIST --- */}
        {loading ? (
           <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-[1.5rem] animate-pulse" />)}
           </div>
        ) : filteredJobs.length > 0 ? (
           <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="group bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center"
                >
                   {/* Logo / Icon */}
                   <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm overflow-hidden">
                         {job.company_logo_url ? (
                           <img 
                             src={job.company_logo_url} 
                             alt="Logo" 
                             className="w-full h-full object-contain"
                           />
                         ) : (
                           <div className="bg-slate-50 w-full h-full flex items-center justify-center rounded-xl">
                             <Building2 className="w-6 h-6 text-slate-300" />
                           </div>
                         )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${job.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                   </div>

                   {/* Details */}
                   <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                         <h3 className="text-lg font-bold text-slate-900 truncate">{job.title}</h3>
                         <Badge variant="secondary" className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                           job.status === 'active' 
                             ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                             : "bg-slate-100 text-slate-500 border-slate-200"
                         }`}>
                           {job.status}
                         </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                         <span className="flex items-center gap-1">
                           <MapPin className="w-3.5 h-3.5" /> {job.location}
                         </span>
                         <span className="w-1 h-1 rounded-full bg-slate-300" />
                         <span className="flex items-center gap-1">
                           <Calendar className="w-3.5 h-3.5" /> {new Date(job.created_at).toLocaleDateString()}
                         </span>
                         <span className="w-1 h-1 rounded-full bg-slate-300" />
                         <span>{job.salary_range}</span>
                      </div>
                   </div>

                   {/* Stats */}
                   <div className="flex items-center gap-6 px-4 md:px-6 py-2 md:py-0 border-l border-slate-100">
                      <div className="text-center">
                         <p className="text-xl font-bold text-slate-900">{job.applicant_count || 0}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Applicants</p>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="flex items-center gap-2 self-end md:self-auto">
                      <Link href={`/dashboard/referrer/candidates?jobId=${job.id}`}>
                         {/* FIXED BUTTON: Explicit white background and slate text */}
                         <Button 
                           variant="outline" 
                           className="h-10 px-4 bg-white border border-slate-200 text-slate-600 hover:text-[#1C3FA4] hover:bg-blue-50 hover:border-[#1C3FA4] rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm"
                         >
                            View Applicants
                         </Button>
                      </Link>

                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                               <MoreHorizontal className="w-5 h-5" />
                            </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-slate-100 shadow-xl bg-white">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/referrer/jobs/${job.id}/edit`)} className="rounded-lg text-slate-600 focus:text-[#1C3FA4] focus:bg-blue-50 cursor-pointer font-medium text-xs py-2">
                               <Edit className="w-4 h-4 mr-2" /> Edit Job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(job)} className="rounded-lg text-slate-600 focus:text-purple-600 focus:bg-purple-50 cursor-pointer font-medium text-xs py-2">
                               {job.status === 'active' ? (
                                 <><Ban className="w-4 h-4 mr-2" /> Close Job</>
                               ) : (
                                 <><CheckCircle2 className="w-4 h-4 mr-2" /> Activate Job</>
                               )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem onClick={() => handleDelete(job.id)} className="rounded-lg text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer font-medium text-xs py-2">
                               <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                   </div>
                </div>
              ))}
           </div>
        ) : (
           /* Empty State */
           <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                 <Filter className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No jobs found</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 mb-6 font-medium">
                 {query || statusFilter !== 'all' 
                    ? "Try adjusting your search or filters." 
                    : "You haven't posted any jobs yet."}
              </p>
              {query || statusFilter !== 'all' ? (
                 <Button 
                   onClick={() => { setQuery(""); setStatusFilter("all"); }}
                   variant="outline" 
                   className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-wider"
                 >
                   Clear Filters
                 </Button>
              ) : (
                 <Link href="/dashboard/referrer/jobs/new">
                   <Button className="bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl h-10 px-6 font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                     Create First Job
                   </Button>
                 </Link>
              )}
           </div>
        )}
      </div>
    </div>
  )
}