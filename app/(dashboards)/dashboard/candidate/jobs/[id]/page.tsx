"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, MapPin, Briefcase, Clock, 
  Building2, ChevronRight, Share2, Bookmark, CheckCircle2,
  Sparkles, Copy, Loader2, IndianRupee, User, Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getJobDetailsAction, applyForJobAction } from "@/app/actions/candidate-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function JobDetailsPage({ params }: { params: any }) {
  const router = useRouter()
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
          if (res.hasApplied) setHasApplied(true)
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
          description: `Your profile has been sent to ${data?.job?.poster?.full_name || "the hiring team"}.`,
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
      icon: <Bookmark className={`w-4 h-4 ${!isSaved ? "text-primary fill-current" : "text-muted-foreground"}`} />
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link Copied", {
      description: "Job link copied to clipboard.",
      icon: <Copy className="w-4 h-4 text-muted-foreground" />
    })
  }

  if (loading) return <JobSkeleton />
  if (!data) return null

  const { job, related } = data
  const poster = job.poster

  return (
    <div className="min-h-screen bg-background font-sans text-foreground animate-in fade-in duration-500 pb-20">
      
      {/* --- TOP NAVIGATION --- */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-10 h-16 flex items-center justify-between transition-all">
         <Link 
           href="/dashboard/candidate/jobs" 
           className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
         >
            <div className="p-1.5 rounded-lg group-hover:bg-primary/10 transition-colors">
              <ArrowLeft className="w-4 h-4" /> 
            </div>
            <span className="hidden sm:inline">Back to Jobs</span>
         </Link>
         
         <div className="flex gap-2">
            <Button onClick={handleShare} variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
               <Share2 className="w-4 h-4" />
            </Button>
            <Button onClick={handleSave} variant="ghost" size="icon" className={`hover:bg-primary/10 rounded-xl transition-all ${isSaved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"}`}>
               <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            </Button>
         </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10 md:space-y-16">
        
        {/* --- HERO SECTION --- */}
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between border-b border-border pb-10">
           <div className="flex flex-col sm:flex-row gap-6 items-start w-full md:w-auto">
             {/* Logo */}
             <div className="w-20 h-20 rounded-2xl bg-card border border-border shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] flex items-center justify-center p-4 shrink-0">
                {job.company_logo_url ? (
                  <img src={job.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                )}
             </div>
             
             <div className="space-y-3 w-full">
                 <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight">
                   {job.title}
                 </h1>
                 
                 <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary/60" /> {job.department}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary/60" /> {job.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary/60" /> {new Date(job.created_at).toLocaleDateString()}
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
                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-none border border-emerald-500/20 cursor-default" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
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
                 <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    About the Role
                 </h2>
                 {/* Safely render HTML from AI */}
                 <div 
                   className="prose prose-slate prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary max-w-none prose-p:leading-relaxed text-[15px]"
                   dangerouslySetInnerHTML={{ __html: job.description }}
                 />
             </section>
           </div>

           {/* --- RIGHT: SIDEBAR META (4 Cols) --- */}
           <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
             
             {/* Job Snapshot Card */}
             <div className="bg-card rounded-[2rem] border border-border p-6 space-y-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
                 
                 <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                   <Sparkles className="w-3.5 h-3.5 text-primary" /> Job Snapshot
                 </h3>
                 
                 <div className="space-y-5">
                    <MetaItem label="Salary Range" value={`₹ ${job.salary_range || "Competitive"}`} icon={IndianRupee} />
                    <MetaItem label="Job Type" value={job.type} icon={Briefcase} />
                    <MetaItem label="Location" value={`${job.city || ""}, ${job.state || job.location}`} icon={MapPin} />
                    <MetaItem label="Department" value={job.department} icon={Building2} />
                 </div>
             </div>

             {/* Poster Identity Card */}
             {poster && (
               <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm space-y-5">
                 <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                   <User className="w-3.5 h-3.5 text-primary" /> Posted By
                 </h3>
                 
                 <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 rounded-xl border border-border shadow-sm">
                      <AvatarImage src={poster.avatar_url} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {poster.full_name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-none">{poster.full_name}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                         <Mail className="w-3 h-3" /> {poster.email}
                      </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 pt-5 border-t border-border">
                    <div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Vibhaaga</p>
                       <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{poster.vibhaaga || "N/A"}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Milan/Valaya</p>
                       <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{poster.milan || poster.valaya || "N/A"}</p>
                    </div>
                 </div>
               </div>
             )}

             {/* Similar Jobs */}
             {related.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wide px-1">Similar Roles</h3>
                    <div className="space-y-3">
                       {related.map((role: any) => (
                          <Link href={`/dashboard/candidate/jobs/${role.id}`} key={role.id} className="block">
                             <div className="group bg-card p-4 rounded-2xl border border-border hover:border-primary/30 transition-all cursor-pointer">
                                <h4 className="font-semibold text-sm text-foreground group-hover:text-primary truncate transition-colors">
                                   {role.title}
                                </h4>
                                <div className="flex items-center justify-between mt-3">
                                   <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                      <MapPin className="w-3 h-3" /> {role.location}
                                   </span>
                                   <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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
         <div className="p-2.5 bg-background rounded-xl text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 border border-border transition-colors">
            <Icon className="w-4 h-4" />
         </div>
         <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
         </div>
      </div>
   )
}

function JobSkeleton() {
   return (
      <div className="max-w-6xl mx-auto p-10 space-y-12 animate-pulse">
         <div className="h-20 w-full bg-muted rounded-2xl" />
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
               <div className="h-8 w-1/3 bg-muted rounded-lg" />
               <div className="h-64 bg-card rounded-[2rem]" />
               <div className="h-40 bg-card rounded-[2rem]" />
            </div>
            <div className="lg:col-span-4">
               <div className="h-96 bg-card rounded-[2rem]" />
            </div>
         </div>
      </div>
   )
}