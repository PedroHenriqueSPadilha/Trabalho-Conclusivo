import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserRound, Stethoscope, Info, Sparkles, Heart } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const Welcome = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  // Redirect logged in users to appropriate dashboard
  useEffect(() => {
    // Wait until loading is complete AND we have both user and role info
    if (loading) return;
    
    if (user && userRole) {
      if (userRole === "psychologist") {
        navigate("/psychologist-dashboard");
      } else {
        navigate("/patient-dashboard");
      }
    }
  }, [user, userRole, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background via-background to-card/30">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        <div className="animate-fade-in">
          <Logo size="lg" />
        </div>
        
        <div className="text-center space-y-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Você não está <span className="text-gradient">sozinho</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Um espaço seguro e acolhedor para cuidar da sua saúde mental
          </p>
        </div>

        <div className="w-full space-y-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center font-medium">Sou paciente</p>
            <Button
              variant="gradient"
              size="lg"
              className="w-full h-14 text-base shadow-glow hover:shadow-[0_0_50px_hsl(174_62%_55%/0.35)] transition-all duration-500 group"
              onClick={() => navigate("/login/patient")}
            >
              <UserRound className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Entrar como Paciente
              <Sparkles className="w-4 h-4 ml-2 opacity-60" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate("/emotional-state")}
            >
              Entrar Anonimamente
            </Button>
          </div>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-6 text-sm text-muted-foreground font-medium">ou</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center font-medium">Sou psicólogo</p>
            <Button
              variant="secondary"
              size="lg"
              className="w-full h-12 hover:bg-secondary/80 transition-all duration-300 group"
              onClick={() => navigate("/login/psychologist")}
            >
              <Stethoscope className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Entrar como Psicólogo
            </Button>
          </div>
        </div>

        <button
          onClick={() => navigate("/about")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300 animate-slide-up group"
          style={{ animationDelay: "0.6s" }}
        >
          <Info className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="group-hover:underline">Sobre o aplicativo</span>
        </button>
      </div>
    </div>
  );
};

export default Welcome;
