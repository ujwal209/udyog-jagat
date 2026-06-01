"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Briefcase, Users, Clock, Plus, 
  ArrowUpRight, FileText, MapPin, Loader2, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPosterDashboardData } from "@/app/actions/poster-dashboard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OrgBanner } from "@/components/org-banner"

export default function PosterDashboardPage() {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function init() {
      const res = await getPosterDashboardData()
      if (res.success) setData(res.data)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) {
    return (
      <div className="h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Loading Dashboard...</p>
      </div>
    )
  }

  const { poster, stats, recentJobs } = data || {}

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 bg-background text-foreground animate-in fade-in duration-300">
      
      {/* --- SKIPPABLE ORG BANNER --- */}
      <OrgBanner user={poster} role="poster" />

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, {poster?.full_name?.split(' ')[0] || "User"}. Here's what's happening today.
          </p>
        </div>

        <Link href="/dashboard/poster/post-job">
          <Button className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium text-sm transition-all gap-2">
            <Plus className="w-4 h-4" /> Post New Job
          </Button>
        </Link>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Active Jobs" 
          value={stats?.activeJobs} 
          icon={Briefcase} 
        />
        <StatCard 
          label="Total Applicants" 
          value={stats?.totalApplicants} 
          icon={Users} 
        />
        <StatCard 
          label="Pending Review" 
          value={stats?.pendingReview} 
          icon={Clock} 
        />
        <StatCard 
          label="Total Posted" 
          value={stats?.totalJobs} 
          icon={FileText} 
        />
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT JOBS TABLE */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg shadow-sm flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Postings</h3>
            <Link href="/dashboard/poster/my-jobs">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View All
              </Button>
            </Link>
          </div>

          <div className="p-0">
            {recentJobs && recentJobs.length > 0 ? (
              <div className="divide-y divide-border">
                {recentJobs.map((job: any) => (
                  <Link href={`/dashboard/poster/edit-job/${job.id}`} key={job.id} className="group flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-secondary border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{job.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${job.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                          <p className="text-xs text-muted-foreground capitalize">{job.status}</p>
                          <span className="text-muted-foreground text-xs">•</span>
                          <p className="text-xs text-muted-foreground">{new Date(job.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center mb-3">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium text-sm">No jobs posted yet.</p>
                <p className="text-muted-foreground text-xs mt-1">Create your first job listing to start receiving applications.</p>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE / ORG CARD */}
        <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Organization Details</h3>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-12 h-12 rounded border border-border bg-background">
                <AvatarImage src={poster?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-secondary text-muted-foreground text-sm font-medium rounded">
                  {poster?.full_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-foreground text-sm">{poster?.full_name}</h3>
                <p className="text-muted-foreground text-xs">{poster?.email}</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">Department (Vibhaaga)</p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {poster?.vibhaaga || "Not assigned"}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">Assigned Milan</p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  {poster?.milan || "Not assigned"}
                </div>
              </div>
            </div>

            <Link href="/dashboard/poster/profile" className="mt-6 block">
              <Button variant="outline" className="w-full text-sm font-medium">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function StatCard({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground">
          {value || "0"}
        </h3>
      </div>
    </div>
  )
}