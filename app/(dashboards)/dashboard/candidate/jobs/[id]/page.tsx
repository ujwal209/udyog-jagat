"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, MapPin, Briefcase, IndianRupee, Clock, 
  Building2, ChevronRight, Share2, Bookmark, CheckCircle2,
  Sparkles, Copy, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getJobDetailsAction, applyForJobAction } from "@/app/actions/candidate-actions"

export default function JobDetailsPage({ params }: { params: any }) {
  const router = useRouter()
  // React.use() unwraps the params promise in Next.js 15+
  const unwrappedParams = React.use(params) as { id: string }
  const jobId = unwrappedParams.id

  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [applying, setApplying] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)
  const [hasApplied, setHasApplied] = React.useState(false)

  React.useEffect(() => {
    async function init() {
      try {
        const res = await getJobDetailsAction(jobId)
        if (res) {
          setData(res)
          // Set initial applied state from server
          if (res.hasApplied) {
             setHasApplied(true)
          }
        } else {
          toast.error("Job not found")
          router.push("/dashboard/candidate/jobs")
        }
      } catch (error) {
        toast.error("Connection Error")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [jobId, router])

  const handleApply = async () => {
    if (hasApplied) return

    setApplying(true)
    try {
      const result = await applyForJobAction(jobId)
      
      if (result.success) {
        setHasApplied(true)
        toast.success("Application Submitted", {
          description: `Your profile has been sent to ${data?.job?.hiring_manager || "the hiring team"}.`,
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          duration: 4000
        })
      } else {
        toast.error(result.error || "Failed to apply")
      }
    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setApplying(false)
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    toast.success(isSaved ? "Removed from Saved" : "Job Saved", {
      description: isSaved ? "This job is no longer in your list." : "You can find this in your bookmarks.",
      icon: <Bookmark className={`w-4 h-4 ${!isSaved ? "text-[#1C3FA4] fill-current" : "text-slate-400"}`} />
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link Copied", {
      description: "Job link copied to clipboard.",
      icon: <Copy className="w-4 h-4 text-slate-500" />
    })
  }

  if (loading) return <JobSkeleton />
  if (!data) return null

  const { job, related } = data

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 animate-in fade-in duration-500">
      
      {/* --- TOP NAVIGATION --- */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-10 h-16 flex items-center justify-between transition-all">
         <Link 
           href="/dashboard/candidate/jobs" 
           className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#1C3FA4] transition-colors"
         >
            <div className="p-1.5 rounded-lg group-hover:bg-blue-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> 
            </div>
            <span className="hidden sm:inline">Back to Jobs</span>
         </Link>
         
         <div className="flex gap-2">
            <Button onClick={handleShare} variant="ghost" size="icon" className="text-slate-400 hover:text-[#1C3FA4] hover:bg-blue-50 rounded-xl transition-all">
               <Share2 className="w-4 h-4" />
            </Button>
            <Button onClick={handleSave} variant="ghost" size="icon" className={`hover:bg-blue-50 rounded-xl transition-all ${isSaved ? "text-[#1C3FA4] bg-blue-50" : "text-slate-400 hover:text-[#1C3FA4]"}`}>
               <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            </Button>
         </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10 md:space-y-16">
        
        {/* --- HERO SECTION --- */}
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between border-b border-slate-50 pb-10">
           <div className="flex flex-col sm:flex-row gap-6 items-start w-full md:w-auto">
             {/* Logo */}
             <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] flex items-center justify-center p-4 shrink-0">
                {job.company_logo_url ? (
                  <img src={job.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-10 h-10 text-slate-300" />
                )}
             </div>
             
             <div className="space-y-3 w-full">
                 <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                   {job.title}
                 </h1>
                 
                 <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" /> {job.department}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" /> {new Date(job.created_at).toLocaleDateString()}
                    </span>
                 </div>
             </div>
           </div>

           <div className="w-full md:w-auto flex flex-row md:flex-col lg:flex-row gap-3 pt-2 md:pt-0">
              <Button 
                onClick={handleApply} 
                disabled={hasApplied || applying}
                className={`flex-1 md:flex-none h-12 px-8 rounded-xl font-semibold tracking-wide text-sm shadow-xl transition-all active:scale-95
                  ${hasApplied 
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-none border border-emerald-100 cursor-default" 
                    : "bg-[#1C3FA4] hover:bg-[#152d75] text-white shadow-blue-900/10"
                  }
                `}
              >
                 {applying ? (
                   <><Loader2 className="w-4 h-4 animate-spin mr-2"/> Applying...</>
                 ) : hasApplied ? (
                   <><CheckCircle2 className="w-4 h-4 mr-2"/> Applied</>
                 ) : (
                   "Apply Now"
                 )}
              </Button>
           </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* --- LEFT: DESCRIPTION (8 Cols) --- */}
           <div className="lg:col-span-8 space-y-10">
             
             <section className="space-y-4">
                 <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#1C3FA4] rounded-full" />
                    About the Role
                 </h2>
                 <div className="prose prose-slate prose-p:text-slate-600 prose-p:leading-relaxed max-w-none">
                    <p className="whitespace-pre-wrap font-normal text-[15px]">
                      {job.description}
                    </p>
                 </div>
             </section>

             {/* Requirements Section */}
             <section className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 space-y-6">
                 <h3 className="font-bold text-slate-900 text-lg">Key Requirements</h3>
                 <ul className="grid gap-4">
                    <RequirementItem text={`Proven experience in ${job.department} or similar roles.`} />
                    <RequirementItem text="Strong communication skills and ability to work in a fast-paced environment." />
                    <RequirementItem text={`Located in or willing to relocate to ${job.city || job.location}.`} />
                    <RequirementItem text="Ability to work independently and manage multiple tasks." />
                 </ul>
             </section>

           </div>

           {/* --- RIGHT: SIDEBAR META (4 Cols) --- */}
           <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
             
             {/* Job Snapshot Card */}
             <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
                 
                 <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                   <Sparkles className="w-3.5 h-3.5 text-[#1C3FA4]" /> Job Snapshot
                 </h3>
                 
                 <div className="space-y-5">
                    <MetaItem label="Salary Range" value={job.salary_range || "Competitive"} icon={IndianRupee} />
                    <MetaItem label="Job Type" value={job.type} icon={Briefcase} />
                    <MetaItem label="Location" value={`${job.city || ""}, ${job.state || job.location}`} icon={MapPin} />
                    <MetaItem label="Department" value={job.department} icon={Building2} />
                 </div>

                 <div className="pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1C3FA4] font-bold text-sm border border-slate-200 shadow-sm">
                          {job.hiring_manager ? job.hiring_manager.charAt(0) : "H"}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-900">{job.hiring_manager || "Hiring Team"}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Recruiter</p>
                       </div>
                    </div>
                 </div>
             </div>

             {/* Similar Jobs */}
             {related.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide px-1">Similar Roles</h3>
                    <div className="space-y-3">
                       {related.map((role: any) => (
                          <Link href={`/dashboard/candidate/jobs/${role.id}`} key={role.id} className="block">
                             <div className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#1C3FA4]/30 hover:shadow-lg hover:shadow-blue-900/5 transition-all cursor-pointer">
                                <h4 className="font-semibold text-sm text-slate-900 group-hover:text-[#1C3FA4] truncate transition-colors">
                                   {role.title}
                                </h4>
                                <div className="flex items-center justify-between mt-3">
                                   <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                      <MapPin className="w-3 h-3" /> {role.location}
                                   </span>
                                   <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1C3FA4] group-hover:translate-x-0.5 transition-all" />
                                </div>
                             </div>
                          </Link>
                       ))}
                    </div>
                 </div>
             )}

           </div>
        </div>

      </div>
    </div>
  )
}

// --- SUB COMPONENTS ---

function MetaItem({ label, value, icon: Icon }: any) {
   return (
      <div className="flex items-start gap-4 group">
         <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-[#1C3FA4] group-hover:bg-blue-50 transition-colors">
            <Icon className="w-4 h-4" />
         </div>
         <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
         </div>
      </div>
   )
}

function RequirementItem({ text }: { text: string }) {
  return (
    <li className="flex gap-4 items-start text-[15px] text-slate-600 leading-relaxed">
       <div className="mt-1 p-0.5 bg-emerald-100 rounded-full shrink-0">
         <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
       </div>
       <span>{text}</span>
    </li>
  )
}

function JobSkeleton() {
   return (
      <div className="max-w-6xl mx-auto p-10 space-y-12 animate-pulse">
         <div className="h-20 w-full bg-slate-50 rounded-2xl" />
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
               <div className="h-8 w-1/3 bg-slate-100 rounded-lg" />
               <div className="h-64 bg-slate-50 rounded-[2rem]" />
               <div className="h-40 bg-slate-50 rounded-[2rem]" />
            </div>
            <div className="lg:col-span-4">
               <div className="h-96 bg-slate-50 rounded-[2rem]" />
            </div>
         </div>
      </div>
   )
}