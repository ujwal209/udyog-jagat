"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Search, MoreHorizontal, 
  MapPin, Clock, Users, Briefcase, 
  Loader2, Plus, Trash2, Power,
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
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6 font-sans text-foreground animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            <Briefcase className="w-3 h-3" /> Dashboard Overview
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Listings
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg">
            Monitor active job posts, analyze applicant reach, and manage hiring cycles.
          </p>
        </div>
        <Link href="/dashboard/poster/post-job">
          <Button className="h-10 px-4 text-sm gap-2">
            <Plus className="w-4 h-4" /> Create New
          </Button>
        </Link>
      </div>

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="sticky top-4 z-20 bg-card/80 backdrop-blur-md border border-border p-2 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by job title, location, or keyword..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        
        <div className="flex gap-1 overflow-x-auto items-center px-1 border-l border-border pl-3">
          {['all', 'active', 'closed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap flex-shrink-0 ${
                filter === f 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Syncing Listings...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <div 
              key={job.id} 
              className={`group relative bg-card border rounded-lg p-5 transition-all duration-300 ${
                job.status === 'active' 
                  ? 'border-border hover:border-primary/50 shadow-sm' 
                  : 'border-border opacity-75 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                
                {/* 1. Identity & Status */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 rounded bg-secondary border border-border shrink-0">
                    <AvatarImage src={job.company_logo_url} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-muted-foreground rounded text-xs font-bold">
                      <Building2 className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={job.status} />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors truncate pr-4">
                      {job.title}
                    </h3>
                  </div>
                </div>

                {/* 2. Metadata Tags */}
                <div className="flex-1 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-secondary px-2 py-1 rounded border border-border text-xs font-medium text-muted-foreground">
                    <MapPin className="w-3 h-3" /> 
                    <span className="truncate max-w-[120px]">{job.location}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-secondary px-2 py-1 rounded border border-border text-xs font-medium text-muted-foreground">
                    <Briefcase className="w-3 h-3" /> {job.type}
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-secondary px-2 py-1 rounded border border-border text-xs font-medium text-muted-foreground">
                    <Clock className="w-3 h-3" /> {job.department || "General"}
                  </div>
                </div>

                {/* 3. Stats & Menu */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  
                  {/* Applicant Counter */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-none">{job.applicant_count}</p>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Candidates</p>
                    </div>
                  </div>

                  <div className="h-6 w-px bg-border hidden md:block" />

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-lg border-border p-1 bg-popover">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                        Manage Listing
                      </DropdownMenuLabel>
                      
                      {/* --- EDIT OPTION --- */}
                      <Link href={`/dashboard/poster/edit-job/${job.id}`} className="w-full cursor-pointer">
                        <DropdownMenuItem className="rounded-md py-2 px-2 text-sm font-medium text-foreground cursor-pointer gap-2 focus:bg-secondary">
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                          Edit Job
                        </DropdownMenuItem>
                      </Link>

                      <DropdownMenuItem 
                        onClick={() => handleToggleStatus(job.id, job.status)}
                        className="rounded-md py-2 px-2 text-sm font-medium text-foreground cursor-pointer gap-2 focus:bg-secondary"
                      >
                        <Power className={`w-4 h-4 ${job.status === 'active' ? 'text-amber-500' : 'text-emerald-500'}`} />
                        {job.status === 'active' ? 'Close Listing' : 'Publish Listing'}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-border my-1" />
                      
                      <DropdownMenuItem 
                        onClick={() => handleDelete(job.id)}
                        className="rounded-md py-2 px-2 text-sm font-medium text-destructive cursor-pointer gap-2 focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-lg text-center shadow-sm">
          <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No active listings</h3>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {search || filter !== 'all' 
              ? "Try adjusting your search filters to find what you're looking for." 
              : "Start by posting a new job opportunity to attract talent."}
          </p>
          {(search || filter !== 'all') && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="mt-4"
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
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
      isActive 
        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
        : "bg-secondary text-muted-foreground border-border"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
      {isActive ? "Live" : "Closed"}
    </div>
  )
}