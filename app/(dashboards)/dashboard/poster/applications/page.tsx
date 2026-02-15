"use client"

import * as React from "react"
import { 
  Search, MoreHorizontal, 
  MapPin, Calendar, Mail, Phone,
  CheckCircle2, XCircle, Clock, 
  Loader2, Briefcase, User, 
  FileText, Download, Filter
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
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6 font-sans text-slate-900 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="mb-8 md:mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1C3FA4] border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
          <Briefcase className="w-3.5 h-3.5" /> Pipeline Management
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          Candidate <span className="text-[#1C3FA4]">Applications</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm max-w-lg leading-relaxed">
          Screen resumes, schedule interviews, and manage hiring decisions from a centralized dashboard.
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Candidates" value={stats.total} icon={Briefcase} color="blue" />
        <StatCard label="Needs Review" value={stats.applied} icon={Clock} color="amber" />
        <StatCard label="Interviewing" value={stats.interview} icon={Calendar} color="purple" />
        <StatCard label="Selected" value={stats.selected} icon={CheckCircle2} color="emerald" />
      </div>

      {/* TOOLBAR */}
      <div className="sticky top-4 z-20 bg-white/80 backdrop-blur-md border border-slate-100 p-2 rounded-[2rem] shadow-xl shadow-blue-900/5 mb-8 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
          <Input 
            placeholder="Search by candidate name or job title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-11 rounded-[1.5rem] border-slate-200 bg-white/50 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all shadow-none"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar items-center px-1">
          {['all', 'applied', 'interviewing', 'selected', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
                statusFilter === f 
                  ? "bg-[#1C3FA4] text-white shadow-md shadow-blue-900/10" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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
          <Loader2 className="w-10 h-10 text-[#1C3FA4] animate-spin mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Syncing Data...</p>
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {filteredApps.map((app) => (
            <div 
              key={app.id} 
              className="group bg-white border border-slate-100 rounded-[2.5rem] p-6 hover:border-[#1C3FA4]/30 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Status Indicator Stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                app.status === 'selected' ? 'bg-emerald-500' : 
                app.status === 'interviewing' ? 'bg-purple-500' :
                app.status === 'rejected' ? 'bg-slate-200' : 'bg-amber-400'
              }`} />

              <div className="flex flex-col lg:flex-row gap-6 lg:items-center pl-3">
                
                {/* 1. Candidate Identity */}
                <div className="flex items-center gap-5 lg:w-[28%] shrink-0">
                  <Avatar className="h-16 w-16 rounded-2xl border-4 border-slate-50 shadow-sm">
                    <AvatarImage src={app.candidates?.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-[#1C3FA4] text-white font-bold text-lg rounded-2xl">
                      {app.candidates?.full_name?.[0]?.toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg truncate">
                      {app.candidates?.full_name || "Unknown Candidate"}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <p className="text-xs font-medium text-slate-500">
                        {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Job & Contact Info */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {/* Job */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applying For</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <div className="p-1.5 bg-blue-50 rounded-lg text-[#1C3FA4]">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{app.jobs?.title || "Unknown Role"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pl-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {app.jobs?.location || "Remote"}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                    <div className="flex flex-col gap-1.5">
                      <a href={`mailto:${app.candidates?.email}`} className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-[#1C3FA4] transition-colors w-fit">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {app.candidates?.email}
                      </a>
                      {app.candidates?.phone && (
                        <a href={`tel:${app.candidates?.phone}`} className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-[#1C3FA4] transition-colors w-fit">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {app.candidates?.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Actions & Resume */}
                <div className="flex flex-row lg:flex-col xl:flex-row items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 lg:border-l border-slate-50 pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto">
                  
                  {/* Resume Button */}
                  {app.candidates?.resume_url ? (
                    <a 
                      href={app.candidates.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-[#1C3FA4] hover:text-white transition-all text-xs font-bold shadow-sm hover:shadow-md active:scale-95 group/btn"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Resume</span>
                      <Download className="w-3 h-3 opacity-50 group-hover/btn:opacity-100" />
                    </a>
                  ) : (
                    <div className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-400 text-xs font-bold border border-slate-100 cursor-not-allowed">
                      <FileText className="w-3.5 h-3.5" /> No PDF
                    </div>
                  )}

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#1C3FA4] transition-all">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-xl p-2 bg-white">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1.5">
                          Change Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-50 mb-1" />
                        
                        <div className="space-y-1">
                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'interviewing')} className="rounded-lg py-2.5 px-3 text-purple-600 font-medium hover:bg-purple-50 cursor-pointer gap-3">
                            <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center"><Calendar className="w-3.5 h-3.5" /></div> Interviewing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'selected')} className="rounded-lg py-2.5 px-3 text-emerald-600 font-medium hover:bg-emerald-50 cursor-pointer gap-3">
                            <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5" /></div> Selected
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'rejected')} className="rounded-lg py-2.5 px-3 text-rose-600 font-medium hover:bg-rose-50 cursor-pointer gap-3">
                            <div className="w-6 h-6 rounded-md bg-rose-100 flex items-center justify-center"><XCircle className="w-3.5 h-3.5" /></div> Rejected
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-50 my-1" />
                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'applied')} className="rounded-lg py-2 px-3 text-slate-500 font-medium hover:bg-slate-50 cursor-pointer text-xs justify-center">
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
        <div className="flex flex-col items-center justify-center py-32 bg-white border border-slate-100 rounded-[2.5rem] text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
            <User className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No applications found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm font-medium leading-relaxed">
            {search || statusFilter !== 'all' 
              ? "We couldn't find any candidates matching your filters." 
              : "Once candidates apply, their profiles will appear here."}
          </p>
          {(search || statusFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
              className="mt-6 rounded-xl border-slate-200 text-slate-600 hover:text-[#1C3FA4] hover:border-blue-100 hover:bg-blue-50"
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
    applied: "bg-amber-50 text-amber-700 border-amber-100",
    interviewing: "bg-purple-50 text-purple-700 border-purple-100",
    selected: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rejected: "bg-slate-50 text-slate-500 border-slate-100"
  }

  const labels: any = {
    applied: "Reviewing",
    interviewing: "Interview",
    selected: "Hired",
    rejected: "Rejected"
  }

  return (
    <div className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider min-w-[110px] justify-center ${styles[status] || styles.applied}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'rejected' ? 'bg-slate-400' : 'bg-current animate-pulse'}`} />
      {labels[status] || status}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
  }

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}