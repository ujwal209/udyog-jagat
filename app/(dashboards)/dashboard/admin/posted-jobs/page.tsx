"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Briefcase, MapPin, Layers, MoreHorizontal, Trash2, 
  Edit2, Eye, Search, Loader2,
  Wallet, Filter, X, CheckSquare, Square, Building2, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAllJobsAdminAction, deleteJobAdminAction, restoreJobAdminAction } from "@/app/actions/admin-jobs-actions"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const DEPARTMENTS = ["Engineering", "Product", "Marketing", "Sales", "Design"]

export default function AdminAllJobsPage() {
  const [jobs, setJobs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  
  // -- FILTER STATE --
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [deptFilter, setDeptFilter] = React.useState("all")
  
  // -- SELECTION STATE --
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  // --- FETCH DATA ---
  React.useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const res = await getAllJobsAdminAction()
        if (res.success) {
          setJobs(res.data || [])
        } else {
          toast.error(res.error)
        }
      } catch (err) {
        toast.error("Failed to load jobs")
      }
      setLoading(false)
    }
    init()
  }, [])

  // --- ACTIONS ---
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredJobs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredJobs.map(j => j.id)))
    }
  }

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds)
    setJobs(prev => prev.filter(j => !selectedIds.has(j.id)))
    setSelectedIds(new Set())
    
    let errors = 0
    for (const id of idsToDelete) {
      const res = await deleteJobAdminAction(id)
      if (!res.success) errors++
    }

    if (errors > 0) toast.warning(`Deleted with ${errors} errors`)
    else toast.success("Selected jobs deleted successfully")
  }

  const handleDeleteOne = async (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'deleted' } : j))
    
    const res = await deleteJobAdminAction(id)
    if (res.success) {
      toast.success("Job suspended")
    } else {
      toast.error("Failed to delete job")
      const d = await getAllJobsAdminAction()
      if (d.success) setJobs(d.data || [])
    }
  }

  const handleRestoreOne = async (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'active' } : j))
    
    const res = await restoreJobAdminAction(id)
    if (res.success) {
      toast.success("Job restored")
    } else {
      toast.error("Failed to restore job")
      const d = await getAllJobsAdminAction()
      if (d.success) setJobs(d.data || [])
    }
  }

  // --- FILTER LOGIC ---
  const filteredJobs = jobs.filter(j => {
    const searchString = `${j.title} ${j.department} ${j.job_posters?.company_name} ${j.job_posters?.full_name}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())
    
    const matchesDept = deptFilter === "all" || j.department === deptFilter
    const jobStatus = j.status || "active" 
    const matchesStatus = statusFilter === "all" || jobStatus === statusFilter

    return matchesSearch && matchesDept && matchesStatus
  })

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Briefcase className="w-3 h-3" /> System Overview
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">All Portal Jobs</h1>
          <p className="text-sm text-slate-500 font-medium max-w-lg">
            Manage every job listing across the entire platform. Monitor companies and delete non-compliant postings.
          </p>
        </div>
      </div>

      {/* --- CONTROLS BAR --- */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, department, company, or recruiter..." 
            className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-medium focus:bg-white focus:border-[#1C3FA4] transition-all" 
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 focus:border-[#1C3FA4] outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
           >
             <option value="all">All Status</option>
             <option value="active">Active</option>
             <option value="closed">Closed</option>
             <option value="deleted">Suspended</option>
           </select>
           <select 
             value={deptFilter}
             onChange={(e) => setDeptFilter(e.target.value)}
             className="h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 focus:border-[#1C3FA4] outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
           >
             <option value="all">All Departments</option>
             {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
           
           {(search || deptFilter !== "all" || statusFilter !== "all") && (
             <Button 
               variant="ghost" 
               onClick={() => { setSearch(""); setDeptFilter("all"); setStatusFilter("all") }}
               className="h-12 w-12 p-0 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
             >
               <X className="w-5 h-5" />
             </Button>
           )}
        </div>
      </div>

      {/* --- BULK ACTION BAR (Floating) --- */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#1C3FA4] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-300">
           <div className="flex items-center gap-2 text-sm font-bold">
             <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">
               {selectedIds.size}
             </div>
             <span>Selected</span>
           </div>
           <div className="h-4 w-px bg-white/20" />
           <div className="flex items-center gap-2">
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-xs font-bold bg-white text-[#1C3FA4] px-4 py-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                 <Trash2 className="w-3.5 h-3.5" /> Force Delete
              </button>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-white/60 hover:text-white p-2 ml-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

      {/* --- LIST --- */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#1C3FA4]" />
          <p className="text-sm font-bold uppercase tracking-widest">Loading Portal Jobs...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-4">
          
          {/* Header Row for Select All */}
          <div className="flex items-center px-5 pb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
             <button onClick={toggleSelectAll} className="flex items-center gap-3 hover:text-[#1C3FA4] transition-colors">
                {selectedIds.size === filteredJobs.length && filteredJobs.length > 0 
                  ? <CheckSquare className="w-4 h-4 text-[#1C3FA4]" /> 
                  : <Square className="w-4 h-4" />}
                Select All
             </button>
          </div>

          {filteredJobs.map((job) => {
            const isSelected = selectedIds.has(job.id)
            const poster = job.job_posters
            
            return (
              <div 
                key={job.id} 
                className={`group relative bg-white rounded-2xl border p-6 transition-all duration-300 ${
                  isSelected 
                    ? "border-[#1C3FA4] bg-blue-50/20 shadow-md ring-1 ring-[#1C3FA4]/20" 
                    : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
                }`}
              >
                <div className="flex items-start gap-5">
                  
                  {/* Checkbox */}
                  <button 
                    onClick={() => toggleSelect(job.id)}
                    className="mt-1 text-slate-300 hover:text-[#1C3FA4] transition-colors"
                  >
                    {isSelected ? <CheckSquare className="w-6 h-6 text-[#1C3FA4]" /> : <Square className="w-6 h-6" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                      
                      {/* Job Info */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className={`text-xl font-bold truncate ${isSelected ? "text-[#1C3FA4]" : "text-slate-900"}`}>
                              {job.title}
                            </h3>
                            {job.status === 'deleted' ? (
                              <Badge className="bg-red-50 text-red-700 border-red-100 text-[10px] uppercase font-bold tracking-tight shadow-none rounded-md px-2 py-0.5">
                                Suspended
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 text-[10px] uppercase font-bold tracking-tight shadow-none rounded-md px-2 py-0.5">
                                Live
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                             <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> {job.department}</span>
                             <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location || "Remote"}</span>
                             <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4" /> {job.salary_range || "N/A"}</span>
                          </div>
                        </div>

                        {/* Poster Info (Admin Only View) */}
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                           <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1">
                             {poster?.avatar_url ? (
                               <img src={poster.avatar_url} alt="Logo" className="w-full h-full object-contain rounded" />
                             ) : (
                               <Building2 className="w-5 h-5 text-slate-300" />
                             )}
                           </div>
                           <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Posted By</p>
                             <div className="flex items-center gap-2">
                               <p className="text-sm font-bold text-slate-900">{poster?.company_name || "Unknown Company"}</p>
                               <span className="text-slate-300">•</span>
                               <span className="text-sm font-medium text-slate-500">{poster?.full_name || "Unknown User"}</span>
                             </div>
                           </div>
                        </div>

                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4 border-t xl:border-t-0 pt-4 xl:pt-0 border-slate-100 w-full xl:w-auto shrink-0 justify-between xl:justify-end">
                         <div className="flex flex-col items-start xl:items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Posted</span>
                            <span className="text-sm font-bold text-slate-700">{new Date(job.created_at).toLocaleDateString()}</span>
                         </div>
                         
                         <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="h-10 px-4 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm font-bold">
                                Manage <MoreHorizontal className="w-4 h-4 ml-2" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-56 p-1.5 bg-white border border-slate-100 shadow-2xl rounded-2xl">
                              <div className="grid gap-1">
                                <Link href={`/dashboard/admin/edit-job/${job.id}`}>
                                  <Button variant="ghost" className="w-full justify-start h-10 px-3 font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                                    <Edit2 className="w-4 h-4 mr-3 text-slate-400" /> Edit Listing
                                  </Button>
                                </Link>
                                <Button variant="ghost" className="w-full justify-start h-10 px-3 font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                                  <Eye className="w-4 h-4 mr-3 text-slate-400" /> View in Portal
                                </Button>
                                <div className="h-px bg-slate-100 my-1.5" />
                                {job.status === 'deleted' ? (
                                  <Button 
                                    variant="ghost" 
                                    onClick={() => handleRestoreOne(job.id)}
                                    className="justify-start h-10 px-3 font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                                  >
                                    <CheckSquare className="w-4 h-4 mr-3" /> Restore Job
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    onClick={() => handleDeleteOne(job.id)}
                                    className="justify-start h-10 px-3 font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                  >
                                    <Trash2 className="w-4 h-4 mr-3" /> Force Suspend
                                  </Button>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
            <Filter className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No jobs found</h3>
          <p className="text-sm text-slate-500 font-medium max-w-sm mt-2 mb-8">
            Try adjusting your filters or search terms. There are currently no listings matching this criteria.
          </p>
          
          <Button 
            variant="outline"
            onClick={() => { setSearch(""); setDeptFilter("all"); setStatusFilter("all") }}
            className="border-slate-300 bg-white text-slate-700 hover:text-[#1C3FA4] hover:border-[#1C3FA4] hover:bg-blue-50 transition-all font-bold h-12 px-6 rounded-xl shadow-sm"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )
}