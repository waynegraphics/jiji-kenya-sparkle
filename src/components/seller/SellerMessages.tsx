import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  listing_id: string | null;
  listing_title: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

const SellerMessages = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());

  const fetchProfiles = async (userIds: string[]) => {
    const uniqueIds = [...new Set(userIds)].filter(id => !profiles.has(id));
    if (uniqueIds.length === 0) return;
    const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", uniqueIds);
    if (data) {
      const newProfiles = new Map(profiles);
      data.forEach(p => newProfiles.set(p.user_id, p as Profile));
      setProfiles(newProfiles);
    }
  };

  const fetchConversations = async () => {
    if (!user) return;
    const { data: messagesData } = await supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false });
    if (!messagesData) return;

    const conversationMap = new Map<string, Message[]>();
    messagesData.forEach((msg) => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const key = `${otherId}-${msg.listing_id || "general"}`;
      if (!conversationMap.has(key)) conversationMap.set(key, []);
      conversationMap.get(key)?.push(msg as Message);
    });

    const userIds = [...new Set(messagesData.flatMap(m => [m.sender_id, m.receiver_id]))];
    await fetchProfiles(userIds);

    const listingIds = [...new Set(messagesData.map(m => m.listing_id).filter(Boolean))];
    let listingsMap = new Map<string, string>();
    if (listingIds.length > 0) {
      const { data: listings } = await supabase.from("listings").select("id, title").in("id", listingIds as string[]);
      if (listings) listings.forEach(l => listingsMap.set(l.id, l.title));
    }

    const convList: Conversation[] = [];
    conversationMap.forEach((msgs, key) => {
      const [otherId, listingPart] = key.split("-");
      const listing_id = listingPart === "general" ? null : listingPart;
      const lastMsg = msgs[0];
      const unreadCount = msgs.filter(m => m.receiver_id === user.id && !m.is_read).length;
      const profile = profiles.get(otherId);
      convList.push({
        other_user_id: otherId,
        other_user_name: profile?.display_name || "Unknown",
        other_user_avatar: profile?.avatar_url || null,
        listing_id,
        listing_title: listing_id ? listingsMap.get(listing_id) || null : null,
        last_message: lastMsg.content,
        last_message_time: lastMsg.created_at,
        unread_count: unreadCount,
      });
    });
    convList.sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
    setConversations(convList);
    setLoading(false);
  };

  const fetchMessages = async (otherUserId: string, listingId: string | null) => {
    if (!user) return;
    let query = supabase.from("messages").select("*").or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`).order("created_at", { ascending: true });
    if (listingId) query = query.eq("listing_id", listingId);
    else query = query.is("listing_id", null);
    const { data } = await query;
    if (data) {
      setMessages(data as Message[]);
      const unreadIds = data.filter(m => m.receiver_id === user.id && !m.is_read).map(m => m.id);
      if (unreadIds.length > 0) await supabase.from("messages").update({ is_read: true }).in("id", unreadIds);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({ sender_id: user.id, receiver_id: selectedConversation.other_user_id, listing_id: selectedConversation.listing_id, content: newMessage.trim() });
      if (error) throw error;
      setNewMessage("");
      fetchMessages(selectedConversation.other_user_id, selectedConversation.listing_id);
      fetchConversations();
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); }
  };

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    fetchMessages(conv.other_user_id, conv.listing_id);
  };

  useEffect(() => { if (user) fetchConversations(); }, [user]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("seller-messages-changes").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => {
      if (selectedConversation) fetchMessages(selectedConversation.other_user_id, selectedConversation.listing_id);
      fetchConversations();
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedConversation]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Messages</h2>
      <div className="bg-card rounded-xl shadow-card flex overflow-hidden min-h-[500px] border">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b"><h3 className="font-semibold">Conversations</h3></div>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button key={`${conv.other_user_id}-${conv.listing_id}`} onClick={() => selectConversation(conv)}
                  className={`w-full p-4 flex gap-3 hover:bg-muted/50 transition-colors text-left ${selectedConversation?.other_user_id === conv.other_user_id && selectedConversation?.listing_id === conv.listing_id ? "bg-muted" : ""}`}>
                  <Avatar><AvatarImage src={conv.other_user_avatar || undefined} /><AvatarFallback>{conv.other_user_name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{conv.other_user_name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: false })}</span>
                    </div>
                    {conv.listing_title && <p className="text-xs text-primary truncate">{conv.listing_title}</p>}
                    <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread_count > 0 && <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">{conv.unread_count}</span>}
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${selectedConversation ? "flex" : "hidden md:flex"}`}>
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <button onClick={() => setSelectedConversation(null)} className="md:hidden"><ArrowLeft className="h-5 w-5" /></button>
                <Avatar><AvatarImage src={selectedConversation.other_user_avatar || undefined} /><AvatarFallback>{selectedConversation.other_user_name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <div>
                  <h3 className="font-semibold">{selectedConversation.other_user_name}</h3>
                  {selectedConversation.listing_title && <p className="text-sm text-primary">{selectedConversation.listing_title}</p>}
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..."
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} disabled={sending} />
                  <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center"><MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" /><p>Select a conversation</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerMessages;
