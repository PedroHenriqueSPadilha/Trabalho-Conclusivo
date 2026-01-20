import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Clock, Loader2, LogOut, XCircle } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("id");
  const { user, userRole, signOut } = useAuth();
  const { chat, messages, loading, aiLoading, sendMessage, sendUserMessage } = useChat(chatId || undefined);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const isWaiting = chat?.status === "waiting";
  const isPsychologist = userRole === "psychologist";

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId) return;

    setSending(true);
    let success: boolean;
    
    if (isPsychologist) {
      // Psychologist uses sendMessage with "psychologist" type
      success = await sendMessage(chatId, message.trim(), "psychologist");
    } else {
      // Patient uses sendUserMessage which triggers AI response if waiting
      success = await sendUserMessage(chatId, message.trim());
    }
    
    setSending(false);

    if (success) {
      setMessage("");
    }
  };

  const handleEndChat = () => {
    navigate(`/feedback?chatId=${chatId}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(isPsychologist ? "/psychologist-dashboard" : "/service-choice")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">Atendimento</h1>
            <p className="text-xs text-primary">Conversa segura e anônima</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Waiting indicator */}
      {isWaiting && !isPsychologist && (
        <div className="flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary text-sm">
          <Clock className="w-4 h-4 animate-pulse-soft" />
          Aguardando um profissional...
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              // Determine if message is from current user's "side"
              // For psychologist: AI and psychologist messages are on their side (left), patient on right
              // For patient: only their own messages are on their side (left), AI and psychologist on right
              const isOwn = isPsychologist 
                ? (msg.sender_type === "psychologist" || msg.sender_type === "ai")
                : msg.sender_type === "user";
              
              return (
                <ChatMessage
                  key={msg.id}
                  type={msg.sender_type as "user" | "ai" | "psychologist"}
                  message={msg.content}
                  isOwn={isOwn}
                  time={new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              );
            })}
            {aiLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assistente está digitando...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            onClick={handleEndChat}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            title="Encerrar conversa"
          >
            <XCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Encerrar</span>
          </button>
          <Input
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            className="flex-1"
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || !message.trim()}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-glow disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
