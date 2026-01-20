import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Clock, LogOut, Settings, Loader2, History, Sparkles, Stethoscope } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useWaitingChats, useChat } from "@/hooks/useChat";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const PsychologistDashboard = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { chats, loading } = useWaitingChats();
  const { acceptChat } = useChat();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleAcceptChat = async (chatId: string) => {
    const success = await acceptChat(chatId);
    if (success) {
      navigate(`/chat?id=${chatId}`);
    }
  };

  const waitingChats = chats.filter((c) => c.status === "waiting");
  const activeChats = chats.filter((c) => c.status === "active");
  const todayChats = chats.filter(
    (c) => new Date(c.created_at).toDateString() === new Date().toDateString()
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-card/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-card/30">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-border/50 bg-card/30 backdrop-blur-md">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate("/chat-history")}
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-300"
            title="Histórico de conversas"
          >
            <History className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-300">
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto shadow-glow">
                <Stethoscope className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                Painel do <span className="text-gradient">Psicólogo</span>
              </h1>
              <p className="text-muted-foreground">
                Gerencie seus atendimentos e ajude quem precisa
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1 transition-all duration-300 group cursor-default active:scale-100">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{waitingChats.length}</p>
              <p className="text-xs text-muted-foreground">Aguardando</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1 transition-all duration-300 group cursor-default active:scale-100">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <MessageSquare className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-bold text-foreground">{activeChats.length}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1 transition-all duration-300 group cursor-default active:scale-100">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{todayChats.length}</p>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </div>
          </div>

          {/* Patient Queue */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Users className="w-4 h-4 text-primary" />
              </div>
              Fila de Atendimento
            </h2>
            {chats.length === 0 ? (
              <div className="p-10 rounded-2xl bg-card/30 border border-border/30 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground font-medium">
                  Nenhum paciente aguardando no momento
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Novos atendimentos aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {chats.map((chat, index) => (
                  <div
                    key={chat.id}
                    className="p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm flex items-center justify-between hover:bg-card/80 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group"
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            chat.status === "active"
                              ? "bg-accent"
                              : "bg-primary"
                          }`}
                        />
                        {chat.status === "waiting" && (
                          <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-50" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          Paciente Anônimo
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Sentimento: <span className="text-primary">{chat.initial_emotion || "Não informado"}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                      {chat.status === "waiting" && (
                        <Button
                          variant="gradient"
                          size="sm"
                          className="shadow-glow hover:shadow-[0_0_30px_hsl(174_62%_55%/0.3)] transition-all duration-300"
                          onClick={() => handleAcceptChat(chat.id)}
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          Atender
                        </Button>
                      )}
                      {chat.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/50 hover:bg-primary/10 transition-all duration-300"
                          onClick={() => navigate(`/chat?id=${chat.id}`)}
                        >
                          Continuar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologistDashboard;
