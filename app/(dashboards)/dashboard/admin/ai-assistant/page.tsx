"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Send, Plus, MessageSquare, MoreHorizontal, Trash2, Edit2, 
  Check, X, Menu, Paperclip, ChevronDown, Sparkles, 
  Search, LayoutGrid, PanelLeft, Share2, Settings, History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  getChatSessions, getChatMessages, createChatSession, 
  sendMessageAction, renameSessionAction, deleteSessionAction 
} from "@/app/actions/chat-actions"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// --- ICONS & ASSETS ---
function AIIcon({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  // Mobile-aware sizing
  const containerClasses = {
    sm: "w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl",
    md: "w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl",
    lg: "w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem]"
  }
  const iconClasses = {
    sm: "w-3 h-3 md:w-4 md:h-4",
    md: "w-4 h-4 md:w-5 md:h-5",
    lg: "w-6 h-6 md:w-8 md:h-8"
  }
  
  return (
    <div className={`${containerClasses[size]} shrink-0 bg-[#1C3FA4] flex items-center justify-center shadow-lg shadow-blue-900/20 relative overflow-hidden transition-all duration-300`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-30" />
      <Sparkles className={`${iconClasses[size]} text-white fill-white/20 relative z-10`} />
    </div>
  )
}

// --- CHAT INPUT COMPONENT ---
function ChatInput({ onSend, isLoading, isHero }: { onSend: (msg: string) => void, isLoading: boolean, isHero: boolean }) {
  const [localInput, setLocalInput] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!localInput.trim() || isLoading) return
    onSend(localInput)
    setLocalInput("")
  }

  return (
    <div className={`w-full transition-all duration-700 ease-out px-4 md:px-0 ${isHero ? "max-w-2xl scale-100" : "max-w-3xl mx-auto scale-100"}`}>
      <div className={`relative bg-white border border-slate-200 shadow-2xl shadow-blue-900/5 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group focus-within:border-[#1C3FA4]/50 focus-within:ring-4 focus-within:ring-blue-50 transition-all ${isHero ? "p-1.5 md:p-2 pl-4 md:pl-6 pr-2" : "p-1.5 md:p-2 pl-4 pr-1.5"}`}>
        
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input 
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder={isHero ? "Ask anything..." : "Message AI..."}
            // text-base prevents iOS zoom on focus
            className="border-none shadow-none text-base font-medium text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 h-10 md:h-12 bg-transparent flex-1 p-0"
            disabled={isLoading}
            autoFocus
          />
          
          <div className="flex items-center gap-1 md:gap-2">
             <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 md:h-10 md:w-10 rounded-xl text-slate-400 hover:text-[#1C3FA4] hover:bg-blue-50 transition-colors hidden sm:flex"
             >
                <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
             </Button>
             
             <Button 
                type="submit" 
                disabled={!localInput.trim() || isLoading}
                className={`h-8 w-8 md:h-10 md:w-10 rounded-xl transition-all duration-300 flex items-center justify-center p-0 ${
                  localInput.trim() 
                    ? "bg-[#1C3FA4] hover:bg-[#152d75] text-white shadow-lg shadow-blue-900/20" 
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                )}
              </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// --- MAIN PAGE ---
export default function EnterpriseAIPage() {
  const [sessions, setSessions] = React.useState<any[]>([])
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [isSidebarOpen, setSidebarOpen] = React.useState(true)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false)
  
  // Editing State
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Initialization
  React.useEffect(() => { loadSessions() }, [])

  React.useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId)
      // Close mobile sheet when a session is selected
      setIsMobileSheetOpen(false)
    } else {
      setMessages([])
    }
  }, [currentSessionId])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Data Fetching
  async function loadSessions() {
    const data = await getChatSessions()
    setSessions(data)
    if (data.length > 0 && !currentSessionId) setCurrentSessionId(data[0].id)
  }

  async function loadMessages(id: string) {
    const msgs = await getChatMessages(id)
    setMessages(msgs)
  }

  async function handleNewChat() {
    setCurrentSessionId(null)
    setMessages([])
    setIsMobileSheetOpen(false)
  }

  async function handleSend(text: string) {
    if (loading) return
    setLoading(true)

    let sessionId = currentSessionId
    if (!sessionId) {
      const newSession = await createChatSession()
      if (newSession) {
        sessionId = newSession.id
        setCurrentSessionId(sessionId)
        setSessions(prev => [newSession, ...prev])
      } else {
        toast.error("Network error")
        setLoading(false)
        return
      }
    }

    setMessages(prev => [...prev, { role: "user", content: text }])
    
    // Call Server Action
    const res = await sendMessageAction(sessionId!, text)
    
    if (res.success) {
      await loadMessages(sessionId!)
      await loadSessions()
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  async function handleRename(id: string) {
    if (!editTitle.trim()) return
    await renameSessionAction(id, editTitle)
    setSessions(sessions.map(s => s.id === id ? { ...s, title: editTitle } : s))
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this conversation?")) {
      await deleteSessionAction(id)
      const remaining = sessions.filter(s => s.id !== id)
      setSessions(remaining)
      if (currentSessionId === id) setCurrentSessionId(remaining[0]?.id || null)
      toast.success("Deleted")
    }
  }

  // --- REUSABLE SIDEBAR CONTENT ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white md:border-r border-slate-100">
      
      {/* Sidebar Header */}
      <div className="p-4 md:p-5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/admin" className="flex items-center gap-3 group">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-[#1C3FA4] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 text-white transition-transform group-hover:scale-105">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-sm md:text-base">AI Assistant</span>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hidden lg:flex" onClick={() => setSidebarOpen(false)}>
            <PanelLeft className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          onClick={handleNewChat}
          className="w-full justify-start gap-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold h-12 rounded-2xl border border-slate-100 shadow-sm transition-all group active:scale-[0.98]"
        >
          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center border border-slate-100 group-hover:border-[#1C3FA4] transition-colors">
             <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1C3FA4]" /> 
          </div>
          New Conversation
        </Button>
      </div>

      {/* History List */}
      <ScrollArea className="flex-1 px-3 md:px-4">
        <div className="space-y-1.5 pb-4">
          <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <History className="w-3 h-3" /> History
          </div>
          
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-200 text-sm font-medium ${
                currentSessionId === session.id 
                  ? "bg-blue-50/50 text-[#1C3FA4]" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              <MessageSquare className={`w-4 h-4 shrink-0 ${currentSessionId === session.id ? "text-[#1C3FA4]" : "text-slate-300"}`} />
              
              {editingId === session.id ? (
                <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                  <Input 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)} 
                    className="h-7 bg-white border-slate-200 text-xs w-full px-2 rounded-lg"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(session.id)}
                  />
                  <Check className="w-4 h-4 text-emerald-600 cursor-pointer p-0.5 hover:bg-emerald-50 rounded" onClick={() => handleRename(session.id)} />
                  <X className="w-4 h-4 text-rose-500 cursor-pointer p-0.5 hover:bg-rose-50 rounded" onClick={() => setEditingId(null)} />
                </div>
              ) : (
                <>
                  <span className="truncate flex-1">{session.title}</span>
                  {currentSessionId === session.id && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-[#1C3FA4] rounded-lg" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-32 p-1 bg-white border-slate-100 shadow-xl rounded-xl" align="start">
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(session.id); setEditTitle(session.title) }} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg w-full text-left transition-colors">
                          <Edit2 className="w-3 h-3" /> Rename
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(session.id) }} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg w-full text-left transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </PopoverContent>
                    </Popover>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-50 bg-white">
         <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-slate-50 border border-slate-100">
           <Avatar className="h-8 w-8 bg-white border border-slate-100 shadow-sm">
             <AvatarImage src="https://github.com/shadcn.png" />
             <AvatarFallback className="bg-[#1C3FA4] text-white text-xs font-bold">AD</AvatarFallback>
           </Avatar>
           <div className="flex flex-col">
             <span className="text-xs font-bold text-slate-900">Admin Console</span>
             <span className="text-[10px] font-medium text-slate-400">Pro License</span>
           </div>
         </div>
      </div>
    </div>
  )

  const isHero = !currentSessionId || messages.length === 0;

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-50 flex bg-white font-sans text-slate-900 overflow-hidden">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <div className={`hidden lg:flex flex-col shrink-0 transition-all duration-500 ease-in-out relative border-r border-slate-100 ${isSidebarOpen ? "w-[300px]" : "w-0 overflow-hidden"}`}>
          <SidebarContent />
        </div>

        {/* --- MOBILE SIDEBAR DRAWER --- */}
        <div className="lg:hidden absolute top-4 left-4 z-50">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="hover:bg-slate-100 rounded-xl h-10 w-10">
                <Menu className="w-6 h-6 text-slate-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[300px] border-r-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col h-full relative bg-white">
          
          {/* Top Navbar */}
          <header className="h-16 flex items-center justify-between px-4 lg:px-8 z-20 bg-white/90 backdrop-blur-xl sticky top-0 border-b border-slate-50 lg:border-none">
              <div className="flex items-center gap-2 pl-12 lg:pl-0">
                {!isSidebarOpen && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="hidden lg:flex text-slate-400 hover:text-slate-900 -ml-2 rounded-xl">
                        <PanelLeft className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open Sidebar</TooltipContent>
                  </Tooltip>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-600 truncate max-w-[150px] sm:max-w-none">Udyog Neural v4.0</span>
                </div>
              </div>       
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-3xl mx-auto w-full h-full flex flex-col">
              
              {/* HERO STATE */}
              {isHero ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 space-y-8 md:space-y-10 animate-in fade-in zoom-in-95 duration-700 -mt-20">
                  
                  {/* Hero Icon */}
                  <div className="relative group cursor-default">
                    <div className="absolute inset-0 bg-[#1C3FA4]/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <AIIcon size="lg" />
                  </div>
                  
                  <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Good Afternoon</h2>
                      <p className="text-base md:text-lg text-slate-500 font-medium">How can I assist you today?</p>
                  </div>

                  {/* Input In Hero */}
                  <ChatInput onSend={handleSend} isLoading={loading} isHero={true} />

                  {/* Prompt Suggestions - Grid adapts to screen size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl pt-4 md:pt-8">
                    <SuggestionCard title="Analyze Data" subtitle="System metrics" onClick={handleSend} icon={LayoutGrid} />
                    <SuggestionCard title="Post Job" subtitle="New listing" onClick={handleSend} icon={Plus} />
                    <SuggestionCard title="Draft Email" subtitle="To candidates" onClick={handleSend} icon={Edit2} />
                    <SuggestionCard title="Search" subtitle="Open roles" onClick={handleSend} icon={Search} />
                  </div>
                </div>
              ) : (
                /* CHAT MESSAGES */
                <div className="flex flex-col pb-36 md:pb-48 pt-6 px-4 gap-6 md:gap-8"> 
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 md:gap-4 w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-4 duration-500`}>
                      {msg.role === "assistant" && (
                        <div className="mt-1 shrink-0">
                          <AIIcon size="sm" />
                        </div>
                      )}

                      <div className={`relative max-w-[85%] sm:max-w-[80%] px-5 py-3 md:px-6 md:py-4 rounded-[1.5rem] shadow-sm ${
                        msg.role === "user" 
                          ? "bg-slate-100 text-slate-800 rounded-tr-md" 
                          : "bg-white border border-slate-100 text-slate-800 rounded-tl-md shadow-md shadow-slate-100/50"
                      }`}>
                        <span className="whitespace-pre-wrap text-sm md:text-[15px] font-medium leading-relaxed">{msg.content}</span>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex gap-4 w-full justify-start animate-in fade-in duration-300">
                      <div className="mt-1 shrink-0"><AIIcon size="sm" /></div>
                      <div className="flex items-center gap-1.5 h-10 bg-white px-5 rounded-full border border-slate-100 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-[#1C3FA4] rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-[#1C3FA4] rounded-full animate-bounce delay-150"></span>
                        <span className="w-1.5 h-1.5 bg-[#1C3FA4] rounded-full animate-bounce delay-300"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* FLOATING INPUT (When Active) */}
          {!isHero && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-6 px-4 z-20">
               <ChatInput onSend={handleSend} isLoading={loading} isHero={false} />
               <p className="text-center text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest">AI Generated • Check for accuracy</p>
            </div>
          )}

        </div>
      </div>
    </TooltipProvider>
  )
}

// --- SUGGESTION CARD ---
function SuggestionCard({ title, subtitle, onClick, icon: Icon }: any) {
  return (
    <button 
      onClick={() => onClick(`${title} ${subtitle}`)}
      className="flex flex-col items-start p-4 rounded-[1.5rem] bg-white border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 text-left group h-full active:scale-95 w-full"
    >
      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#1C3FA4] group-hover:text-white transition-colors mb-3">
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-sm font-bold text-slate-800 line-clamp-1">{title}</p>
      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-medium">{subtitle}</p>
    </button>
  )
}