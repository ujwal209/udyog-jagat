import * as React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { 
  Briefcase, Users, Calendar, Plus, ArrowRight, 
  MapPin, Building2, TrendingUp 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getReferrerDashboardData } from "@/app/actions/referrer-dashboard-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OrgBanner } from "@/components/org-banner"

export default async function ReferrerDashboard() {
  const data = await getReferrerDashboardData()

  if (!data || !data.referrer) {
    redirect("/login")
  }

  const { referrer, stats, recentJobs, recentApplications } = data

  return (
    <div className="min-h-screen bg-background font-sans text-foreground p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* --- SKIPPABLE ORG BANNER --- */}
      <OrgBanner user={referrer} role="referrer" />

      {/* --- WELCOME HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">{referrer.full_name?.split(' ')[0] || "Recruiter"}</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm max-w-lg">
            Manage your job postings and track candidate progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/dashboard/referrer/jobs/new">
             <Button className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 transition-all active:scale-95 flex items-center gap-2">
               <Plus className="w-4 h-4" /> Post New Job
             </Button>
           </Link>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Active Listings" 
          value={stats?.activeJobs?.toString() || "0"} 
          icon={Briefcase} 
          color="primary" 
          trend="Live Now"
        />
        <StatCard 
          label="Total Candidates" 
          value={stats?.totalCandidates?.toString() || "0"} 
          icon={Users} 
          color="emerald" 
          trend="All Time"
        />
        <StatCard 
          label="Interviews Set" 
          value={stats?.interviewsScheduled?.toString() || "0"} 
          icon={Calendar} 
          color="amber" 
          trend="Upcoming"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- LEFT: RECENT JOBS --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Recent Job Posts</h3>
            <Link href="/dashboard/referrer/jobs" className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wide flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden min-h-[200px]">
            {recentJobs && recentJobs.length > 0 ? (
              <div className="divide-y divide-border">
                {recentJobs.map((job: any) => (
                  <JobRow 
                    key={job.id}
                    title={job.title}
                    location={job.location}
                    type={job.type}
                    date={new Date(job.created_at).toLocaleDateString()}
                    status={job.status}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No active jobs" 
                desc="You haven't posted any jobs yet."
                actionLink="/dashboard/referrer/jobs/new"
                actionText="Create Job"
              />
            )}
          </div>
        </div>

        {/* --- RIGHT: RECENT APPLICANTS --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Recent Applicants</h3>
            <Link href="/dashboard/referrer/applications" className="text-xs font-bold text-muted-foreground hover:text-primary uppercase tracking-wide">
              View All
            </Link>
          </div>

          <div className="bg-card border border-border rounded-[2rem] p-2 shadow-sm min-h-[200px] flex flex-col gap-1">
             {recentApplications && recentApplications.length > 0 ? (
               recentApplications.map((app: any) => (
                 <div key={app.id} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition-colors cursor-pointer">
                    <Avatar className="w-10 h-10 border border-border">
                       <AvatarImage src={app.candidate?.avatar_url} />
                       <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                         {app.candidate?.full_name?.charAt(0) || "C"}
                       </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-bold text-foreground truncate">{app.candidate?.full_name || "Unknown Candidate"}</h4>
                       <p className="text-xs text-muted-foreground truncate">Applied for <span className="text-primary">{app.job?.title}</span></p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                 </div>
               ))
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">No applicants yet</p>
               </div>
             )}
          </div>

          {/* Quick Tip Card */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[2rem] p-6 text-primary-foreground relative overflow-hidden shadow-lg shadow-primary/10">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
             <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                   <TrendingUp className="w-4 h-4" />
                   <h4 className="font-bold text-sm uppercase tracking-wide">Pro Tip</h4>
                </div>
                <p className="text-xs text-primary-foreground/80 leading-relaxed font-medium">
                   Jobs with detailed descriptions receive 30% more qualified applicants. Review your active listings today.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, icon: Icon, color, trend }: any) {
  const colors: any = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  }
  
  return (
    <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-1 rounded-lg border border-border">
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-3xl font-bold text-foreground mb-1">{value}</h4>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function JobRow({ title, location, type, date, status }: any) {
  const isActive = status === 'active';
  return (
    <div className="flex items-center justify-between p-6 hover:bg-secondary/50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center p-2 shadow-sm group-hover:border-primary/30 transition-all text-muted-foreground">
           <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{title}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-1">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{type}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
            isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border"
        }`}>
          {isActive ? "Active" : "Closed"}
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">Posted {date}</span>
      </div>
    </div>
  )
}

function EmptyState({ title, desc, actionLink, actionText }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center border border-border">
        <Briefcase className="w-7 h-7 text-muted-foreground" />
      </div>
      <div>
        <p className="text-foreground font-bold">{title}</p>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">{desc}</p>
      </div>
      <Link href={actionLink}>
        <Button className="bg-background text-primary border border-primary hover:bg-primary/10 mt-2 font-bold text-xs uppercase tracking-wider rounded-xl px-6 h-10 shadow-sm transition-all">
          {actionText}
        </Button>
      </Link>
    </div>
  )
}