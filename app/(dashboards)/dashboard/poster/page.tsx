"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Briefcase, Users, Clock, Plus, 
  ArrowUpRight, FileText, LayoutGrid, 
  MapPin, Loader2, TrendingUp, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPosterDashboardData } from "@/app/actions/poster-dashboard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
        <Loader2 className="w-10 h-10 text-[#1C3FA4] animate-spin mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    )
  }

  const { poster, stats, recentJobs } = data || {}

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 font-sans text-slate-900 animate-in fade-in duration-500">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1C3FA4] border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
            <LayoutGrid className="w-3.5 h-3.5" /> {poster?.vibhaaga || "Region"} • {poster?.khanda || "Zone"}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Hello, <span className="text-[#1C3FA4]">{poster?.full_name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Here is what's happening with your listings in <span className="font-semibold text-slate-700">{poster?.milan || "your unit"}</span> today.
          </p>
        </div>

        <Link href="/dashboard/poster/post-job">
          <Button className="h-12 px-6 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/10 transition-all active:scale-95 gap-2">
            <Plus className="w-4 h-4" /> Post New Job
          </Button>
        </Link>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          label="Active Jobs" 
          value={stats?.activeJobs} 
          icon={Briefcase} 
          trend="Live Now"
          color="blue"
        />
        <StatCard 
          label="Total Applicants" 
          value={stats?.totalApplicants} 
          icon={Users} 
          trend="All Time"
          color="emerald"
        />
        <StatCard 
          label="Pending Review" 
          value={stats?.pendingReview} 
          icon={Clock} 
          trend="Needs Action"
          color="amber"
        />
        <StatCard 
          label="Total Posted" 
          value={stats?.totalJobs} 
          icon={FileText} 
          trend="Lifetime"
          color="slate"
        />
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT JOBS TABLE */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Recent Postings</h3>
            <Link href="/dashboard/poster/my-jobs">
              <Button variant="ghost" className="text-[#1C3FA4] hover:bg-blue-50 text-xs font-bold uppercase tracking-wide">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {recentJobs && recentJobs.length > 0 ? (
              recentJobs.map((job: any) => (
                <div key={job.id} className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#1C3FA4] shadow-sm group-hover:scale-110 transition-transform">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${job.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <p className="text-xs text-slate-500 font-medium capitalize">{job.status}</p>
                        <span className="text-slate-300">•</span>
                        <p className="text-xs text-slate-400 font-medium">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-[#1C3FA4]" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Briefcase className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium text-sm">No jobs posted yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE / ORG CARD */}
        <div className="bg-[#1C3FA4] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20 flex flex-col justify-between">
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16 border-4 border-white/20 shadow-lg">
                <AvatarImage src={poster?.avatar_url} />
                <AvatarFallback className="bg-white/10 text-white font-bold">
                  {poster?.full_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Job Poster</p>
                <h3 className="text-lg font-bold">{poster?.full_name}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">Organization Unit</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="font-semibold">{poster?.valaya || "Valaya Not Set"}</span>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">Assigned Milan</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span className="font-semibold">{poster?.milan || "Milan Not Set"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
            <Link href="/dashboard/poster/profile">
              <Button className="w-full bg-white text-[#1C3FA4] hover:bg-blue-50 border-none font-bold rounded-xl h-12 transition-all">
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

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    slate: "text-slate-600 bg-slate-100 border-slate-200"
  }

  const activeColor = colors[color] || colors.slate

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${activeColor} transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
          <TrendingUp className="w-3 h-3" /> {trend}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-900 mb-1 group-hover:scale-105 transition-transform origin-left">
          {value}
        </h3>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  )
}