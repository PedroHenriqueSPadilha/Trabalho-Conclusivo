import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, MessageSquare, User, Calendar, ChevronRight, Search, FileText, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface PsychologistNote {
  summary: string | null;
  emotional_state: string | null;
  recommendations: string | null;
  follow_up_needed: boolean | null;
}

interface ChatWithPatient {
  id: string;
  initial_emotion: string | null;
  initial_message: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  patient_id: string;
  patient_name: string | null;
  patient_email: string | null;
  message_count: number;
  notes: PsychologistNote | null;
}

interface GroupedChats {
  [patientId: string]: {
    patientName: string;
    patientEmail: string | null;
    chats: ChatWithPatient[];
  };
}

const ChatHistory = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [chats, setChats] = useState<ChatWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (userRole !== "psychologist") {
      navigate("/");
      return;
    }

    fetchChatHistory();
  }, [userRole, navigate]);

  const fetchChatHistory = async () => {
    setLoading(true);
    
    // Fetch completed chats assigned to this psychologist
    const { data: chatsData, error: chatsError } = await supabase
      .from("chats")
      .select("*")
      .eq("status", "completed")
      .order("updated_at", { ascending: false });

    if (chatsError || !chatsData) {
      console.error("Error fetching chats:", chatsError);
      setLoading(false);
      return;
    }

    // Get patient profiles for non-anonymous users
    const patientIds = [...new Set(chatsData.map(c => c.patient_id))];
    
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, is_anonymous")
      .in("user_id", patientIds);

    // Get message counts for each chat
    const chatIds = chatsData.map(c => c.id);
    const { data: messagesData } = await supabase
      .from("messages")
      .select("chat_id")
      .in("chat_id", chatIds);

    const messageCounts: { [key: string]: number } = {};
    messagesData?.forEach(m => {
      messageCounts[m.chat_id] = (messageCounts[m.chat_id] || 0) + 1;
    });

    // Get psychologist notes for each chat
    const { data: notesData } = await supabase
      .from("psychologist_notes")
      .select("chat_id, summary, emotional_state, recommendations, follow_up_needed")
      .in("chat_id", chatIds);

    const notesMap: { [key: string]: PsychologistNote } = {};
    notesData?.forEach(n => {
      notesMap[n.chat_id] = {
        summary: n.summary,
        emotional_state: n.emotional_state,
        recommendations: n.recommendations,
        follow_up_needed: n.follow_up_needed,
      };
    });

    // Combine data - include all chats except those from explicitly anonymous users
    const enrichedChats: ChatWithPatient[] = chatsData
      .filter(chat => {
        const profile = profilesData?.find(p => p.user_id === chat.patient_id);
        // Exclude only if profile exists AND is_anonymous is explicitly true
        if (profile && profile.is_anonymous === true) {
          return false;
        }
        return true;
      })
      .map(chat => {
        const profile = profilesData?.find(p => p.user_id === chat.patient_id);
        return {
          ...chat,
          patient_name: profile?.full_name || null,
          patient_email: profile?.email || null,
          message_count: messageCounts[chat.id] || 0,
          notes: notesMap[chat.id] || null,
        };
      });

    setChats(enrichedChats);
    setLoading(false);
  };

  // Group chats by patient
  const groupedChats: GroupedChats = chats
    .filter(chat => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        chat.patient_name?.toLowerCase().includes(search) ||
        chat.patient_email?.toLowerCase().includes(search) ||
        chat.initial_emotion?.toLowerCase().includes(search)
      );
    })
    .reduce((acc, chat) => {
      const patientId = chat.patient_id;
      if (!acc[patientId]) {
        acc[patientId] = {
          patientName: chat.patient_name || "Paciente",
          patientEmail: chat.patient_email,
          chats: [],
        };
      }
      acc[patientId].chats.push(chat);
      return acc;
    }, {} as GroupedChats);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <button
          onClick={() => navigate("/psychologist-dashboard")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-semibold text-foreground">Histórico de Conversas</h1>
          <p className="text-xs text-primary">Conversas finalizadas por paciente</p>
        </div>
      </header>

      {/* Search */}
      <div className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou emoção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {Object.keys(groupedChats).length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhuma conversa encontrada." : "Nenhum histórico de conversas ainda."}
            </p>
          </div>
        ) : (
          Object.entries(groupedChats).map(([patientId, { patientName, patientEmail, chats }]) => (
            <div key={patientId} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Patient Header */}
              <div className="flex items-center gap-3 p-4 bg-secondary/50 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{patientName}</h3>
                  {patientEmail && (
                    <p className="text-xs text-muted-foreground">{patientEmail}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
                  {chats.length} {chats.length === 1 ? "conversa" : "conversas"}
                </span>
              </div>

              {/* Chats List */}
              <div className="divide-y divide-border">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => navigate(`/chat-view?id=${chat.id}`)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {chat.initial_emotion && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            {chat.initial_emotion}
                          </span>
                        )}
                        {chat.notes?.follow_up_needed && (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Acompanhamento
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {chat.message_count} mensagens
                        </span>
                      </div>
                      
                      {/* Notes preview */}
                      {chat.notes && (
                        <div className="mb-2 text-xs text-muted-foreground bg-secondary/50 rounded p-2">
                          <div className="flex items-center gap-1 text-primary font-medium mb-1">
                            <FileText className="w-3 h-3" />
                            Notas do atendimento
                          </div>
                          {chat.notes.emotional_state && (
                            <p><span className="font-medium">Estado:</span> {chat.notes.emotional_state}</p>
                          )}
                          {chat.notes.summary && (
                            <p className="line-clamp-2"><span className="font-medium">Resumo:</span> {chat.notes.summary}</p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(chat.created_at)}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
