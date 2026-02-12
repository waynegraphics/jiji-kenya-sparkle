import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, ArrowLeft, Loader2, MessageCircle, Paperclip, Play, Pause, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmojiPicker } from "@/components/EmojiPicker";
import { VoiceRecorder } from "@/components/VoiceRecorder";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string | null;
  is_read: boolean;
  created_at: string;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
}

interface ListingInfo {
  id: string;
  title: string;
  price: number;
  images: string[] | null;
  currency?: string;
  category_name?: string;
}

interface Conversation {
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  listing_id: string | null;
  listing_info: ListingInfo | null;
  last_message: string;
  last_message_type: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchProfiles = async (userIds: string[]) => {
    const uniqueIds = [...new Set(userIds)].filter(id => !profiles.has(id));
    if (uniqueIds.length === 0) return profiles;
    const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", uniqueIds);
    const newProfiles = new Map(profiles);
    if (data) data.forEach(p => newProfiles.set(p.user_id, p as Profile));
    setProfiles(newProfiles);
    return newProfiles;
  };

  const fetchListingInfo = async (listingIds: string[]): Promise<Map<string, ListingInfo>> => {
    const map = new Map<string, ListingInfo>();
    if (listingIds.length === 0) return map;
    const { data: baseListings } = await supabase.from("base_listings")
      .select("id, title, price, images, currency, main_category_id, main_categories(name)")
      .in("id", listingIds);
    if (baseListings) {
      baseListings.forEach((l: any) => {
        map.set(l.id, { id: l.id, title: l.title, price: l.price, images: l.images, currency: l.currency || "KES", category_name: l.main_categories?.name || "" });
      });
    }
    const remaining = listingIds.filter(id => !map.has(id));
    if (remaining.length > 0) {
      const { data: oldListings } = await supabase.from("listings").select("id, title, price, images, category").in("id", remaining);
      if (oldListings) oldListings.forEach((l: any) => map.set(l.id, { id: l.id, title: l.title, price: l.price, images: l.images, category_name: l.category || "" }));
    }
    return map;
  };

  const fetchConversations = async () => {
    if (!user) return;
    const { data: messagesData } = await supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false });
    if (!messagesData) return;

    const conversationMap = new Map<string, any[]>();
    messagesData.forEach((msg) => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const key = `${otherId}-${msg.listing_id || "general"}`;
      if (!conversationMap.has(key)) conversationMap.set(key, []);
      conversationMap.get(key)?.push(msg);
    });

    const userIds = [...new Set(messagesData.flatMap(m => [m.sender_id, m.receiver_id]))];
    const profs = await fetchProfiles(userIds);
    const listingIds = [...new Set(messagesData.map(m => m.listing_id).filter(Boolean))] as string[];
    const listingsMap = await fetchListingInfo(listingIds);

    const convList: Conversation[] = [];
    conversationMap.forEach((msgs, key) => {
      const [otherId, listingPart] = key.split("-");
      const lid = listingPart === "general" ? null : listingPart;
      const lastMsg = msgs[0];
      const unreadCount = msgs.filter((m: any) => m.receiver_id === user.id && !m.is_read).length;
      const profile = profs.get(otherId);
      convList.push({
        other_user_id: otherId,
        other_user_name: profile?.display_name || "Unknown",
        other_user_avatar: profile?.avatar_url || null,
        listing_id: lid,
        listing_info: lid ? listingsMap.get(lid) || null : null,
        last_message: lastMsg.content,
        last_message_type: lastMsg.message_type || "text",
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
    let query = supabase.from("messages").select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    if (listingId) query = query.eq("listing_id", listingId);
    else query = query.is("listing_id", null);
    const { data } = await query;
    if (data) {
      setMessages(data as Message[]);
      const unreadIds = data.filter(m => m.receiver_id === user.id && !m.is_read).map(m => m.id);
      if (unreadIds.length > 0) await supabase.from("messages").update({ is_read: true }).in("id", unreadIds);
    }
  };

  const sendMessage = async (content?: string, type = "text", fileUrl?: string, fileName?: string, fileSize?: number) => {
    if (!user || !selectedConversation) return;
    const msgContent = content || newMessage.trim();
    if (!msgContent && type === "text") return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id, receiver_id: selectedConversation.other_user_id,
        listing_id: selectedConversation.listing_id, content: msgContent || fileName || "File",
        message_type: type, file_url: fileUrl || null, file_name: fileName || null, file_size: fileSize || null,
      } as any);
      if (error) throw error;
      setNewMessage("");
      fetchMessages(selectedConversation.other_user_id, selectedConversation.listing_id);
      fetchConversations();
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); }
  };

  const uploadFile = async (file: File, type: "image" | "file") => {
    if (!user) return;
    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("messages").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("messages").getPublicUrl(path);
      await sendMessage(file.name, type, publicUrl, file.name, file.size);
    } catch { toast.error("Failed to upload file"); }
    finally { setUploading(false); }
  };

  const uploadVoiceNote = async (blob: Blob) => {
    if (!user) return;
    setUploading(true);
    try {
      const path = `${user.id}/voice_${Date.now()}.webm`;
      const { error } = await supabase.storage.from("messages").upload(path, blob);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("messages").getPublicUrl(path);
      await sendMessage("Voice message", "voice", publicUrl, "voice_note.webm", blob.size);
    } catch { toast.error("Failed to send voice note"); }
    finally { setUploading(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, file.type.startsWith("image/") ? "image" : "file");
    e.target.value = "";
  };

  const toggleAudio = (url: string) => {
    if (playingAudio === url) { audioRef.current?.pause(); setPlayingAudio(null); }
    else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audio.onended = () => setPlayingAudio(null);
      audio.play();
      audioRef.current = audio;
      setPlayingAudio(url);
    }
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

  const getLastMessagePreview = (conv: Conversation) => {
    switch (conv.last_message_type) {
      case "image": return "📷 Photo";
      case "voice": return "🎤 Voice message";
      case "file": return "📎 " + conv.last_message;
      default: return conv.last_message;
    }
  };

  const getListingImage = (info: ListingInfo | null) => {
    if (!info?.images || info.images.length === 0) return null;
    const img = info.images[0];
    if (img.startsWith("http")) return img;
    return supabase.storage.from("listings").getPublicUrl(img).data.publicUrl;
  };

  const renderMessage = (msg: Message) => {
    const isMine = msg.sender_id === user?.id;
    const bubbleClass = isMine ? "bg-primary text-primary-foreground" : "bg-muted";
    const timeClass = isMine ? "text-primary-foreground/70" : "text-muted-foreground";

    return (
      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${bubbleClass}`}>
          {msg.message_type === "image" && msg.file_url && (
            <img src={msg.file_url} alt="Shared image" className="rounded-lg max-w-full max-h-64 mb-1 cursor-pointer" onClick={() => window.open(msg.file_url!, "_blank")} />
          )}
          {msg.message_type === "voice" && msg.file_url && (
            <button onClick={() => toggleAudio(msg.file_url!)} className="flex items-center gap-2 py-1">
              {playingAudio === msg.file_url ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              <div className="flex gap-0.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className={`w-1 rounded-full ${isMine ? "bg-primary-foreground/40" : "bg-foreground/20"}`} style={{ height: `${Math.random() * 16 + 4}px` }} />
                ))}
              </div>
            </button>
          )}
          {msg.message_type === "file" && msg.file_url && (
            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1">
              <FileText className="h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{msg.file_name || "File"}</p>
                {msg.file_size && <p className={`text-xs ${timeClass}`}>{(msg.file_size / 1024).toFixed(0)} KB</p>}
              </div>
            </a>
          )}
          {msg.message_type === "text" && <p className="break-words whitespace-pre-wrap">{msg.content}</p>}
          <p className={`text-xs mt-1 ${timeClass}`}>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Messages</h2>
      <div className="bg-card rounded-xl shadow-card flex overflow-hidden border" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
        {/* Conversations List */}
        <div className={`w-full md:w-96 border-r flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b"><h3 className="font-semibold text-lg">Chats</h3></div>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No messages yet</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const listingImg = getListingImage(conv.listing_info);
                return (
                  <button key={`${conv.other_user_id}-${conv.listing_id}`} onClick={() => selectConversation(conv)}
                    className={`w-full p-3 flex gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 ${
                      selectedConversation?.other_user_id === conv.other_user_id && selectedConversation?.listing_id === conv.listing_id ? "bg-muted" : ""
                    }`}>
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conv.other_user_avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{conv.other_user_name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{conv.unread_count}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold truncate text-sm">{conv.other_user_name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: false })}</span>
                      </div>
                      {conv.listing_info && (
                        <div className="flex items-center gap-2 mt-0.5">
                          {listingImg && <img src={listingImg} alt="" className="w-6 h-6 rounded object-cover shrink-0" />}
                          <span className="text-xs text-primary truncate font-medium">{conv.listing_info.title}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{conv.listing_info.currency || "KES"} {Number(conv.listing_info.price).toLocaleString()}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{getLastMessagePreview(conv)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${selectedConversation ? "flex" : "hidden md:flex"}`}>
          {selectedConversation ? (
            <>
              <div className="border-b bg-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedConversation(null)} className="md:hidden shrink-0"><ArrowLeft className="h-5 w-5" /></button>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={selectedConversation.other_user_avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{selectedConversation.other_user_name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{selectedConversation.other_user_name}</h3>
                    {selectedConversation.listing_info && <p className="text-xs text-muted-foreground truncate">Re: {selectedConversation.listing_info.title}</p>}
                  </div>
                </div>
                {selectedConversation.listing_info && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    {getListingImage(selectedConversation.listing_info) && (
                      <img src={getListingImage(selectedConversation.listing_info)!} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedConversation.listing_info.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-primary">{selectedConversation.listing_info.currency || "KES"} {Number(selectedConversation.listing_info.price).toLocaleString()}</span>
                        {selectedConversation.listing_info.category_name && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{selectedConversation.listing_info.category_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-3">
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="border-t bg-card p-3">
                {uploading && <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Loader2 className="h-4 w-4 animate-spin" />Uploading...</div>}
                <div className="flex items-end gap-1">
                  <EmojiPicker onEmojiSelect={(emoji) => setNewMessage(prev => prev + emoji)} />
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.txt,.zip" />
                  <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} disabled={sending || uploading} />
                  {newMessage.trim() ? (
                    <Button onClick={() => sendMessage()} disabled={sending || uploading} size="icon" className="h-9 w-9 shrink-0 rounded-full">
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  ) : (
                    <VoiceRecorder onRecordingComplete={uploadVoiceNote} disabled={uploading} />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center"><MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" /><p className="font-medium text-lg">Select a conversation</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerMessages;
