"use client"

import * as React from "react"
import { StreamChat, Channel, ChannelSort, ChannelFilters, MessageResponse, Event } from 'stream-chat'
import { getStreamTokenAction } from "@/app/actions/stream-actions"
import { 
  getChattableReferrersAction, 
  syncReferrerToStreamAction 
} from "@/app/actions/candidate-stream-actions"
import { toast } from "sonner"
import { 
  Loader2, Search, SendHorizontal, AlertCircle, 
  Building2, ArrowLeft, Info, Mail, Trash2, 
  MessageSquarePlus, CheckCheck, Linkedin, Phone
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!

// --- TYPES ---
type Referrer = {
  id: string;
  full_name: string;
  avatar_url?: string;
  company?: string;
  company_name?: string;
  job_title?: string;
  email?: string;
  linkedin?: string;
  linkedin_url?: string;
  phone?: string;
}

// --- COMPONENT: PROFILE SHEET ---
const ReferrerProfileSheet = ({ 
  isOpen, 
  onClose, 
  user,
  channel 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  user: any;
  channel: Channel | null;
}) => {
  if (!user) return null;

  const handleDeleteConversation = async () => {
    if (!channel) return;
    const confirm = window.confirm("Are you sure you want to delete this conversation?");
    
    if (confirm) {
      try {
        try {
          await channel.delete();
          toast.success("Conversation deleted");
        } catch (deleteError) {
          await channel.hide(null, true);
          toast.success("Conversation removed");
        }
        window.location.reload(); 
      } catch (err) {
        toast.error("Could not delete conversation");
      }
    }
  }

  // Helper to safely get data whether from Stream user object or DB object
  const company = user.company || user.company_name || "Not specified";
  const email = user.email || "Hidden";
  const phone = user.phone || "Not shared";
  const linkedin = user.linkedin || user.linkedin_url;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[100%] sm:w-[400px] overflow-y-auto bg-white border-l shadow-2xl z-[100] flex flex-col h-full text-slate-900 px-6 pb-8">
        <SheetHeader className="pb-6 border-b border-slate-50">
          <SheetTitle className="text-slate-900 text-xl font-bold">Referrer Profile</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 py-8">
          <div className="flex flex-col items-center text-center space-y-5">
            <Avatar className="w-28 h-28 border-4 border-white shadow-xl ring-1 ring-slate-100">
              <AvatarImage src={user.image} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-50 to-white text-[#1C3FA4] text-4xl font-bold">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="bg-blue-50 text-[#1C3FA4] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Referrer
                </span>
                {linkedin && (
                  <a 
                    href={linkedin} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1 rounded-full bg-blue-50 text-[#0077b5] hover:bg-blue-100 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-8">
            {/* Work Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Professional Details</h3>
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#1C3FA4] border border-slate-50">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Company</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {company}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Contact Method</h3>
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                 
                 {/* Email */}
                 <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#1C3FA4] border border-slate-50">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden w-full">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Email Address</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-200/50">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#1C3FA4] border border-slate-50">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden w-full">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {phone}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {channel && (
          <SheetFooter className="pt-6 mt-auto border-t border-slate-50">
            {/* FIXED: Red Button Styling */}
            <button 
              className="w-full flex items-center justify-center gap-2 rounded-xl h-12 font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
              onClick={handleDeleteConversation}
            >
              <Trash2 className="w-4 h-4" />
              Delete Conversation
            </button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function CandidateMessagesPage() {
  // --- STATE ---
  const [client, setClient] = React.useState<StreamChat | null>(null)
  const [channels, setChannels] = React.useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = React.useState<Channel | null>(null)
  const [messages, setMessages] = React.useState<MessageResponse[]>([])
  const [referrers, setReferrers] = React.useState<Referrer[]>([])
  
  // UI State
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [inputText, setInputText] = React.useState("")
  const [showProfileSheet, setShowProfileSheet] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // --- 1. INITIALIZE CHAT CLIENT ---
  React.useEffect(() => {
    let isMounted = true;
    let chatClient: StreamChat | null = null;

    const init = async () => {
      try {
        const [tokenData, refList] = await Promise.all([
          getStreamTokenAction(),
          getChattableReferrersAction()
        ]);

        if (!tokenData || !apiKey) return;

        chatClient = StreamChat.getInstance(apiKey);
        
        await chatClient.connectUser(
          { 
            id: tokenData.userId, 
            name: tokenData.userName || "Candidate", 
            image: tokenData.userImage || "" 
          },
          tokenData.token
        );

        if (!isMounted) return;

        setClient(chatClient)
        setReferrers(refList || [])

        const filters: ChannelFilters = { 
          type: 'messaging', 
          members: { $in: [tokenData.userId] } 
        };
        const sort: ChannelSort = { last_message_at: -1 };
        
        const channels = await chatClient.queryChannels(filters, sort, {
          watch: true, 
          state: true,
        });
        
        setChannels(channels);
        setLoading(false);

        chatClient.on('notification.message_new', async (event) => {
           const updatedChannels = await chatClient!.queryChannels(filters, sort, {
             watch: true,
             state: true
           });
           setChannels(updatedChannels);
        });

      } catch (err) {
        console.error("Chat Init Error:", err)
        setLoading(false)
      }
    };

    init();

    return () => {
      isMounted = false;
      // if (chatClient) chatClient.disconnectUser();
    };
  }, []);

  // --- 2. WATCH ACTIVE CHANNEL ---
  React.useEffect(() => {
    if (!activeChannel) return;

    const handleEvent = (event: Event) => {
      if (event.type === 'message.new') {
        setMessages((prev) => [...prev, event.message as MessageResponse]);
        setTimeout(() => scrollToBottom(), 100);
      }
      if (event.type === 'message.updated') {
        setMessages((prev) => prev.map(m => m.id === event.message?.id ? (event.message as MessageResponse) : m));
      }
      if (event.type === 'message.deleted') {
        setMessages((prev) => prev.filter(m => m.id !== event.message?.id));
      }
    };

    const loadChannel = async () => {
      const state = await activeChannel.watch();
      setMessages(state.messages as MessageResponse[]);
      setTimeout(() => scrollToBottom(), 100);

      activeChannel.on('message.new', handleEvent);
      activeChannel.on('message.updated', handleEvent);
      activeChannel.on('message.deleted', handleEvent);
    };

    loadChannel();

    return () => {
      activeChannel.off('message.new', handleEvent);
      activeChannel.off('message.updated', handleEvent);
      activeChannel.off('message.deleted', handleEvent);
    };
  }, [activeChannel]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  // --- ACTIONS ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChannel) return;

    const text = inputText;
    setInputText(""); 
    setSending(true);

    try {
      await activeChannel.sendMessage({ text });
      setSending(false);
    } catch (err) {
      toast.error("Failed to send message");
      setInputText(text);
      setSending(false);
    }
  }

  const handleStartChat = async (referrer: Referrer) => {
    if (!client) return;

    const existingChannel = channels.find(c => 
      Object.values(c.state.members).some(m => m.user_id === referrer.id)
    );

    if (existingChannel) {
      setActiveChannel(existingChannel);
      setSearchQuery("");
      return;
    }

    const toastId = toast.loading("Starting conversation...");
    try {
      await syncReferrerToStreamAction(referrer.id); 

      const channel = client.channel('messaging', {
        members: [client.userID!, referrer.id],
      });

      await channel.create();
      
      setChannels(prev => [channel, ...prev]);
      setActiveChannel(channel);
      setSearchQuery("");
      toast.dismiss(toastId);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Could not start chat");
    }
  }

  // --- HELPER ---
  const getOtherMember = (channel: Channel) => {
    if (!client) return null;
    const members = Object.values(channel.state.members);
    return members.find(m => m.user_id !== client.userID)?.user;
  }

  // --- FILTER ---
  const filteredReferrers = referrers.filter(r => {
    if (client && r.id === client.userID) return false;
    const q = searchQuery.toLowerCase();
    const company = r.company || r.company_name || "";
    return (
      r.full_name.toLowerCase().includes(q) ||
      company.toLowerCase().includes(q)
    );
  });

  const activeOtherMember = activeChannel ? getOtherMember(activeChannel) : null;

  // --- RENDER ---
  if (loading) {
    return (
      <div className="h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[#1C3FA4] animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your messages...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Connection Error</h3>
        <p className="text-slate-500">Please refresh the page to try again.</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-85px)] md:h-[calc(100vh-40px)] w-full max-w-[1600px] mx-auto p-0 md:p-6 font-sans">
      <div className="h-full bg-white md:border md:border-slate-100 md:rounded-[2.5rem] md:shadow-2xl md:shadow-slate-200/50 overflow-hidden flex md:ring-4 md:ring-slate-50/50 relative">
        
        {/* --- LEFT SIDEBAR (Inbox) --- */}
        <div className={`
          w-full md:w-[420px] flex-col border-r border-slate-50 bg-white h-full z-0
          ${activeChannel ? 'hidden md:flex' : 'flex'} 
        `}>
          <div className="p-6 pb-4 space-y-6">
             <div className="flex items-center justify-between">
                <h1 className="font-bold text-slate-900 text-2xl tracking-tight">Messages</h1>
                <div className="bg-blue-50 px-3 py-1 rounded-full text-[#1C3FA4] text-xs font-bold border border-blue-100">
                  {channels.length} Chats
                </div>
              </div>

             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1C3FA4] transition-colors" />
                <Input 
                  placeholder="Search for referrers..." 
                  className="pl-11 h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#1C3FA4]/20 focus:ring-4 focus:ring-[#1C3FA4]/5 text-slate-900 transition-all placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
          </div>

          <ScrollArea className="flex-1 px-3">
            {searchQuery.length > 0 ? (
              <div className="pb-4">
                <p className="text-[11px] font-bold text-[#1C3FA4] uppercase tracking-widest px-4 py-2 mb-2">Global Search Results</p>
                {filteredReferrers.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleStartChat(r)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50/50 transition-all group text-left mb-1"
                  >
                     <Avatar className="w-10 h-10 border border-slate-100 bg-white">
                        <AvatarImage src={r.avatar_url} />
                        <AvatarFallback className="bg-blue-100 text-[#1C3FA4] font-bold">{r.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900">{r.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{r.company || r.company_name || "Referrer"}</p>
                      </div>
                      <MessageSquarePlus className="w-5 h-5 text-[#1C3FA4] opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
                {filteredReferrers.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    <p>No results found.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="pb-4 space-y-1">
                {channels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 mt-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                      <MessageSquarePlus className="w-8 h-8" />
                    </div>
                    <p className="text-slate-900 font-bold">No chats yet</p>
                    <p className="text-slate-500 text-sm mt-1 max-w-[200px]">Search for a referrer above to start.</p>
                  </div>
                ) : (
                  channels.map(channel => {
                    const other = getOtherMember(channel);
                    const unread = channel.countUnread();
                    const lastMsg = channel.state.messages[channel.state.messages.length - 1];
                    const isActive = activeChannel?.id === channel.id;

                    return (
                      <button
                        key={channel.id}
                        onClick={() => setActiveChannel(channel)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left border
                          ${isActive 
                            ? 'bg-[#1C3FA4]/5 border-[#1C3FA4]/10 shadow-sm' 
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                          }
                        `}
                      >
                         <div className="relative">
                          <Avatar className="w-12 h-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                            <AvatarImage src={other?.image as string} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-50 to-white text-[#1C3FA4] font-bold">
                              {(other?.name as string)?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1C3FA4] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                              {unread}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-0.5">
                              <span className={`text-[15px] truncate ${isActive || unread > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                {other?.name || "Unknown"}
                              </span>
                              {lastMsg?.created_at && (
                                <span className={`text-[10px] ${unread > 0 ? 'text-[#1C3FA4] font-bold' : 'text-slate-400'}`}>
                                  {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                           </div>
                           <p className={`text-[13px] truncate ${unread > 0 ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                              {lastMsg?.text || "Start a conversation"}
                           </p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* --- RIGHT SIDE (Chat Window) --- */}
        <div className={`
          flex-1 flex-col bg-slate-50/30 overflow-hidden relative h-full
          ${activeChannel ? 'flex fixed inset-0 z-50 md:static md:z-0 bg-white' : 'hidden md:flex'}
        `}>
          {activeChannel ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-100 bg-white/95 backdrop-blur-sm h-[72px] md:h-[88px] shrink-0">
                 <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden text-slate-500 -ml-2"
                      onClick={() => setActiveChannel(null)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    
                    <button onClick={() => setShowProfileSheet(true)} className="flex items-center gap-3 text-left group">
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-slate-100 shadow-sm">
                        <AvatarImage src={activeOtherMember?.image as string} />
                        <AvatarFallback className="bg-blue-50 text-[#1C3FA4] font-bold">
                          {(activeOtherMember?.name as string)?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight group-hover:text-[#1C3FA4] transition-colors">
                          {activeOtherMember?.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                           {(activeOtherMember?.company as string) || (activeOtherMember?.company_name as string) ? (
                              <>
                                <Building2 className="w-3 h-3" />
                                {(activeOtherMember?.company as string) || (activeOtherMember?.company_name as string)}
                              </>
                           ) : (
                              <><span className="w-1.5 h-1.5 bg-green-500 rounded-full"/> Online</>
                           )}
                        </p>
                      </div>
                    </button>
                 </div>
                 
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="text-slate-400 hover:text-[#1C3FA4] hover:bg-blue-50"
                   onClick={() => setShowProfileSheet(true)}
                 >
                   <Info className="w-5 h-5" />
                 </Button>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30"
              >
                 {messages.map((msg, i) => {
                    const isMe = msg.user?.id === client.userID;
                    const showAvatar = !isMe && (i === 0 || messages[i-1].user?.id !== msg.user?.id);

                    return (
                      <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                         <div className={`flex max-w-[85%] md:max-w-[70%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isMe && (
                              <div className="w-8 shrink-0">
                                {showAvatar && (
                                  <Avatar className="w-8 h-8 border border-white shadow-sm">
                                    <AvatarImage src={msg.user?.image as string} />
                                    <AvatarFallback className="bg-blue-100 text-[#1C3FA4] text-xs font-bold">
                                      {(msg.user?.name as string)?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            )}

                            <div className={`
                              p-3 md:p-4 rounded-2xl text-[14px] md:text-[15px] leading-relaxed shadow-sm
                              ${isMe 
                                ? 'bg-[#1C3FA4] text-white rounded-br-sm' 
                                : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                              }
                            `}>
                               {msg.text}
                               <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                  {msg.created_at && new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {isMe && <CheckCheck className="w-3 h-3" />}
                               </div>
                            </div>
                         </div>
                      </div>
                    )
                 })}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <form 
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2 max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-2 pl-4 focus-within:ring-2 focus-within:ring-[#1C3FA4]/10 focus-within:border-[#1C3FA4] transition-all"
                >
                   <Input 
                      className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 p-0 text-base placeholder:text-slate-400 h-auto py-2"
                      placeholder="Type a message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                   />
                   <Button 
                    type="submit" 
                    disabled={!inputText.trim() || sending}
                    className="rounded-xl bg-[#1C3FA4] hover:bg-[#152d75] text-white shrink-0 w-10 h-10 p-0"
                   >
                     {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-5 h-5 ml-0.5" />}
                   </Button>
                </form>
              </div>

              {/* Profile Sheet */}
              <ReferrerProfileSheet 
                isOpen={showProfileSheet}
                onClose={() => setShowProfileSheet(false)}
                user={activeOtherMember}
                channel={activeChannel}
              />

            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
               <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 border border-slate-100">
                  <MessageSquarePlus className="w-10 h-10 text-[#1C3FA4]" />
               </div>
               <h3 className="text-xl font-bold text-slate-900">Your Messages</h3>
               <p className="text-slate-500 max-w-xs mt-2">
                 Select a chat from the inbox or start a new conversation.
               </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}