import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePatientChats } from "@/hooks/usePatientChats";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import {
  MessageCircle,
  Clock,
  Loader2,
  LogOut,
  User,
  Calendar,
  TrendingUp,
  Play,
  Sparkles,
  Heart,
} from "lucide-react";

interface PsychologistInfo {
  id: string;
  name: string;
  lastSessionDate: string;
  sessionCount: number;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { chats, loading: chatsLoading } = usePatientChats();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [psychologists, setPsychologists] = useState<PsychologistInfo[]>([]);
  const [weeklySessionCount, setWeeklySessionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    // Fetch user profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    setProfile(profileData);

    // Fetch completed chats for this patient
    const { data: completedChats } = await supabase
      .from("chats")
      .select("id, psychologist_id, updated_at")
      .eq("patient_id", user.id)
      .eq("status", "completed")
      .order("updated_at", { ascending: false });

    if (completedChats && completedChats.length > 0) {
      // Get unique psychologist IDs
      const psychologistIds = [...new Set(completedChats.filter(c => c.psychologist_id).map(c => c.psychologist_id))];

      if (psychologistIds.length > 0) {
        // Fetch psychologist profiles
        const { data: psychologistProfiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", psychologistIds);

        // Build psychologist info
        const psychologistMap: { [key: string]: PsychologistInfo } = {};
        
        completedChats.forEach(chat => {
          if (!chat.psychologist_id) return;
          
          if (!psychologistMap[chat.psychologist_id]) {
            const profile = psychologistProfiles?.find(p => p.user_id === chat.psychologist_id);
            psychologistMap[chat.psychologist_id] = {
              id: chat.psychologist_id,
              name: profile?.full_name || "Psicólogo",
              lastSessionDate: chat.updated_at,
              sessionCount: 0,
            };
          }
          psychologistMap[chat.psychologist_id].sessionCount++;
        });

        setPsychologists(Object.values(psychologistMap).slice(0, 3)); // Show last 3
      }

      // Calculate weekly sessions
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklySessions = completedChats.filter(
        chat => new Date(chat.updated_at) >= oneWeekAgo
      ).length;
      
      setWeeklySessionCount(weeklySessions);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const activeChats = chats.filter(
    (chat) => chat.status === "active" || chat.status === "waiting"
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Get patient name from profile or user metadata
  const patientName = profile?.full_name || user?.user_metadata?.full_name || "Paciente";

  if (loading || chatsLoading) {
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
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-border/50 bg-card/30 backdrop-blur-md">
        <Logo size="sm" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-300 active:scale-95"
        >
          <LogOut className="w-5 h-5 transition-transform hover:rotate-12" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </header>

      <div className="relative z-10 flex-1 p-6 max-w-md mx-auto w-full space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto shadow-glow animate-float">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg animate-bounce-in" style={{ animationDelay: "0.3s" }}>
              <Heart className="w-4 h-4 text-accent-foreground" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              Olá, <span className="text-gradient">{patientName.split(" ")[0]}</span>!
            </h1>
            <p className="text-muted-foreground">
              Como você está se sentindo hoje?
            </p>
          </div>
        </div>

        {/* Start Session Button */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <Button
            variant="gradient"
            size="lg"
            className="w-full py-7 text-lg shadow-glow animate-glow-pulse hover:animate-none hover:shadow-[0_0_50px_hsl(174_62%_55%/0.35)] transition-all duration-500 group"
            onClick={() => navigate("/emotional-state")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 group-hover:rotate-12 transition-all duration-300">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="group-hover:tracking-wide transition-all duration-300">Iniciar Atendimento</span>
              <Sparkles className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300" />
            </div>
          </Button>
        </div>

        {/* Active Chats */}
        {activeChats.length > 0 && (
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              Conversas em Andamento
            </h2>
            <div className="space-y-2">
              {activeChats.map((chat, index) => (
                <button
                  key={chat.id}
                  onClick={() => navigate(`/chat?id=${chat.id}`)}
                  className="w-full p-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-all duration-300 text-left flex items-center gap-4 group hover:shadow-glow hover:-translate-y-1 active:scale-[0.98] active:translate-y-0"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <MessageCircle className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {chat.initial_emotion || "Conversa"}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {chat.status === "waiting"
                          ? "Aguardando psicólogo"
                          : "Em andamento"}
                      </span>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${chat.status === "waiting" ? "bg-yellow-500 animate-pulse" : "bg-accent"} group-hover:scale-125 transition-transform`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Stats */}
        <div 
          className="p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm shadow-card animate-slide-up hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-default"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center animate-float">
              <TrendingUp className="w-7 h-7 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">
                {weeklySessionCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {weeklySessionCount === 1
                  ? "atendimento esta semana"
                  : "atendimentos esta semana"}
              </p>
            </div>
          </div>
        </div>

        {/* Last Psychologists */}
        {psychologists.length > 0 && (
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-secondary">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              Últimos Psicólogos
            </h2>
            <div className="space-y-2">
              {psychologists.map((psychologist, index) => (
                <div
                  key={psychologist.id}
                  className="p-4 rounded-2xl bg-card/50 border border-border/50 flex items-center gap-4 hover:bg-card/80 transition-all duration-300"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {psychologist.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Último: {formatDate(psychologist.lastSessionDate)}</span>
                      <span className="text-border">•</span>
                      <span>
                        {psychologist.sessionCount}{" "}
                        {psychologist.sessionCount === 1 ? "sessão" : "sessões"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for new users */}
        {psychologists.length === 0 && activeChats.length === 0 && (
          <div 
            className="text-center py-8 px-6 rounded-2xl bg-card/30 border border-border/30 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground font-medium">
              Você ainda não realizou nenhum atendimento.
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Clique em "Iniciar Atendimento" para começar sua jornada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
