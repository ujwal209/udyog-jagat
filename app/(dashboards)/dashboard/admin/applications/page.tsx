"use client"

import * as React from "react"
import { 
  Search, Filter, Briefcase, Calendar, 
  CheckCircle2, XCircle, MoreHorizontal, 
  Loader2, ChevronDown, Clock, UserCheck, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { getAdminApplications, updateApplicationStatus } from "@/app/actions/admin-application-actions"

export default function AdminApplicationsPage() {
  const [loading, setLoading] = React.useState(true)
  const [applications, setApplications] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  // Defined Status List (The 4 Stages)
  const STATUS_LIST = ['screening', 'interviewing', 'hired', 'rejected']

  React.useEffect(() => {
    async function loadData() {
      const res = await getAdminApplications()
      if (res.success) {
        setApplications(res.data || [])
      } else {
        toast.error(res.error)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const toastId = toast.loading("Updating status...")
    
    // Optimistic Update
    const prevApps = [...applications]
    setApplications(apps => apps.map(a => a.id === id ? { ...a, status: newStatus } : a))

    const res = await updateApplicationStatus(id, newStatus)
    
    if (res.success) {
      toast.success(`Candidate marked as ${newStatus}`, { id: toastId })
    } else {
      setApplications(prevApps) 
      toast.error("Failed to update status", { id: toastId })
    }
  }

  const filteredApps = applications.filter(app => {
    const candidateName = app.candidate?.full_name?.toLowerCase() || ""
    const jobTitle = app.job?.title?.toLowerCase() || ""
    const query = searchQuery.toLowerCase()

    const matchesSearch = candidateName.includes(query) || jobTitle.includes(query)
    const matchesStatus = statusFilter === 'all' || app.status?.toLowerCase() === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[#1C3FA4] animate-spin mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Applications...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 font-sans text-slate-900 animate-in fade-in duration-500 min-h-screen bg-white">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-slate-50 pb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Applications</h1>
          <p className="text-slate-500 font-medium text-sm max-w-lg">
            Manage candidates through the 4 stages of recruitment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 text-[#1C3FA4] text-xs font-bold uppercase tracking-wide shadow-sm">
            Total Candidates: {applications.length}
          </div>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 sticky top-0 z-20 bg-white/80 backdrop-blur-md py-4 border-b border-transparent">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
          <Input 
            placeholder="Search by candidate or job..." 
            className="pl-11 h-12 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#1C3FA4]/20 focus-visible:border-[#1C3FA4] transition-all shadow-sm hover:border-slate-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="h-12 px-6 rounded-xl border-slate-200 bg-white text-slate-600 font-medium hover:text-[#1C3FA4] hover:border-[#1C3FA4] hover:bg-blue-50 transition-all gap-3 min-w-[180px] justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px] rounded-xl border-slate-100 shadow-xl p-1.5 bg-white">
            <DropdownMenuItem 
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-3 py-2.5 cursor-pointer capitalize font-medium mb-1 transition-colors ${statusFilter === 'all' ? 'bg-blue-50 text-[#1C3FA4]' : 'text-slate-600'}`}
            >
              All Status
            </DropdownMenuItem>
            {STATUS_LIST.map((status) => (
              <DropdownMenuItem 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-2.5 cursor-pointer capitalize font-medium transition-colors ${
                  statusFilter === status 
                    ? 'bg-blue-50 text-[#1C3FA4]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* --- APPLICATION LIST --- */}
      <div className="space-y-4 pb-20">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div 
              key={app.id} 
              className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
            >
              {/* Left: Candidate Info */}
              <div className="flex items-start gap-5 mb-4 md:mb-0 pl-2">
                <Avatar className="w-14 h-14 border-2 border-white shadow-sm ring-1 ring-slate-100 shrink-0">
                  <AvatarImage src={app.candidate?.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-blue-50 text-[#1C3FA4] font-bold text-lg">
                    {app.candidate?.full_name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 text-base group-hover:text-[#1C3FA4] transition-colors truncate">
                    {app.candidate?.full_name || "Unknown Candidate"}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      Applied for <span className="text-slate-900 font-medium">{app.job?.title}</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 bg-slate-200 rounded-full" />
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(app.applied_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Actions & Status */}
              <div className="flex items-center gap-5 self-end md:self-center pl-2">
                <StatusBadge status={app.status} />
                
                <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-lg text-slate-400 hover:text-[#1C3FA4] hover:bg-blue-50 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-xl p-1.5 bg-white">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Move to Stage
                    </div>
                    
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(app.id, 'screening')}
                      className="rounded-lg py-2.5 px-3 font-medium text-blue-600 hover:bg-blue-50 cursor-pointer gap-2 transition-colors"
                    >
                      <Clock className="w-4 h-4" /> Screening
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(app.id, 'interviewing')}
                      className="rounded-lg py-2.5 px-3 font-medium text-amber-600 hover:bg-amber-50 cursor-pointer gap-2 transition-colors"
                    >
                      <UserCheck className="w-4 h-4" /> Interviewing
                    </DropdownMenuItem>

                    <div className="h-[1px] bg-slate-50 my-1" />

                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(app.id, 'hired')}
                      className="rounded-lg py-2.5 px-3 font-medium text-emerald-600 hover:bg-emerald-50 cursor-pointer gap-2 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Hired / Selected
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(app.id, 'rejected')}
                      className="rounded-lg py-2.5 px-3 font-medium text-red-600 hover:bg-red-50 cursor-pointer gap-2 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Rejected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-100 rounded-[2.5rem] text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">No applications found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm font-medium leading-relaxed">
              {searchQuery ? "We couldn't find any matches." : "You haven't received any applications yet."}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
                className="mt-6 border-[#1C3FA4] text-[#1C3FA4] hover:bg-blue-50 font-medium rounded-xl h-11 px-8"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  // Normalize Status
  const normalized = status?.toLowerCase() || 'screening'

  const styles: any = {
    screening: "bg-blue-50 text-blue-600 border-blue-100",
    interviewing: "bg-amber-50 text-amber-600 border-amber-100",
    hired: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-red-50 text-red-600 border-red-100",
    // Fallbacks
    applied: "bg-slate-50 text-slate-500 border-slate-100",
    shortlisted: "bg-purple-50 text-purple-600 border-purple-100"
  }

  const activeStyle = styles[normalized] || styles.applied

  return (
    <div className={`px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider shadow-sm ${activeStyle}`}>
      {status}
    </div>
  )
}