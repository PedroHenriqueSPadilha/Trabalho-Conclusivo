import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserX, UserCheck, Shield, Lock, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const ServiceChoice = () => {
  const navigate = useNavigate();
  const { user, loading, userRole } = useAuth();

  // If user is logged in as a non-anonymous patient, redirect to patient dashboard
  useEffect(() => {
    if (!loading && user) {
      const isAnonymous = user.user_metadata?.is_anonymous === true;
      if (userRole === "patient" && !isAnonymous) {
        navigate("/patient-dashboard", { replace: true });
      }
    }
  }, [user, loading, userRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <Logo size="sm" />

        <div className="w-full mt-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Como deseja ser atendido?
            </h1>
            <p className="text-muted-foreground">
              Escolha a opção que te deixa mais confortável
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/emotional-state")}
              className="w-full p-6 rounded-xl border-2 border-border bg-card hover:border-primary transition-all duration-300 text-left space-y-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Atendimento Anônimo
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sua identidade permanece completamente oculta. Não coletamos nenhum dado pessoal.
              </p>
              <div className="flex items-center gap-2 text-xs text-primary">
                <Shield className="w-4 h-4" />
                100% anônimo e seguro
              </div>
            </button>

            <button
              onClick={() => navigate("/login/patient")}
              className="w-full p-6 rounded-xl border-2 border-border bg-card hover:border-primary transition-all duration-300 text-left space-y-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Atendimento com Cadastro
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mantenha um histórico das suas conversas e receba acompanhamento personalizado.
              </p>
              <div className="flex items-center gap-2 text-xs text-accent">
                <Lock className="w-4 h-4" />
                Dados protegidos e criptografados
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceChoice;

