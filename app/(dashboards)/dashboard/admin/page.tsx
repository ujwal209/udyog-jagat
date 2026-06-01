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
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-1 lg:mb-2">Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1C3FA4] to-[#3b82f6]">Command</span></h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Real-time oversight of your entire network ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
      
        </div>
      </div>

      {/* --- SECTION 1: LIVE STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Total Users */}
        <div className="bg-white p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-blue-50 rounded-full blur-2xl lg:blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <div className="flex justify-between items-start mb-4 lg:mb-6 relative z-10">
              <div className="p-2.5 lg:p-3.5 bg-white rounded-xl lg:rounded-2xl text-[#1C3FA4] shadow-sm border border-slate-100">
                <Users className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-lg lg:rounded-xl uppercase tracking-widest border border-slate-100">Total</span>
           </div>
           <div className="relative z-10">
              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{stats.total}</h3>
              <p className="text-xs lg:text-sm font-semibold text-slate-500 mt-1">Registered Users</p>
           </div>
        </div>

        {/* Candidates */}
        <div className="bg-white p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-emerald-50 rounded-full blur-2xl lg:blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <div className="flex justify-between items-start mb-4 lg:mb-6 relative z-10">
              <div className="p-2.5 lg:p-3.5 bg-white rounded-xl lg:rounded-2xl text-emerald-600 shadow-sm border border-slate-100">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="text-[9px] lg:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-lg lg:rounded-xl uppercase tracking-widest border border-emerald-100/50">Growth</span>
           </div>
           <div className="relative z-10">
              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{stats.candidates}</h3>
              <p className="text-xs lg:text-sm font-semibold text-slate-500 mt-1">Candidates</p>
           </div>
        </div>

        {/* Referrers */}
        <div className="bg-white p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-purple-50 rounded-full blur-2xl lg:blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <div className="flex justify-between items-start mb-4 lg:mb-6 relative z-10">
              <div className="p-2.5 lg:p-3.5 bg-white rounded-xl lg:rounded-2xl text-purple-600 shadow-sm border border-slate-100">
                <Briefcase className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="text-[9px] lg:text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-lg lg:rounded-xl uppercase tracking-widest border border-purple-100/50">Partners</span>
           </div>
           <div className="relative z-10">
              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{stats.referrers}</h3>
              <p className="text-xs lg:text-sm font-semibold text-slate-500 mt-1">Job Posters</p>
           </div>
        </div>

        {/* Admins */}
        <div className="bg-[#1C3FA4] p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] shadow-md hover:shadow-lg border border-[#1C3FA4] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden text-white group">
           <div className="absolute top-0 right-0 w-24 h-24 lg:w-40 lg:h-40 bg-blue-400/30 rounded-full blur-2xl lg:blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 lg:w-40 lg:h-40 bg-indigo-500/30 rounded-full blur-2xl lg:blur-3xl -ml-10 -mb-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <div className="flex justify-between items-start mb-4 lg:mb-6 relative z-10">
              <div className="p-2.5 lg:p-3.5 bg-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl text-white shadow-inner border border-white/10">
                <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="text-[9px] lg:text-[10px] font-bold text-blue-100 bg-white/10 backdrop-blur-sm px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-lg lg:rounded-xl uppercase tracking-widest border border-white/5">System</span>
           </div>
           <div className="relative z-10">
              <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">{stats.admins}</h3>
              <p className="text-xs lg:text-sm font-medium text-blue-200 mt-1">Administrators</p>
           </div>
        </div>
      </div>

      {/* --- SECTION 2: DATA TABLE --- */}
      <div className="bg-white rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col relative overflow-hidden mt-6 lg:mt-10">
        
        <div className="absolute top-0 left-0 right-0 h-32 lg:h-48 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none" />

        {/* Toolbar */}
        <div className="p-5 lg:p-8 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-4 lg:gap-6 relative z-10">
           
           <div className="flex flex-col md:flex-row items-start md:items-center gap-4 lg:gap-6 flex-1 w-full">
             {/* Tab Switcher */}
             <div className="flex flex-wrap items-center gap-1 bg-slate-50/80 backdrop-blur-md p-1.5 rounded-2xl lg:rounded-[1.25rem] border border-slate-200/60 shadow-sm w-full md:w-auto">
               {['all', 'candidate', 'referrer', 'admin'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-all flex-1 md:flex-none min-w-[70px] lg:min-w-[90px] ${
                     activeTab === tab 
                       ? 'bg-white text-[#1C3FA4] shadow-sm border border-slate-100' 
                       : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
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
                 className="h-11 lg:h-12 pl-10 pr-10 rounded-2xl lg:rounded-[1.25rem] border-slate-200 bg-white text-xs lg:text-sm font-semibold placeholder:text-slate-400 placeholder:font-medium focus:border-[#1C3FA4] focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
               />
               {searchQuery && (
                 <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                   <X className="w-3.5 h-3.5 text-slate-400" />
                 </button>
               )}
             </div>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-2 lg:gap-3 w-full xl:w-auto mt-2 xl:mt-0">
             <Button 
               variant="outline" 
               onClick={fetchData}
               className="h-11 lg:h-12 flex-1 xl:flex-none rounded-2xl lg:rounded-[1.25rem] bg-white border-slate-200 text-slate-600 font-bold text-xs gap-2 hover:bg-slate-50 hover:border-[#1C3FA4] hover:text-[#1C3FA4] shadow-sm transition-all"
             >
                <Activity className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
             </Button>
             <Link href="/dashboard/admin/create-user" className="flex-1 xl:flex-none">
               <Button className="w-full h-11 lg:h-12 rounded-2xl lg:rounded-[1.25rem] bg-[#1C3FA4] hover:bg-[#152d75] text-white text-xs font-bold px-6 lg:px-8 shadow-md shadow-blue-900/10 transition-all active:scale-95 border border-transparent">
                 <UserPlus className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-2" /> Add User
               </Button>
             </Link>
           </div>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-x-auto p-4 md:p-8 pt-0 relative z-10">
          <div className="min-w-[1000px]">
             
             {/* Header Row */}
             <div className="grid grid-cols-12 gap-4 px-8 py-5 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <div className="col-span-4 pl-4">User Identity</div>
                <div className="col-span-3">Contact Details</div>
                <div className="col-span-2">Joined Date</div>
                <div className="col-span-2">Role & Status</div>
                <div className="col-span-1 text-right pr-4">Actions</div>
             </div>

             {/* Data Rows */}
             {loading ? (
               <div className="flex flex-col items-center justify-center py-32 space-y-4">
                 <Loader2 className="w-10 h-10 animate-spin text-[#1C3FA4]" />
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing Data...</p>
               </div>
             ) : filteredUsers.length > 0 ? (
               <div className="space-y-2.5">
                 {filteredUsers.map((user) => (
                   <div 
                     key={user.id} 
                     className="grid grid-cols-12 gap-4 items-center px-8 py-5 rounded-[1.5rem] transition-all duration-300 bg-white hover:bg-slate-50/80 border border-slate-100 hover:border-slate-200 hover:shadow-md group cursor-pointer"
                   >
                      {/* Profile */}
                      <div className="col-span-4 flex items-center gap-5">
                         <Avatar className="w-12 h-12 border-2 border-white shadow-md bg-white transition-transform group-hover:scale-105 group-hover:shadow-lg rounded-xl">
                           <AvatarImage src={user.avatar_url} className="object-cover rounded-xl" />
                           <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-[#1C3FA4] font-black text-sm rounded-xl">
                             {user.full_name?.charAt(0) || "U"}
                           </AvatarFallback>
                         </Avatar>
                         <div className="min-w-0">
                           <p className="text-[15px] font-bold text-slate-900 truncate group-hover:text-[#1C3FA4] transition-colors">{user.full_name || "Unidentified User"}</p>
                           <p className="text-[11px] text-slate-400 font-bold font-mono tracking-wider truncate mt-0.5">{user.id.slice(0, 12)}...</p>
                         </div>
                      </div>

                      {/* Contact Info */}
                      <div className="col-span-3 text-xs font-semibold flex flex-col gap-2 text-slate-500">
                         <span className="flex items-center gap-2 truncate group-hover:text-slate-900 transition-colors">
                           <div className="p-1 bg-slate-100 rounded-md group-hover:bg-blue-100 transition-colors"><Mail className="w-3 h-3 text-slate-400 group-hover:text-[#1C3FA4]" /></div>
                           {user.email || "-"}
                         </span>
                         <span className="flex items-center gap-2 truncate group-hover:text-slate-900 transition-colors">
                           <div className="p-1 bg-slate-100 rounded-md group-hover:bg-blue-100 transition-colors"><Smartphone className="w-3 h-3 text-slate-400 group-hover:text-[#1C3FA4]" /></div>
                           {user.phone ? user.phone : "N/A"}
                         </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 flex items-center gap-2.5 text-xs font-bold text-slate-600">
                         <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg group-hover:bg-white transition-colors">
                           <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1C3FA4]" />
                         </div>
                         {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>

                      {/* Role Badge */}
                      <div className="col-span-2">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all group-hover:shadow-md ${
                           user.type === 'admin' 
                           ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-[#1C3FA4] border-blue-100' 
                           : user.type === 'referrer'
                           ? 'bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-700 border-purple-100'
                           : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-100'
                         }`}>
                            {user.type === 'admin' && <ShieldCheck className="w-3 h-3" />}
                            {user.type === 'referrer' && <Briefcase className="w-3 h-3" />}
                            {user.type === 'candidate' && <BadgeCheck className="w-3 h-3" />}
                            {user.type === 'referrer' ? 'Job Poster' : user.type}
                         </span>
                      </div>

                      {/* Action */}
                      <div className="col-span-1 flex justify-end pr-2">
                         <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-[#1C3FA4] hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50">
                           <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                         </Button>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                 <Users className="w-16 h-16 mb-4 opacity-20" />
                 <h4 className="text-xl font-black text-slate-900">No matches found</h4>
                 <p className="text-sm font-semibold mt-1">Try adjusting your filters or search keywords.</p>
                 <Button variant="outline" onClick={() => {setSearchQuery(""); setActiveTab("all")}} className="text-[#1C3FA4] font-bold mt-6 h-10 px-6 rounded-xl border-slate-200 hover:border-[#1C3FA4] hover:bg-blue-50">Clear all filters</Button>
               </div>
             )}
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 relative z-10">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-700">{filteredUsers.length}</span> of <span className="text-slate-700">{allUsers.length}</span> records
           </p>
           <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-500 hover:text-[#1C3FA4] hover:border-[#1C3FA4] hover:bg-blue-50 font-bold text-xs px-6 h-10 rounded-xl shadow-sm transition-all">Previous</Button>
              <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-500 hover:text-[#1C3FA4] hover:border-[#1C3FA4] hover:bg-blue-50 font-bold text-xs px-6 h-10 rounded-xl shadow-sm transition-all">Next</Button>
           </div>
        </div>

      </div>
    </div>
  )
}