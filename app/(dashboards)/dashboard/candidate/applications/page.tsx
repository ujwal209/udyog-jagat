"use client"

import * as React from "react"
import Link from "next/link"
import { 
  FileText, MapPin, Calendar, Building2, ChevronRight, 
  CheckCircle2, Search, SlidersHorizontal, X, ArrowRight, Briefcase,XCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMyApplicationsAction } from "@/app/actions/application-actions"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ApplicationsPage() {
  const [applications, setApplications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  React.useEffect(() => {
    async function init() {
      try {
        const data = await getMyApplicationsAction()
        setApplications(data)
      } catch (err) {
        toast.error("Failed to load applications")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const filteredApps = applications.filter(app => {
    const matchesQuery = app.job.title.toLowerCase().includes(query.toLowerCase()) ||
                         app.job.location.toLowerCase().includes(query.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesQuery && matchesStatus
  })

  // Status Options
  const statusOptions = [
    { value: "all", label: "All Applications" },
    { value: "applied", label: "Applied" },
    { value: "screening", label: "Screening" },
    { value: "interview", label: "Interview" },
    { value: "offer", label: "Offer Received" },
    { value: "rejected", label: "Rejected" },
  ]

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-6 lg:p-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            My <span className="text-[#1C3FA4]">Applications</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Track and manage your ongoing job applications.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           {/* Search Bar */}
           <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
              <Input 
                placeholder="Search role or company..." 
                className="h-11 pl-10 rounded-xl bg-white border-slate-200 shadow-sm focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] transition-all text-sm font-medium placeholder:text-slate-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
           </div>

           {/* Status Filter Dropdown */}
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button 
                   variant="outline" 
                   className="h-11 px-4 rounded-xl bg-white border-slate-200 text-slate-600 hover:text-[#1C3FA4] hover:bg-blue-50 hover:border-blue-100 gap-2 transition-all font-medium"
                 >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                    {statusFilter !== "all" && <span className="w-2 h-2 rounded-full bg-[#1C3FA4]" />}
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 rounded-xl border border-slate-200 shadow-xl shadow-blue-900/5 bg-white p-1 z-50"
              >
                 {statusOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                       key={option.value}
                       checked={statusFilter === option.value}
                       onCheckedChange={() => setStatusFilter(option.value)}
                       className="rounded-lg text-sm font-medium text-slate-600 focus:text-[#1C3FA4] focus:bg-blue-50 cursor-pointer py-2 data-[state=checked]:text-[#1C3FA4] data-[state=checked]:bg-blue-50"
                    >
                       {option.label}
                    </DropdownMenuCheckboxItem>
                 ))}
              </DropdownMenuContent>
           </DropdownMenu>

           {/* Clear Filters */}
           {(query || statusFilter !== "all") && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => { setQuery(""); setStatusFilter("all"); }}
                className="h-11 w-11 rounded-xl text-red-500 bg-white border border-transparent hover:bg-red-50 hover:border-red-100 transition-colors"
                title="Clear Filters"
              >
                 <X className="w-4 h-4" />
              </Button>
           )}
        </div>
      </div>

      {/* --- LIST --- */}
      {loading ? (
        <div className="space-y-4">
           {[1,2,3].map(i => (
             <div key={i} className="h-40 rounded-[1.5rem] bg-slate-50 animate-pulse border border-slate-100" />
           ))}
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="grid gap-6">
          {filteredApps.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      ) : (
        <EmptyState hasFilters={query !== "" || statusFilter !== "all"} onReset={() => { setQuery(""); setStatusFilter("all"); }} />
      )}
    </div>
  )
}

// --- CARD COMPONENT ---
function ApplicationCard({ application }: { application: any }) {
  const { job, status, applied_at } = application
  
  // Status Config
  const statusConfig: any = {
    applied: { color: "bg-blue-50 text-[#1C3FA4] border-blue-100", label: "Application Sent", icon: FileText, step: 1 },
    screening: { color: "bg-purple-50 text-purple-700 border-purple-100", label: "Under Review", icon: Search, step: 2 },
    interview: { color: "bg-orange-50 text-orange-700 border-orange-100", label: "Interview", icon: Calendar, step: 3 },
    offer: { color: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Offer Received", icon: CheckCircle2, step: 4 },
    rejected: { color: "bg-slate-50 text-slate-600 border-slate-200", label: "Not Selected", icon: XCircle, step: 4 },
  }

  const currentStatus = statusConfig[status] || statusConfig.applied

  return (
    <div className="group bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
      
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between relative z-10">
        
        {/* Left: Job Info */}
        <div className="flex items-start gap-5">
           <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-3 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
              {job.company_logo_url ? (
                <img src={job.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-7 h-7 text-slate-300" />
              )}
           </div>
           
           <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#1C3FA4] transition-colors">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
                 <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.department}</span>
                 <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Applied on {new Date(applied_at).toLocaleDateString()}</p>
           </div>
        </div>

        {/* Right: Status & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-5 lg:pt-0">
           
           {/* Visual Progress Dots */}
           <div className="flex items-center gap-1.5 hidden sm:flex">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className={`h-1.5 w-6 rounded-full transition-colors ${
                  step <= currentStatus.step 
                    ? status === 'rejected' ? "bg-slate-300" : "bg-[#1C3FA4]" 
                    : "bg-slate-100"
                }`} />
              ))}
           </div>

           {/* Status Badge */}
           <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${currentStatus.color}`}>
              <currentStatus.icon className="w-3.5 h-3.5" />
              {currentStatus.label}
           </div>

           {/* View Job Button (Fixed Color) */}
           <Link href={`/dashboard/candidate/jobs/${job.id}`}>
             <Button 
               variant="outline" 
               className="border-blue-200 text-[#1C3FA4] bg-white hover:bg-[#1C3FA4] hover:text-white h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
             >
               View Job
             </Button>
           </Link>
        </div>

      </div>
    </div>
  )
}

// --- EMPTY STATE ---
function EmptyState({ hasFilters, onReset }: { hasFilters?: boolean, onReset?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
          <FileText className="w-7 h-7 text-slate-300" />
       </div>
       <h3 className="text-lg font-semibold text-slate-900">
         {hasFilters ? "No applications found" : "No applications yet"}
       </h3>
       <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 mb-6 font-medium leading-relaxed">
         {hasFilters 
           ? "We couldn't find any applications matching your filters." 
           : "Start exploring open roles and apply to your dream job today."}
       </p>
       
       {hasFilters ? (
         <Button 
           variant="outline"
           onClick={onReset}
           className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl h-10 px-6 font-semibold"
         >
           Reset Filters
         </Button>
       ) : (
         <Link href="/dashboard/candidate/jobs">
           <Button className="bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl h-11 px-8 font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
             Browse Jobs <ArrowRight className="w-4 h-4 ml-2" />
           </Button>
         </Link>
       )}
    </div>
  )
}