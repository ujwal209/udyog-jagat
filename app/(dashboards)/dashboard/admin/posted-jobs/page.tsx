"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Briefcase, MapPin, Layers, MoreHorizontal, Trash2, 
  Edit2, Eye, Calendar, Plus, Search, Loader2,
  Wallet, Filter, X, CheckSquare, Square
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMyPostedJobs, deleteJobAction } from "@/app/actions/job-actions"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const DEPARTMENTS = ["Engineering", "Product", "Marketing", "Sales", "Design"]

export default function PostedJobsPage() {
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
        const data = await getMyPostedJobs()
        setJobs(data || [])
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
    // Optimistic Update - NO CONFIRMATION
    const idsToDelete = Array.from(selectedIds)
    setJobs(prev => prev.filter(j => !selectedIds.has(j.id)))
    setSelectedIds(new Set())
    
    // Execute Deletes
    let errors = 0
    for (const id of idsToDelete) {
      const res = await deleteJobAction(id)
      if (!res.success) errors++
    }

    if (errors > 0) toast.warning(`Deleted with ${errors} errors`)
    else toast.success("Selected jobs deleted successfully")
  }

  const handleDeleteOne = async (id: string) => {
    // Optimistic Update - NO CONFIRMATION
    setJobs(prev => prev.filter(j => j.id !== id))
    
    const res = await deleteJobAction(id)
    if (res.success) {
      toast.success("Job removed")
    } else {
      toast.error("Failed to delete job")
      // Revert if failed
      const data = await getMyPostedJobs()
      setJobs(data || [])
    }
  }

  // --- FILTER LOGIC ---
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = (j.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
                          (j.department?.toLowerCase() || "").includes(search.toLowerCase())
    
    const matchesDept = deptFilter === "all" || j.department === deptFilter
    const jobStatus = "active" 
    const matchesStatus = statusFilter === "all" || jobStatus === statusFilter

    return matchesSearch && matchesDept && matchesStatus
  })

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Listings</h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage your recruitment pipeline. {jobs.length} total positions.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <Link href="/dashboard/admin/post-job">
            <Button className="h-10 px-5 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-lg font-semibold text-xs shadow-sm transition-all active:scale-95">
              <Plus className="w-4 h-4 mr-2" /> Create Listing
            </Button>
          </Link>
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
            placeholder="Search by title, department, or keyword..." 
            className="h-11 pl-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-medium focus:bg-white focus:border-[#1C3FA4] transition-all" 
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
           <select 
             value={deptFilter}
             onChange={(e) => setDeptFilter(e.target.value)}
             className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 focus:border-[#1C3FA4] outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
           >
             <option value="all">All Departments</option>
             {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
           </select>

           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 focus:border-[#1C3FA4] outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
           >
             <option value="all">All Status</option>
             <option value="active">Active</option>
             <option value="closed">Closed</option>
             <option value="draft">Draft</option>
           </select>
           
           {(search || deptFilter !== "all" || statusFilter !== "all") && (
             <Button 
               variant="ghost" 
               onClick={() => { setSearch(""); setDeptFilter("all"); setStatusFilter("all") }}
               className="h-11 w-11 p-0 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
             >
               <X className="w-4 h-4" />
             </Button>
           )}
        </div>
      </div>

      {/* --- BULK ACTION BAR (Floating) --- */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1C3FA4] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-300">
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
                className="flex items-center gap-2 text-xs font-bold bg-white text-[#1C3FA4] px-3 py-1.5 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                 <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
              </button>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-white/60 hover:text-white p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

      {/* --- LIST --- */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#1C3FA4]" />
          <p className="text-sm font-medium">Syncing jobs...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-3">
          
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
            return (
              <div 
                key={job.id} 
                className={`group relative bg-white rounded-xl border p-5 transition-all duration-200 ${
                  isSelected 
                    ? "border-[#1C3FA4] bg-blue-50/10 shadow-sm" 
                    : "border-slate-200 hover:border-[#1C3FA4]/30 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  
                  {/* Checkbox */}
                  <button 
                    onClick={() => toggleSelect(job.id)}
                    className="mt-1 text-slate-300 hover:text-[#1C3FA4] transition-colors"
                  >
                    {isSelected ? <CheckSquare className="w-5 h-5 text-[#1C3FA4]" /> : <Square className="w-5 h-5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Job Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`text-lg font-bold truncate ${isSelected ? "text-[#1C3FA4]" : "text-slate-900"}`}>
                            {job.title}
                          </h3>
                          {/* Explicit Colors for Badge */}
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 text-[10px] uppercase font-bold tracking-tight shadow-none rounded-md px-2 py-0.5">
                            Active
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                           <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {job.department}</span>
                           <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location || "Remote"}</span>
                           <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> {job.salary_range || "N/A"}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                         <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-xs font-semibold text-slate-400">Posted</span>
                            <span className="text-sm font-bold text-slate-700">{new Date(job.created_at).toLocaleDateString()}</span>
                         </div>
                         
                         <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-48 p-1 bg-white border-slate-100 shadow-xl rounded-xl">
                              <div className="grid gap-1">
                                {/* FIXED: Correct Link Path */}
                                <Link href={`/dashboard/admin/edit-job/${job.id}`}>
                                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 px-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                                    <Edit2 className="w-4 h-4 mr-2 text-slate-400" /> Edit Details
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="justify-start h-9 px-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                                  <Eye className="w-4 h-4 mr-2 text-slate-400" /> View Application
                                </Button>
                                <div className="h-px bg-slate-100 my-1" />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteOne(job.id)}
                                  className="justify-start h-9 px-2 font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete Listing
                                </Button>
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
        <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Filter className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No jobs found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">Try adjusting your filters or search terms.</p>
          
          {/* FIXED: Explicitly White Button */}
          <Button 
            variant="outline"
            onClick={() => { setSearch(""); setDeptFilter("all"); setStatusFilter("all") }}
            className="border-slate-300 bg-white text-slate-600 hover:text-[#1C3FA4] hover:border-[#1C3FA4] transition-all"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}