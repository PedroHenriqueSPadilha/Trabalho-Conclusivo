import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Loader2, Calendar, User, FileText, AlertCircle } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";

interface Message {
  id: string;
  content: string;
  sender_type: "user" | "ai" | "psychologist";
  created_at: string;
}

interface PsychologistNote {
  summary: string | null;
  emotional_state: string | null;
  recommendations: string | null;
  follow_up_needed: boolean | null;
}

interface ChatDetails {
  id: string;
  initial_emotion: string | null;
  initial_message: string | null;
  created_at: string;
  updated_at: string;
  patient_name: string | null;
  patient_email: string | null;
  notes: PsychologistNote | null;
}

const ChatView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("id");
  const { userRole } = useAuth();
  
  const [chat, setChat] = useState<ChatDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== "psychologist") {
      navigate("/");
      return;
    }

    if (!chatId) {
      navigate("/chat-history");
      return;
    }

    fetchChatDetails();
  }, [userRole, chatId, navigate]);

  const fetchChatDetails = async () => {
    if (!chatId) return;

    setLoading(true);

    // Fetch chat
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    if (chatError || !chatData) {
      console.error("Error fetching chat:", chatError);
      navigate("/chat-history");
      return;
    }

    // Fetch patient profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", chatData.patient_id)
      .maybeSingle();

    // Fetch psychologist notes
    const { data: notesData } = await supabase
      .from("psychologist_notes")
      .select("summary, emotional_state, recommendations, follow_up_needed")
      .eq("chat_id", chatId)
      .maybeSingle();

    // Fetch messages
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
    }

    setChat({
      ...chatData,
      patient_name: profileData?.full_name || null,
      patient_email: profileData?.email || null,
      notes: notesData || null,
    });

    setMessages(messagesData || []);
    setLoading(false);
  };

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

  if (!chat) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <button
          onClick={() => navigate("/chat-history")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Visualizar Conversa</h1>
          <p className="text-xs text-primary">Modo somente leitura</p>
        </div>
      </header>

      {/* Chat Info */}
      <div className="p-4 bg-secondary/30 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{chat.patient_name || "Paciente"}</h3>
            {chat.patient_email && (
              <p className="text-xs text-muted-foreground">{chat.patient_email}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {chat.initial_emotion && (
            <span className="bg-primary/20 text-primary px-2 py-1 rounded-full">
              {chat.initial_emotion}
            </span>
          )}
          {chat.notes?.follow_up_needed && (
            <span className="bg-destructive/20 text-destructive px-2 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Acompanhamento necessário
            </span>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(chat.created_at)}
          </div>
          <span>{messages.length} mensagens</span>
        </div>
      </div>

      {/* Psychologist Notes */}
      {chat.notes && (
        <div className="p-4 bg-card border-b border-border">
          <div className="flex items-center gap-2 text-primary font-medium mb-3">
            <FileText className="w-4 h-4" />
            Notas do Atendimento
          </div>
          <div className="space-y-2 text-sm">
            {chat.notes.emotional_state && (
              <div>
                <span className="font-medium text-foreground">Estado Emocional:</span>{" "}
                <span className="text-muted-foreground">{chat.notes.emotional_state}</span>
              </div>
            )}
            {chat.notes.summary && (
              <div>
                <span className="font-medium text-foreground">Resumo:</span>{" "}
                <span className="text-muted-foreground">{chat.notes.summary}</span>
              </div>
            )}
            {chat.notes.recommendations && (
              <div>
                <span className="font-medium text-foreground">Recomendações:</span>{" "}
                <span className="text-muted-foreground">{chat.notes.recommendations}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma mensagem nesta conversa.
          </div>
        ) : (
          messages.map((msg) => {
            // For psychologist viewing history: AI and psychologist on left, patient on right
            const isOwn = msg.sender_type === "psychologist" || msg.sender_type === "ai";
            
            return (
              <ChatMessage
                key={msg.id}
                type={msg.sender_type}
                message={msg.content}
                isOwn={isOwn}
                time={new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatView;
