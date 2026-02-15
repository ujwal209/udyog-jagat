"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Users, Activity, TrendingUp, Filter, UserPlus, Loader2, Settings,
  Calendar, Mail, Smartphone, Search, X, Briefcase, ShieldCheck, BadgeCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSystemOverviewAction } from "@/app/actions/get-system-overview"
import { toast } from "sonner"

export default function AdminOverview() {
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState({ total: 0, active: 0, referrers: 0, candidates: 0, admins: 0 })
  const [allUsers, setAllUsers] = React.useState<any[]>([])
  const [activeTab, setActiveTab] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  const fetchData = async () => {
    setLoading(true)
    const result = await getSystemOverviewAction()
    if (result.success && result.data) {
      setAllUsers(result.data)
      setStats(result.stats)
    } else {
      toast.error("Failed to sync database registry.")
    }
    setLoading(false)
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  // Filter Logic
  const filteredUsers = allUsers.filter(u => {
    const matchesTab = activeTab === "all" || u.type.toLowerCase() === activeTab.toLowerCase()
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery))
    
    return matchesTab && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* --- SECTION 1: LIVE STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        
        {/* Total Users */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:border-[#1C3FA4]/20 transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-[#1C3FA4]">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Total</span>
           </div>
           <div>
              <h3 className="text-3xl font-bold text-slate-900">{stats.total}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Registered Users</p>
           </div>
        </div>

        {/* Candidates */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-emerald-100 transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Growth</span>
           </div>
           <div>
              <h3 className="text-3xl font-bold text-slate-900">{stats.candidates}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Candidates</p>
           </div>
        </div>

        {/* Referrers */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-purple-100 transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Partners</span>
           </div>
           <div>
              <h3 className="text-3xl font-bold text-slate-900">{stats.referrers}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Job Posters</p>
           </div>
        </div>

        {/* Admins */}
        <div className="bg-[#1C3FA4] p-6 rounded-[2rem] shadow-xl shadow-blue-900/10 relative overflow-hidden text-white group">
           <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-white/90 bg-white/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">System</span>
           </div>
           <div className="relative z-10">
              <h3 className="text-3xl font-bold">{stats.admins}</h3>
              <p className="text-sm font-medium text-blue-100 mt-1">Administrators</p>
           </div>
           <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>
      </div>

      {/* --- SECTION 2: DATA TABLE --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 min-h-[600px] flex flex-col">
        
        {/* Toolbar */}
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
           
           <div className="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1">
             {/* Tab Switcher */}
             <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               {['all', 'candidate', 'referrer', 'admin'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all min-w-[90px] ${
                     activeTab === tab 
                       ? 'bg-white text-[#1C3FA4] shadow-sm' 
                       : 'text-slate-400 hover:text-slate-600'
                   }`}
                 >
                   {tab === 'referrer' ? 'Job Posters' : tab}
                 </button>
               ))}
             </div>

             {/* Search Bar */}
             <div className="relative w-full max-w-md group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
               <Input 
                 placeholder="Search by name, email, or phone..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="h-12 pl-11 pr-10 rounded-2xl border-slate-200 bg-white text-sm font-medium placeholder:text-slate-400 focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all"
               />
               {searchQuery && (
                 <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors">
                   <X className="w-3.5 h-3.5 text-slate-400" />
                 </button>
               )}
             </div>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               onClick={fetchData}
               className="h-12 rounded-2xl bg-white border-slate-200 text-slate-600 font-bold text-xs gap-2 hover:bg-slate-50 hover:border-[#1C3FA4]"
             >
                <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
             </Button>
             <Link href="/dashboard/admin/create-user">
               <Button className="h-12 rounded-2xl bg-[#1C3FA4] hover:bg-[#152d75] text-white text-xs font-bold px-8 shadow-lg shadow-blue-900/10 transition-all active:scale-95">
                 <UserPlus className="w-4 h-4 mr-2" /> Add User
               </Button>
             </Link>
           </div>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-x-auto p-4 md:p-8 pt-0">
          <div className="min-w-[1000px]">
             
             {/* Header Row */}
             <div className="grid grid-cols-12 gap-4 px-6 py-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] pl-10 border-b border-slate-50">
                <div className="col-span-4">User Identity</div>
                <div className="col-span-3">Contact Details</div>
                <div className="col-span-2">Joined Date</div>
                <div className="col-span-2">Role & Status</div>
                <div className="col-span-1 text-right">Actions</div>
             </div>

             {/* Data Rows */}
             {loading ? (
               <div className="flex flex-col items-center justify-center py-32 space-y-4">
                 <Loader2 className="w-10 h-10 animate-spin text-[#1C3FA4]" />
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing Data...</p>
               </div>
             ) : filteredUsers.length > 0 ? (
               <div className="space-y-2 mt-2">
                 {filteredUsers.map((user) => (
                   <div 
                     key={user.id} 
                     className="grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-[1.5rem] transition-all duration-300 bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100 group"
                   >
                      {/* Profile */}
                      <div className="col-span-4 flex items-center gap-4">
                         <Avatar className="w-11 h-11 border-2 border-slate-100 bg-white shadow-sm transition-transform group-hover:scale-105">
                           <AvatarImage src={user.avatar_url} className="object-cover" />
                           <AvatarFallback className="bg-blue-50 text-[#1C3FA4] font-bold text-sm">
                             {user.full_name?.charAt(0) || "U"}
                           </AvatarFallback>
                         </Avatar>
                         <div className="min-w-0">
                           <p className="text-sm font-bold text-slate-900 truncate">{user.full_name || "Unidentified User"}</p>
                           <p className="text-[10px] text-slate-400 font-mono truncate">{user.id.slice(0, 8)}...</p>
                         </div>
                      </div>

                      {/* Contact Info (FIXED) */}
                      <div className="col-span-3 text-xs font-medium flex flex-col gap-1.5 text-slate-500">
                         <span className="flex items-center gap-2 truncate group-hover:text-slate-900 transition-colors">
                           <Mail className="w-3.5 h-3.5 text-[#1C3FA4] opacity-50" /> 
                           {user.email || "-"}
                         </span>
                         <span className="flex items-center gap-2 truncate group-hover:text-slate-900 transition-colors">
                           <Smartphone className="w-3.5 h-3.5 text-[#1C3FA4] opacity-50" /> 
                           {/* Correctly displays phone if available, otherwise "N/A" */}
                           {user.phone ? user.phone : "N/A"}
                         </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
                         <Calendar className="w-3.5 h-3.5 text-slate-400" />
                         {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>

                      {/* Role Badge */}
                      <div className="col-span-2">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${
                           user.type === 'admin' 
                           ? 'bg-blue-50 text-[#1C3FA4] border-blue-100' 
                           : user.type === 'referrer'
                           ? 'bg-purple-50 text-purple-600 border-purple-100'
                           : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                         }`}>
                            {user.type === 'admin' && <ShieldCheck className="w-3 h-3" />}
                            {user.type === 'referrer' && <Briefcase className="w-3 h-3" />}
                            {user.type === 'candidate' && <BadgeCheck className="w-3 h-3" />}
                            {user.type === 'referrer' ? 'Job Poster' : user.type}
                         </span>
                      </div>

                      {/* Action */}
                      <div className="col-span-1 flex justify-end">
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-[#1C3FA4] hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all">
                           <Settings className="w-4 h-4" />
                         </Button>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                 <Users className="w-16 h-16 mb-4 opacity-10" />
                 <h4 className="text-lg font-bold text-slate-900">No matches found</h4>
                 <p className="text-sm font-medium">Try adjusting your filters or search keywords.</p>
                 <Button variant="link" onClick={() => {setSearchQuery(""); setActiveTab("all")}} className="text-[#1C3FA4] font-bold mt-2">Clear all filters</Button>
               </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredUsers.length} of {allUsers.length} records
           </p>
           <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-[#1C3FA4] hover:bg-blue-50 font-bold text-xs px-6 h-10 rounded-xl">Previous</Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-[#1C3FA4] hover:bg-blue-50 font-bold text-xs px-6 h-10 rounded-xl">Next</Button>
           </div>
        </div>

      </div>
    </div>
  )
}