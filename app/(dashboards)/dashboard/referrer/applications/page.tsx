"use client"

import * as React from "react"
import { 
  Search, Filter, Download, ExternalLink, 
  Mail, Phone, Calendar, 
  Briefcase, CheckCircle2, XCircle, Clock, 
  FileText, Loader2, User, MapPin, Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getReferrerApplicationsAction, updateApplicationStatusAction } from "@/app/actions/referrer-applications-actions"
import { toast } from "sonner"

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  applied: { label: "Applied", color: "bg-blue-50 text-blue-700 border-blue-200", icon: FileText },
  screening: { label: "Screening", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Search },
  interview: { label: "Interview", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Calendar },
  offer: { label: "Offer Sent", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-slate-50 text-slate-500 border-slate-200", icon: XCircle },
  hired: { label: "Hired", color: "bg-[#1C3FA4] text-white border-[#1C3FA4]", icon: CheckCircle2 },
}

const STATUS_OPTIONS = Object.keys(STATUS_CONFIG)

export default function ApplicationsPage() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<{ applications: any[], jobs: any[] }>({ applications: [], jobs: [] })
  const [search, setSearch] = React.useState("")
  const [jobFilter, setJobFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [processingId, setProcessingId] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    const result = await getReferrerApplicationsAction({ 
      search, 
      jobId: jobFilter, 
      status: statusFilter 
    })
    setData(result as any)
    setLoading(false)
  }, [search, jobFilter, statusFilter])

  React.useEffect(() => {
    const timer = setTimeout(() => fetchData(), 300)
    return () => clearTimeout(timer)
  }, [fetchData])

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setProcessingId(appId)
    const originalApps = [...data.applications]
    setData(prev => ({
      ...prev,
      applications: prev.applications.map(app => app.id === appId ? { ...app, status: newStatus } : app)
    }))

    const res = await updateApplicationStatusAction(appId, newStatus)
    if (res.success) {
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`)
    } else {
      setData(prev => ({ ...prev, applications: originalApps }))
      toast.error("Failed to update status")
    }
    setProcessingId(null)
  }

  return (
    <div className="min-h-screen bg-white p-6 lg:p-10 font-sans text-slate-900 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
           <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
             Candidate <span className="text-[#1C3FA4]">Applications</span>
           </h1>
           <p className="text-slate-500 text-sm font-medium">
             Comprehensive view of candidate profiles and their hiring status.
           </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 bg-white sticky top-4 z-30 pt-2 pb-4 border-b border-slate-50">
           <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
              <Input 
                placeholder="Search by name, email, or phone..." 
                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1C3FA4] transition-all text-slate-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>

           <div className="flex flex-col sm:flex-row gap-3">
              <Select value={jobFilter} onValueChange={setJobFilter}>
                 <SelectTrigger className="h-12 w-full sm:w-[240px] rounded-xl bg-white border-slate-200 text-slate-900 font-medium focus:border-[#1C3FA4]">
                    <div className="flex items-center gap-2 truncate text-slate-900">
                       <Briefcase className="w-4 h-4 text-slate-400" />
                       <span className="truncate">{data.jobs.find(j => j.id === jobFilter)?.title || "All Jobs"}</span>
                    </div>
                 </SelectTrigger>
                 <SelectContent className="bg-white border-slate-100 shadow-xl rounded-xl">
                    <SelectItem value="all" className="text-slate-700">All Jobs</SelectItem>
                    {data.jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id} className="text-slate-700">{job.title}</SelectItem>
                    ))}
                 </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                 <SelectTrigger className="h-12 w-full sm:w-[180px] rounded-xl bg-white border-slate-200 text-slate-900 font-medium focus:border-[#1C3FA4]">
                    <div className="flex items-center gap-2 text-slate-900">
                       <Filter className="w-4 h-4 text-slate-400" />
                       <SelectValue placeholder="Status" />
                    </div>
                 </SelectTrigger>
                 <SelectContent className="bg-white border-slate-100 shadow-xl rounded-xl">
                    <SelectItem value="all" className="text-slate-700">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} className="text-slate-700 capitalize">{status}</SelectItem>
                    ))}
                 </SelectContent>
              </Select>
           </div>
        </div>

        {loading ? (
           <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-44 bg-slate-50 rounded-[1.5rem] animate-pulse" />)}
           </div>
        ) : data.applications.length > 0 ? (
           <div className="grid grid-cols-1 gap-6">
              {data.applications.map((app) => {
                const statusInfo = STATUS_CONFIG[app.status] || STATUS_CONFIG['applied']
                const isProcessing = processingId === app.id

                return (
                  <div key={app.id} className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 relative">
                     {isProcessing && (
                       <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 rounded-[2rem] flex items-center justify-center">
                         <Loader2 className="w-6 h-6 text-[#1C3FA4] animate-spin" />
                       </div>
                     )}

                     <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Profile & Name Section */}
                        <div className="flex items-start gap-4 lg:w-1/3">
                           <Avatar className="w-16 h-16 border-2 border-white shadow-md bg-slate-50 shrink-0">
                              <AvatarImage src={app.candidate.avatar_url} />
                              <AvatarFallback className="bg-blue-50 text-[#1C3FA4] text-xl font-bold">
                                 {app.candidate.full_name?.charAt(0) || "C"}
                              </AvatarFallback>
                           </Avatar>
                           <div className="space-y-1 min-w-0">
                              <h3 className="text-lg font-bold text-slate-900 truncate">{app.candidate.full_name}</h3>
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${statusInfo.color}`}>
                                 <statusInfo.icon className="w-3 h-3" />
                                 {statusInfo.label}
                              </div>
                              <p className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                                 <Calendar className="w-3 h-3" /> Applied {new Date(app.applied_at).toLocaleDateString()}
                              </p>
                           </div>
                        </div>

                        {/* Contact Info Section */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-3">
                              <div className="flex items-center gap-3 group/item">
                                 <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover/item:text-[#1C3FA4] transition-colors">
                                    <Mail className="w-4 h-4" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                                    <p className="text-sm font-medium text-slate-700 truncate">{app.candidate.email}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3 group/item">
                                 <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover/item:text-[#1C3FA4] transition-colors">
                                    <Phone className="w-4 h-4" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                                    <p className="text-sm font-medium text-slate-700">{app.candidate.phone || "Not Provided"}</p>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <div className="flex items-center gap-3 group/item">
                                 <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover/item:text-[#1C3FA4] transition-colors">
                                    <Briefcase className="w-4 h-4" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Applied For</p>
                                    <p className="text-sm font-bold text-[#1C3FA4] truncate">{app.job.title}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3 group/item">
                                 <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover/item:text-[#1C3FA4] transition-colors">
                                    <MapPin className="w-4 h-4" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Location</p>
                                    <p className="text-sm font-medium text-slate-700">{app.job.location}</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Sticky Action Side */}
                        <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto lg:border-l border-slate-100 lg:pl-8 pt-4 lg:pt-0">
                           {app.candidate.resume_url ? (
                             <a href={app.candidate.resume_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                <Button variant="outline" className="w-full h-11 bg-white border-slate-200 text-slate-600 hover:text-[#1C3FA4] hover:bg-blue-50 rounded-xl font-bold text-xs uppercase tracking-wide">
                                   <FileText className="w-4 h-4 mr-2" /> View Resume
                                </Button>
                             </a>
                           ) : (
                             <Button disabled variant="outline" className="flex-1 h-11 bg-slate-50 border-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-wide">
                                No Resume
                             </Button>
                           )}

                           <DropdownMenu>
                              <DropdownMenuTrigger asChild className="flex-1">
                                 <Button className="w-full h-11 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-md transition-all active:scale-95">
                                    Manage Status
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-slate-100 shadow-2xl bg-white z-[100]">
                                 <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-widest font-bold px-2 py-1.5">Set Status</DropdownMenuLabel>
                                 <DropdownMenuSeparator className="bg-slate-50" />
                                 {STATUS_OPTIONS.map((status) => {
                                    const info = STATUS_CONFIG[status]
                                    const isActive = app.status === status
                                    return (
                                      <DropdownMenuItem 
                                        key={status} 
                                        onClick={() => handleStatusChange(app.id, status)}
                                        disabled={isActive}
                                        className={`rounded-lg cursor-pointer font-medium text-xs py-2.5 px-3 mb-1 transition-colors ${isActive ? "bg-slate-50 text-slate-400" : "text-slate-600 focus:bg-blue-50 focus:text-[#1C3FA4]"}`}
                                      >
                                         <div className={`w-2 h-2 rounded-full mr-3 ${info.color.split(" ")[0].replace("bg-", "bg-opacity-100 bg-")}`} />
                                         {info.label}
                                         {isActive && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-slate-400" />}
                                      </DropdownMenuItem>
                                    )
                                 })}
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                     </div>
                  </div>
                )
              })}
           </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 text-slate-300">
                 <User className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No applications found</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 mb-6 font-medium">Try adjusting your filters to find specific candidates.</p>
              {(search || jobFilter !== 'all' || statusFilter !== 'all') && (
                 <Button onClick={() => { setSearch(""); setJobFilter("all"); setStatusFilter("all"); }} variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider">
                   Clear Filters
                 </Button>
              )}
           </div>
        )}
      </div>
    </div>
  )
}