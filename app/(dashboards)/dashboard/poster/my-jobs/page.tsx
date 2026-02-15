"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Search, MoreHorizontal, 
  MapPin, Clock, Users, Briefcase, 
  Loader2, Plus, Trash2, Power, Eye,
  Building2, Pencil
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { getPosterJobsAction, toggleJobStatusAction, deleteJobAction } from "@/app/actions/poster-my-jobs"

export default function MyJobsPage() {
  const [loading, setLoading] = React.useState(true)
  const [jobs, setJobs] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState("all")

  // --- FETCH DATA ---
  const fetchJobs = async () => {
    setLoading(true)
    const res = await getPosterJobsAction()
    if (res.success) {
      setJobs(res.data)
    } else {
      console.error("Fetch Error:", res.error)
      toast.error("Failed to load listings", { description: res.error })
    }
    setLoading(false)
  }

  React.useEffect(() => {
    fetchJobs()
  }, [])

  // --- ACTIONS ---
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const previousJobs = [...jobs]
    const newStatus = currentStatus === 'active' ? 'closed' : 'active'
    
    // Optimistic Update
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j))
    
    const toastId = toast.loading("Updating status...")
    
    try {
      const res = await toggleJobStatusAction(id, currentStatus)
      if (res.success) {
        toast.success(newStatus === 'active' ? "Listing activated" : "Listing closed", { id: toastId })
      } else {
        throw new Error(res.error)
      }
    } catch (err: any) {
      toast.error("Update failed", { id: toastId, description: err.message })
      setJobs(previousJobs) // Revert
    }
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("This will permanently delete the job and all associated applications. Continue?")
    if (!confirmDelete) return

    const toastId = toast.loading("Deleting listing...")
    
    try {
      const res = await deleteJobAction(id)
      if (res.success) {
        toast.success("Listing deleted", { id: toastId })
        setJobs(prev => prev.filter(j => j.id !== id))
      } else {
        throw new Error(res.error)
      }
    } catch (err: any) {
      toast.error("Delete failed", { id: toastId, description: err.message })
    }
  }

  // --- FILTERING ---
  const filteredJobs = jobs.filter(job => {
    const query = search.toLowerCase()
    const matchesSearch = (job.title?.toLowerCase() || "").includes(query) || 
                          (job.location?.toLowerCase() || "").includes(query)
    const matchesFilter = filter === 'all' || job.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6 font-sans text-slate-900 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1C3FA4] border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" /> Dashboard Overview
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            My <span className="text-[#1C3FA4]">Listings</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm max-w-lg leading-relaxed">
            Monitor active job posts, analyze applicant reach, and manage hiring cycles.
          </p>
        </div>
        <Link href="/dashboard/poster/post-job">
          <Button className="h-12 px-6 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-blue-900/10 transition-all active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center">
            <Plus className="w-4 h-4" /> Create New
          </Button>
        </Link>
      </div>

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="sticky top-4 z-20 bg-white/80 backdrop-blur-md border border-slate-100 p-2 rounded-[2rem] shadow-xl shadow-blue-900/5 mb-8 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
          <Input 
            placeholder="Search by job title, location, or keyword..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-11 rounded-[1.5rem] border-slate-200 bg-white/50 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all shadow-none"
          />
        </div>
        
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar items-center px-1">
          {['all', 'active', 'closed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
                filter === f 
                  ? "bg-[#1C3FA4] text-white shadow-md shadow-blue-900/10" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* JOBS GRID */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#1C3FA4] animate-spin mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Syncing Listings...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {filteredJobs.map((job) => (
            <div 
              key={job.id} 
              className={`group relative bg-white border rounded-[2.5rem] p-6 transition-all duration-300 ${
                job.status === 'active' 
                  ? 'border-slate-100 hover:border-[#1C3FA4]/30 hover:shadow-xl hover:shadow-blue-900/5' 
                  : 'border-slate-100 bg-slate-50/50 opacity-75 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                
                {/* 1. Identity & Status */}
                <div className="flex items-start gap-5 lg:w-[40%] shrink-0">
                  <Avatar className="h-16 w-16 rounded-2xl border-4 border-slate-50 bg-white shadow-sm shrink-0">
                    <AvatarImage src={job.company_logo_url} className="object-cover" />
                    <AvatarFallback className="bg-blue-50 text-[#1C3FA4] rounded-2xl">
                      <Building2 className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={job.status} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-[#1C3FA4] transition-colors truncate pr-4">
                      {job.title}
                    </h3>
                  </div>
                </div>

                {/* 2. Metadata Tags */}
                <div className="flex-1 flex flex-wrap gap-2 lg:gap-3">
                  <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-medium text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-[#1C3FA4]" /> 
                    <span className="truncate max-w-[120px]">{job.location}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-medium text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-[#1C3FA4]" /> {job.type}
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-medium text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-[#1C3FA4]" /> {job.department || "General"}
                  </div>
                </div>

                {/* 3. Stats & Menu */}
                <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8 w-full lg:w-auto">
                  
                  {/* Applicant Counter */}
                  <div className="flex items-center gap-3 group/stats cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1C3FA4] group-hover/stats:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 leading-none">{job.applicant_count}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidates</p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-slate-100 hidden lg:block" />

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#1C3FA4] transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-xl p-2 bg-white">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1.5">
                        Manage Listing
                      </DropdownMenuLabel>
                      
                      {/* --- EDIT OPTION --- */}
                      <Link href={`/dashboard/poster/edit-job/${job.id}`} className="w-full cursor-pointer">
                        <DropdownMenuItem className="rounded-lg py-2.5 px-3 font-medium text-slate-600 hover:text-[#1C3FA4] hover:bg-blue-50 cursor-pointer gap-3">
                          <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                            <Pencil className="w-3.5 h-3.5 text-[#1C3FA4]" />
                          </div> 
                          Edit Job
                        </DropdownMenuItem>
                      </Link>

                      <DropdownMenuItem 
                        onClick={() => handleToggleStatus(job.id, job.status)}
                        className="rounded-lg py-2.5 px-3 font-medium text-slate-600 hover:text-[#1C3FA4] hover:bg-blue-50 cursor-pointer gap-3"
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${job.status === 'active' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          <Power className="w-3.5 h-3.5" />
                        </div> 
                        {job.status === 'active' ? 'Close Listing' : 'Publish Listing'}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-slate-50 my-1" />
                      
                      <DropdownMenuItem 
                        onClick={() => handleDelete(job.id)}
                        className="rounded-lg py-2.5 px-3 font-medium text-rose-600 hover:bg-rose-50 cursor-pointer gap-3"
                      >
                        <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></div> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-100 rounded-[2.5rem] text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
            <Briefcase className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No active listings</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm font-medium leading-relaxed">
            {search || filter !== 'all' 
              ? "Try adjusting your search filters to find what you're looking for." 
              : "Start by posting a new job opportunity to attract talent."}
          </p>
          {(search || filter !== 'all') && (
            <Button 
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="mt-6 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-[#1C3FA4] hover:border-blue-100 hover:shadow-sm transition-all"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active'
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
      isActive 
        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
        : "bg-slate-100 text-slate-500 border-slate-200"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
      {isActive ? "Live" : "Closed"}
    </div>
  )
}