"use client"

import * as React from "react"
import { 
  Search, MoreHorizontal, 
  MapPin, Calendar, Mail, Phone,
  CheckCircle2, XCircle, Clock, 
  Loader2, Briefcase, User, 
  FileText, Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { getPosterApplicationsAction, updateApplicationStatusAction, type ApplicationStatus } from "@/app/actions/poster-applications"

export default function ApplicationsPage() {
  const [loading, setLoading] = React.useState(true)
  const [applications, setApplications] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true)
    const res = await getPosterApplicationsAction()
    if (res.success) {
      setApplications(res.data)
    } else {
      toast.error("Failed to fetch applications", { description: res.error })
    }
    setLoading(false)
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  // --- UPDATE STATUS ---
  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    const previousApps = [...applications]
    
    // Optimistic UI Update
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ))

    const toastId = toast.loading("Updating candidate status...")

    try {
      const res = await updateApplicationStatusAction(id, newStatus)
      if (res.success) {
        toast.success(`Moved to ${newStatus}`, { id: toastId })
      } else {
        throw new Error(res.error)
      }
    } catch (err) {
      toast.error("Update failed", { id: toastId })
      setApplications(previousApps) // Revert on error
    }
  }

  // --- FILTERING ---
  const filteredApps = applications.filter(app => {
    const searchLower = search.toLowerCase()
    const matchesSearch = 
      (app.candidates?.full_name?.toLowerCase() || "").includes(searchLower) ||
      (app.jobs?.title?.toLowerCase() || "").includes(searchLower)
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interviewing').length,
    selected: applications.filter(a => a.status === 'selected').length
  }

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6 font-sans text-foreground animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
          <Briefcase className="w-3 h-3" /> Pipeline Management
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Candidate Applications
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg">
          Screen resumes, schedule interviews, and manage hiring decisions from a centralized dashboard.
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Candidates" value={stats.total} icon={Briefcase} color="primary" />
        <StatCard label="Needs Review" value={stats.applied} icon={Clock} color="amber" />
        <StatCard label="Interviewing" value={stats.interview} icon={Calendar} color="purple" />
        <StatCard label="Selected" value={stats.selected} icon={CheckCircle2} color="emerald" />
      </div>

      {/* TOOLBAR */}
      <div className="sticky top-4 z-20 bg-card/80 backdrop-blur-md border border-border p-2 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by candidate name or job title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto items-center px-1 border-l border-border pl-3">
          {['all', 'applied', 'interviewing', 'selected', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap flex-shrink-0 ${
                statusFilter === f 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {f === 'applied' ? 'Pending' : f}
            </button>
          ))}
        </div>
      </div>

      {/* APPLICATIONS LIST */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Syncing Data...</p>
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app) => (
            <div 
              key={app.id} 
              className="group bg-card border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-sm transition-all duration-300 relative overflow-hidden"
            >
              {/* Status Indicator Stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                app.status === 'selected' ? 'bg-emerald-500' : 
                app.status === 'interviewing' ? 'bg-purple-500' :
                app.status === 'rejected' ? 'bg-muted-foreground' : 'bg-amber-400'
              }`} />

              <div className="flex flex-col md:flex-row gap-6 md:items-center pl-4">
                
                {/* 1. Candidate Identity */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 rounded bg-secondary border border-border">
                    <AvatarImage src={app.candidates?.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-foreground font-bold text-sm rounded">
                      {app.candidates?.full_name?.[0]?.toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-base truncate">
                      {app.candidates?.full_name || "Unknown Candidate"}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">
                        {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Job & Contact Info */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {/* Job */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Applying For</p>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Briefcase className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate">{app.jobs?.title || "Unknown Role"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {app.jobs?.location || "Remote"}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contact</p>
                    <div className="flex flex-col gap-1.5">
                      <a href={`mailto:${app.candidates?.email}`} className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit">
                        <Mail className="w-3 h-3" /> {app.candidates?.email}
                      </a>
                      {app.candidates?.phone && (
                        <a href={`tel:${app.candidates?.phone}`} className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit">
                          <Phone className="w-3 h-3" /> {app.candidates?.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Actions & Resume */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  
                  {/* Resume Button */}
                  {app.candidates?.resume_url ? (
                    <a 
                      href={app.candidates.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-all text-xs font-semibold shadow-sm"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Resume</span>
                      <Download className="w-3 h-3 opacity-50" />
                    </a>
                  ) : (
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary opacity-50 text-muted-foreground text-xs font-semibold cursor-not-allowed">
                      <FileText className="w-3 h-3" /> No PDF
                    </div>
                  )}

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-lg border-border p-1 bg-popover">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                          Change Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border mb-1" />
                        
                        <div className="space-y-1">
                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'interviewing')} className="rounded-md py-2 px-2 text-sm font-medium text-purple-500 cursor-pointer gap-2 focus:bg-purple-500/10 focus:text-purple-500">
                            <Calendar className="w-4 h-4" /> Interviewing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'selected')} className="rounded-md py-2 px-2 text-sm font-medium text-emerald-500 cursor-pointer gap-2 focus:bg-emerald-500/10 focus:text-emerald-500">
                            <CheckCircle2 className="w-4 h-4" /> Selected
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'rejected')} className="rounded-md py-2 px-2 text-sm font-medium text-muted-foreground cursor-pointer gap-2 focus:bg-secondary focus:text-muted-foreground">
                            <XCircle className="w-4 h-4" /> Rejected
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border my-1" />
                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'applied')} className="rounded-md py-2 px-2 text-sm font-medium text-muted-foreground cursor-pointer gap-2 focus:bg-secondary justify-center">
                            Reset to Pending
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-lg text-center shadow-sm">
          <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No applications found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-1 text-sm font-medium">
            {search || statusFilter !== 'all' 
              ? "We couldn't find any candidates matching your filters." 
              : "Once candidates apply, their profiles will appear here."}
          </p>
          {(search || statusFilter !== 'all') && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
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

// --- HELPER COMPONENTS ---

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    applied: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    interviewing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    selected: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rejected: "bg-secondary text-muted-foreground border-border"
  }

  const labels: any = {
    applied: "Reviewing",
    interviewing: "Interview",
    selected: "Hired",
    rejected: "Rejected"
  }

  return (
    <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-wider justify-center ${styles[status] || styles.applied}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'rejected' ? 'bg-muted-foreground' : 'bg-current animate-pulse'}`} />
      {labels[status] || status}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    primary: "text-primary bg-primary/10 border-primary/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex flex-col gap-2">
      <div className={`w-8 h-8 rounded flex items-center justify-center border ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none mb-1">{value}</p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}