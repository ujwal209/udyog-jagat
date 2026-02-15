"use client"

import * as React from "react"
import { 
  Users, Search, Filter, MoreHorizontal, 
  Mail, Shield, ChevronRight, Loader2,
  RefreshCcw, ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAllUsersAction } from "@/app/actions/get-users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function MyUsersPage() {
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchUsers = async () => {
    setLoading(true)
    const result = await getAllUsersAction()
    if (result.data) setUsers(result.data)
    setLoading(false)
  }

  React.useEffect(() => { fetchUsers() }, [])

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-8 space-y-10 max-w-7xl mx-auto">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1C3FA4] border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Registry Access
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            User <span className="text-[#1C3FA4]">Inventory</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-lg">
            Monitor and manage provisioned identities across the network.
          </p>
        </div>
        
        <Button 
          onClick={fetchUsers} 
          variant="outline" 
          className="h-10 px-5 rounded-lg border-slate-200 bg-white text-slate-600 font-semibold text-xs gap-2 hover:bg-slate-50 hover:text-[#1C3FA4] hover:border-[#1C3FA4] transition-all shadow-sm"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading && 'animate-spin'}`} /> Sync Database
        </Button>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
          <Input 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-[#1C3FA4] focus:ring-0 transition-all shadow-sm" 
          />
        </div>

        <Button 
          variant="outline" 
          className="h-12 px-5 rounded-xl border-slate-200 bg-white text-slate-500 hover:text-[#1C3FA4] hover:bg-slate-50 hover:border-[#1C3FA4] transition-all shadow-sm flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>

      {/* --- USER LIST --- */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#1C3FA4]" />
            <p className="text-sm font-medium">Syncing database...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 px-8 py-4 bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="col-span-5">Identity Details</div>
              <div className="col-span-3 text-center">Permission Tier</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <div key={user.id} className="grid grid-cols-1 md:grid-cols-12 items-center px-8 py-5 hover:bg-slate-50/50 transition-colors group cursor-pointer border-l-4 border-transparent hover:border-[#1C3FA4]">
                
                {/* Identity Column */}
                <div className="col-span-5 flex items-center gap-4">
                  <Avatar className="w-10 h-10 border-2 border-slate-100 shadow-sm bg-white shrink-0">
                    {/* NEW: Render actual image */}
                    <AvatarImage src={user.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-blue-50 text-[#1C3FA4] font-bold text-xs uppercase">
                      {user.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-900 truncate">{user.full_name || "New User"}</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                      <Mail className="w-3 h-3 opacity-60" /> {user.email}
                    </div>
                  </div>
                </div>

                {/* Tier Column */}
                <div className="col-span-3 flex justify-center mt-4 md:mt-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200 group-hover:bg-white group-hover:text-[#1C3FA4] group-hover:border-blue-100 transition-all">
                    <Shield className="w-3 h-3" /> {user.type || user.role || 'Member'}
                  </span>
                </div>

                {/* Status Column */}
                <div className="col-span-2 flex justify-center mt-4 md:mt-0">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Verified</span>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="col-span-2 flex justify-end mt-4 md:mt-0">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-[#1C3FA4] hover:bg-white border border-transparent hover:border-slate-200">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-[#1C3FA4] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest">No matching identities found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}