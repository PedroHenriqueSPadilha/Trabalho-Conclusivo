import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Lock, UserRound, Stethoscope, Loader2, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const Login = () => {
  const navigate = useNavigate();
  const { userType } = useParams<{ userType: "patient" | "psychologist" }>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const isPatient = userType === "patient";
  const title = isPatient ? "Área do Paciente" : "Área do Psicólogo";
  const Icon = isPatient ? UserRound : Stethoscope;

  const handleLogin = async () => {
    setErrors({});
    
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setLoading(false);
      if (error.message.includes("Invalid login credentials")) {
        toast.error("E-mail ou senha incorretos");
      } else {
        toast.error("Erro ao fazer login. Tente novamente.");
      }
      return;
    }

    // Verify user role matches the login area
    if (data.user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const userRole = roleData?.role;

      // Check if user role matches the expected type
      if (userType === "patient" && userRole === "psychologist") {
        await supabase.auth.signOut();
        setLoading(false);
        toast.error("Esta conta é de psicólogo. Use a área do psicólogo para entrar.");
        return;
      }

      if (userType === "psychologist" && userRole === "patient") {
        await supabase.auth.signOut();
        setLoading(false);
        toast.error("Esta conta é de paciente. Use a área do paciente para entrar.");
        return;
      }
    }

    toast.success("Login realizado com sucesso!");
    
    // Navigate based on the verified role
    if (userType === "psychologist") {
      navigate("/psychologist-dashboard");
    } else {
      navigate("/patient-dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-background via-background to-card/30">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
      </div>

      <button
        onClick={() => navigate("/")}
        className="relative z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        Voltar
      </button>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="animate-fade-in">
          <Logo size="sm" />
        </div>

        <div className="w-full mt-8 space-y-6">
          <div className="text-center space-y-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-glow">
                <Icon className="w-7 h-7 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground">
              Faça login para continuar
            </p>
          </div>

          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-card/50 border-border/50 focus:border-primary focus:bg-card transition-all duration-300"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive animate-fade-in">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 bg-card/50 border-border/50 focus:border-primary focus:bg-card transition-all duration-300"
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive animate-fade-in">{errors.password}</p>
              )}
            </div>

            <button className="text-sm text-primary hover:text-primary/80 transition-colors hover:underline">
              Esqueceu sua senha?
            </button>

            <Button
              variant="gradient"
              size="lg"
              className="w-full h-12 shadow-glow hover:shadow-[0_0_40px_hsl(174_62%_55%/0.3)] transition-all duration-300"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Entrar
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate(`/register/${userType}`)}
              disabled={loading}
            >
              Criar conta
            </Button>

            {isPatient && (
              <Button
                variant="ghost"
                className="w-full h-11 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => navigate("/emotional-state")}
                disabled={loading}
              >
                Continuar anonimamente
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
