import * as React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { 
  Briefcase, Clock, ArrowRight, 
  TrendingUp, FileX, Building2, UserCircle, MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getCandidateDashboardData } from "@/app/actions/candidate-dashboard-actions"

export default async function CandidateDashboard() {
  const data = await getCandidateDashboardData()

  if (!data || !data.candidate) {
    redirect("/login")
  }

  const { candidate, stats, recentApplications } = data

  // Dynamic Profile Score Calculation
  let profileScore = 20
  if (candidate.full_name) profileScore += 20
  if (candidate.resume_url) profileScore += 30
  if (candidate.avatar_url) profileScore += 10
  if (candidate.phone) profileScore += 10
  if (candidate.address) profileScore += 10

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* --- WELCOME HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
            Welcome back, <span className="text-[#1C3FA4]">{candidate.full_name?.split(' ')[0] || "Candidate"}</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm max-w-lg">
            You have <span className="font-bold text-slate-900">{stats.activeApplications} active applications</span>. 
            {profileScore < 100 ? " Complete your profile to increase visibility." : " Your profile is fully optimized!"}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/dashboard/candidate/jobs">
             <Button className="h-11 px-6 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/10 transition-all active:scale-95">
               Find New Jobs
             </Button>
           </Link>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Applications" 
          value={stats.totalApplications.toString()} 
          icon={Briefcase} 
          color="blue" 
          trend="Lifetime"
        />
        <StatCard 
          label="Interviews Scheduled" 
          value={stats.interviews.toString()} 
          icon={Clock} 
          color="emerald" 
          trend="Upcoming"
        />
        <StatCard 
          label="Profile Views" 
          value={stats.profileViews.toString()} 
          icon={TrendingUp} 
          color="purple" 
          trend="Last 30 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- LEFT: RECENT APPLICATIONS --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Applications</h3>
            {recentApplications.length > 0 && (
              <Link href="/dashboard/candidate/applications" className="text-xs font-bold text-[#1C3FA4] hover:text-[#152d75] uppercase tracking-wide flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden min-h-[200px]">
            {recentApplications.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {recentApplications.map((app: any) => (
                  <ApplicationRow 
                    key={app.id}
                    role={app.job?.title || "Unknown Role"}
                    department={app.job?.department || "General"}
                    companyLogo={app.job?.company_logo_url}
                    location={app.job?.location}
                    date={new Date(app.created_at).toLocaleDateString()}
                    status={app.status}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                  <FileX className="w-7 h-7 text-slate-300" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold">No applications yet</p>
                  <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">You haven't applied to any jobs yet. Start your search today.</p>
                </div>
                <Link href="/dashboard/candidate/jobs">
                  {/* FIXED: White background button */}
                  <Button className="bg-white text-[#1C3FA4] border border-[#1C3FA4] hover:bg-blue-50 mt-2 font-bold text-xs uppercase tracking-wider rounded-xl px-6 h-10 shadow-sm transition-all">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT: PROFILE STATUS (Removed Quick Search) --- */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Profile Completion Card */}
          <div className="bg-[#1C3FA4] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
             
             <div className="relative z-10 space-y-6">
               <div className="flex justify-between items-end">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <UserCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">Profile Strength</h3>
                 </div>
                 <span className="text-3xl font-bold">{profileScore}%</span>
               </div>
               
               <div className="space-y-3">
                 <Progress value={profileScore} className="h-2 bg-black/20" indicatorClassName="bg-white" />
                 <p className="text-xs text-blue-100 font-medium leading-relaxed">
                   {profileScore === 100 
                     ? "Great job! Your profile is fully optimized." 
                     : "Add your resume and details to reach 100% completion."}
                 </p>
               </div>

               <Link href="/dashboard/candidate/profile" className="block">
                 <Button className="w-full bg-white text-[#1C3FA4] hover:bg-blue-50 h-10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm">
                   Update Profile
                 </Button>
               </Link>
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
    blue: "bg-blue-50 text-[#1C3FA4]",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600"
  }
  
  return (
    <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-3xl font-bold text-slate-900 mb-1">{value}</h4>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  )
}

function ApplicationRow({ role, department, companyLogo, location, date, status }: any) {
  
  const statusColors: any = {
    applied: "bg-blue-50 text-blue-700 border-blue-100",
    screening: "bg-purple-50 text-purple-700 border-purple-100",
    interview: "bg-orange-50 text-orange-700 border-orange-100",
    offer: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rejected: "bg-slate-50 text-slate-500 border-slate-200"
  }

  return (
    <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm group-hover:border-[#1C3FA4]/30 transition-all">
           {companyLogo ? (
             <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
           ) : (
             <Building2 className="w-6 h-6 text-slate-300" />
           )}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#1C3FA4] transition-colors">{role}</h4>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
            <span>{department}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusColors[status] || statusColors.applied}`}>
          {status}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">{date}</span>
      </div>
    </div>
  )
}