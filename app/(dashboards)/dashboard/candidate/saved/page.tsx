"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Bookmark, MapPin, Briefcase, Building2, Trash2, Calendar, Search, 
  CheckCircle2, Clock, FileText, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getSavedJobsAction, removeSavedJobAction } from "@/app/actions/saved-jobs-actions"
import { toast } from "sonner"

export default function SavedJobsPage() {
  const router = useRouter()
  const [savedJobs, setSavedJobs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    async function init() {
      try {
        const data = await getSavedJobsAction()
        setSavedJobs(data)
      } catch (err) {
        toast.error("Failed to load saved jobs")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleRemove = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation()
    const originalList = [...savedJobs]
    setSavedJobs(prev => prev.filter(item => item.job.id !== jobId))
    toast("Job Removed", { icon: <Trash2 className="w-4 h-4 text-slate-500" /> })

    const res = await removeSavedJobAction(jobId)
    if (!res.success) {
      toast.error("Failed to remove")
      setSavedJobs(originalList)
    }
  }

  const filteredList = savedJobs.filter(item => 
    item.job.title.toLowerCase().includes(query.toLowerCase()) ||
    item.job.department.toLowerCase().includes(query.toLowerCase())
  )

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied': return { color: "bg-blue-50 text-[#1C3FA4] border-blue-100", icon: FileText, text: "Applied" }
      case 'screening': return { color: "bg-purple-50 text-purple-700 border-purple-100", icon: Search, text: "Screening" }
      case 'interview': return { color: "bg-orange-50 text-orange-700 border-orange-100", icon: Clock, text: "Interview" }
      case 'offer': return { color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2, text: "Offer" }
      case 'rejected': return { color: "bg-slate-50 text-slate-500 border-slate-200", icon: FileText, text: "Closed" }
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-6 lg:p-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Saved <span className="text-[#1C3FA4]">Jobs</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Manage your bookmarks and check application statuses.
          </p>
        </div>
        
        <div className="relative w-full md:w-72 group">
           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
           <Input 
             placeholder="Search saved jobs..." 
             className="h-11 pl-10 rounded-xl bg-white border-slate-200 shadow-sm focus:border-[#1C3FA4] focus:ring-1 focus:ring-[#1C3FA4] transition-all text-sm font-medium placeholder:text-slate-400"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />
        </div>
      </div>

      {/* --- CONTENT --- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[1,2,3,4].map(i => (
             <div key={i} className="h-56 rounded-[1.5rem] bg-slate-50 animate-pulse border border-slate-100" />
           ))}
        </div>
      ) : filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredList.map(({ job, application_status }) => {
            const statusMeta = application_status ? getStatusBadge(application_status) : null

            return (
              <div 
                key={job.id}
                onClick={() => router.push(`/dashboard/candidate/jobs/${job.id}`)}
                className="group bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300 relative cursor-pointer flex flex-col h-full"
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-5">
                   <div className="flex gap-4 items-center">
                     <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {job.company_logo_url ? (
                          <img src={job.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-300" />
                        )}
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1C3FA4] transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-500">{job.department}</p>
                     </div>
                   </div>
                   
                   <Button
                     onClick={(e) => handleRemove(e, job.id)}
                     variant="ghost"
                     size="icon"
                     className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors -mr-2"
                     title="Remove from saved"
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                   <Badge variant="secondary" className="bg-slate-50 text-slate-600 border border-slate-100 font-medium rounded-lg px-2.5 py-1 text-[10px]">
                      <Briefcase className="w-3 h-3 mr-1.5" /> {job.type}
                   </Badge>
                   <Badge variant="secondary" className="bg-slate-50 text-slate-600 border border-slate-100 font-medium rounded-lg px-2.5 py-1 text-[10px]">
                      <MapPin className="w-3 h-3 mr-1.5" /> {job.location}
                   </Badge>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                   
                   {/* Status Indicator */}
                   {statusMeta ? (
                     <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${statusMeta.color}`}>
                        <statusMeta.icon className="w-3 h-3" />
                        {statusMeta.text}
                     </div>
                   ) : (
                     <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Posted {new Date(job.created_at).toLocaleDateString()}
                     </span>
                   )}
                   
                   {/* Contextual Button */}
                   {application_status ? (
                     <Link href="/dashboard/candidate/applications" onClick={(e) => e.stopPropagation()}>
                       {/* FIXED: Explicitly white background with blue hover states */}
                       <Button 
                         variant="outline" 
                         className="h-9 px-4 bg-white border border-slate-200 text-slate-600 hover:text-[#1C3FA4] hover:border-[#1C3FA4] hover:bg-blue-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                       >
                         View Status
                       </Button>
                     </Link>
                   ) : (
                     <Button 
                       onClick={(e) => {
                         e.stopPropagation()
                         router.push(`/dashboard/candidate/jobs/${job.id}`)
                       }}
                       className="h-9 px-5 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-900/10 active:scale-95 transition-all"
                     >
                       Apply Now
                     </Button>
                   )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState hasFilters={query !== ""} onReset={() => setQuery("")} />
      )}
    </div>
  )
}

function EmptyState({ hasFilters, onReset }: { hasFilters: boolean, onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
          <Bookmark className="w-7 h-7 text-slate-300" />
       </div>
       <h3 className="text-lg font-semibold text-slate-900">
         {hasFilters ? "No matches found" : "No saved jobs"}
       </h3>
       <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 mb-6 font-medium">
         {hasFilters 
           ? "Try adjusting your search terms."
           : "Jobs you bookmark will appear here for easy access."}
       </p>
       
       {hasFilters ? (
         <Button 
           variant="outline"
           onClick={onReset}
           className="border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl font-semibold"
         >
           Reset Search
         </Button>
       ) : (
         <Link href="/dashboard/candidate/jobs">
           <Button className="bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl h-11 px-8 font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
             Find Jobs <ArrowRight className="w-4 h-4 ml-2" />
           </Button>
         </Link>
       )}
    </div>
  )
}