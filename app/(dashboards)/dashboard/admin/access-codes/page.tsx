"use client"

import * as React from "react"
import Link from "next/link"
import { 
  KeyRound, Search, Copy, CheckCircle2, Clock, 
  XCircle, ArrowUpRight, Loader2, Shield, MoreHorizontal,
  CalendarPlus, Trash2, Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getReferralCodesAction } from "@/app/actions/get-codes"
import { extendCodeExpiryAction, revokeCodeAction } from "@/app/actions/code-actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface AccessCode {
  id: string
  code: string
  candidate_email: string
  created_at: string
  expires_at: string
  is_used: boolean
  created_by: string
}

export default function AccessCodesPage() {
  const [codes, setCodes] = React.useState<AccessCode[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState("all") 
  
  // Extension State
  const [isExtendOpen, setIsExtendOpen] = React.useState(false)
  const [selectedCode, setSelectedCode] = React.useState<string | null>(null)
  const [daysToAdd, setDaysToAdd] = React.useState(7)
  const [extending, setExtending] = React.useState(false)

  const fetchCodes = async () => {
    setLoading(true)
    const data = await getReferralCodesAction()
    setCodes(data || [])
    setLoading(false)
  }

  React.useEffect(() => { fetchCodes() }, [])

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Token copied to clipboard")
  }

  // Open Dialog
  const openExtendDialog = (id: string) => {
    setSelectedCode(id)
    setDaysToAdd(7) // default
    setIsExtendOpen(true)
  }

  // Submit Extension
  const handleExtendSubmit = async () => {
    if (!selectedCode) return
    setExtending(true)
    
    const res = await extendCodeExpiryAction(selectedCode, daysToAdd)
    
    if (res.success) {
      toast.success(`Extended validity by ${daysToAdd} days`)
      setIsExtendOpen(false)
      fetchCodes() 
    } else {
      toast.error("Failed to extend")
    }
    setExtending(false)
  }

  const handleRevoke = async (id: string) => {
    const toastId = toast.loading("Revoking token...")
    const res = await revokeCodeAction(id)
    if (res.success) {
      toast.success("Token deleted", { id: toastId })
      setCodes(prev => prev.filter(c => c.id !== id))
    } else {
      toast.error("Failed to delete", { id: toastId })
    }
  }

  const filteredCodes = codes.filter(item => {
    const query = search.toLowerCase()
    const matchesSearch = (item.candidate_email?.toLowerCase() || "").includes(query) || 
                          (item.code?.toLowerCase() || "").includes(query)
    const isExpired = new Date(item.expires_at) < new Date()
    
    if (filter === "active") return matchesSearch && !item.is_used && !isExpired
    if (filter === "used") return matchesSearch && item.is_used
    if (filter === "expired") return matchesSearch && !item.is_used && isExpired
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* --- EXTEND DIALOG --- */}
      <Dialog open={isExtendOpen} onOpenChange={setIsExtendOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white border border-slate-100 shadow-2xl p-0 gap-0 rounded-2xl overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-[#1C3FA4] mb-3">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">Extend Token Validity</DialogTitle>
            <DialogDescription className="text-slate-500 mt-1">
              Add extra days to this access token.
            </DialogDescription>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Days to Add</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  min={1} 
                  max={365}
                  value={daysToAdd}
                  onChange={(e) => setDaysToAdd(parseInt(e.target.value) || 0)}
                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-[#1C3FA4] focus:ring-0 text-lg font-semibold text-slate-900"
                />
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {daysToAdd > 0 ? `Token will remain active for ${daysToAdd} more days.` : "Enter a valid number of days."}
              </p>
            </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
            <Button variant="ghost" onClick={() => setIsExtendOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
            <Button 
              onClick={handleExtendSubmit} 
              disabled={extending || daysToAdd < 1}
              className="flex-1 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl"
            >
              {extending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Extension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1C3FA4] border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Secure Registry
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Access <span className="text-[#1C3FA4]">Codes</span></h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-lg">
            Manage active candidate tokens and monitor usage logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/dashboard/admin/generate-code">
             <Button className="h-10 px-5 bg-[#1C3FA4] hover:bg-[#152d75] text-white rounded-xl font-semibold text-xs shadow-lg shadow-blue-900/10 transition-all active:scale-95">
               Generate New
             </Button>
           </Link>
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
          <Input 
            placeholder="Search by email or token..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-[#1C3FA4] focus:ring-0 transition-all shadow-sm" 
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
           {['all', 'active', 'used', 'expired'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                 filter === f 
                   ? "bg-white text-[#1C3FA4] shadow-sm border border-slate-100" 
                   : "text-slate-400 hover:text-slate-600"
               }`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm min-h-[400px]">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#1C3FA4]" />
            <p className="text-sm font-medium">Syncing database...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            <div className="hidden md:grid grid-cols-12 px-8 py-4 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <div className="col-span-4">Candidate & Token</div>
              <div className="col-span-2 text-center">Created By</div>
              <div className="col-span-2 text-center">Created At</div>
              <div className="col-span-2 text-center">Expiration</div>
              <div className="col-span-2 text-right">Status & Action</div>
            </div>

            {filteredCodes.length > 0 ? filteredCodes.map((item) => {
              const isExpired = new Date(item.expires_at) < new Date()
              let statusColor = "bg-emerald-50 text-emerald-700 border-emerald-100"
              let statusText = "Active"
              let StatusIcon = CheckCircle2

              if (item.is_used) {
                statusColor = "bg-slate-100 text-slate-500 border-slate-200"
                statusText = "Redeemed"
                StatusIcon = ArrowUpRight
              } else if (isExpired) {
                statusColor = "bg-rose-50 text-rose-600 border-rose-100"
                statusText = "Expired"
                StatusIcon = XCircle
              }

              return (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 items-center px-8 py-5 hover:bg-slate-50/30 transition-colors group">
                  
                  {/* Token */}
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-center text-[#1C3FA4] shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => handleCopy(item.code)}>
                          <span className="text-sm font-bold text-slate-900 font-mono tracking-tight group-hover/copy:text-[#1C3FA4] transition-colors">{item.code}</span>
                          <Copy className="w-3 h-3 text-slate-300 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium truncate">{item.candidate_email}</span>
                    </div>
                  </div>

                  {/* Admin */}
                  <div className="col-span-2 flex justify-center mt-2 md:mt-0">
                    <div className="flex items-center gap-2" title={`Admin ID: ${item.created_by}`}>
                        <Avatar className="w-6 h-6 border border-slate-200">
                           <AvatarFallback className="text-[9px] bg-slate-100 text-slate-600 font-bold">AD</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-slate-600 truncate max-w-[100px]">Admin</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="col-span-2 flex justify-center mt-2 md:mt-0">
                    <span className="text-xs font-medium text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="col-span-2 flex justify-center mt-1 md:mt-0">
                    <span className={`text-xs font-semibold ${isExpired && !item.is_used ? 'text-rose-500' : 'text-slate-600'}`}>
                        {new Date(item.expires_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status & Actions */}
                  <div className="col-span-2 flex justify-end items-center gap-3 mt-2 md:mt-0">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusColor}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">{statusText}</span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:text-[#1C3FA4] hover:shadow-sm">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      {/* FIX: ADDED BG-WHITE HERE */}
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl p-1 bg-white">
                        <DropdownMenuItem 
                          onClick={() => openExtendDialog(item.id)}
                          className="rounded-lg py-2.5 px-3 text-slate-600 font-medium cursor-pointer hover:text-[#1C3FA4] hover:bg-blue-50 gap-2"
                        >
                          <CalendarPlus className="w-4 h-4" /> Manage Expiry
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuItem 
                          onClick={() => handleRevoke(item.id)}
                          className="rounded-lg py-2.5 px-3 text-rose-600 font-medium cursor-pointer hover:bg-rose-50 gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Revoke Token
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            }) : (
              <div className="py-32 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <KeyRound className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest">No matching tokens found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}