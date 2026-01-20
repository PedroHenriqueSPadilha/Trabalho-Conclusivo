import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mail, Lock, UserRound, Stethoscope, FileText, Loader2, User } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const baseSchema = {
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
};

const patientSchema = z.object(baseSchema).refine(
  (data) => data.password === data.confirmPassword,
  { message: "As senhas não coincidem", path: ["confirmPassword"] }
);

const psychologistSchema = z.object({
  ...baseSchema,
  crp: z.string().min(5, "CRP inválido"),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: "As senhas não coincidem", path: ["confirmPassword"] }
);

const Register = () => {
  const navigate = useNavigate();
  const { userType } = useParams<{ userType: "patient" | "psychologist" }>();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [crp, setCrp] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPatient = userType === "patient";
  const title = isPatient ? "Cadastro de Paciente" : "Cadastro de Psicólogo";
  const Icon = isPatient ? UserRound : Stethoscope;

  const handleRegister = async () => {
    setErrors({});

    if (!acceptTerms) {
      toast.error("Você precisa aceitar os termos de uso");
      return;
    }

    const data = isPatient
      ? { email, password, confirmPassword, fullName }
      : { email, password, confirmPassword, fullName, crp };

    const schema = isPatient ? patientSchema : psychologistSchema;
    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signUp(
      email,
      password,
      userType as "patient" | "psychologist",
      fullName,
      crp || undefined
    );
    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este e-mail já está cadastrado");
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
      return;
    }

    toast.success("Conta criada com sucesso!");
    navigate(isPatient ? "/service-choice" : "/psychologist-dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col p-6 animate-fade-in">
      <button
        onClick={() => navigate(`/login/${userType}`)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <Logo size="sm" />

        <div className="w-full mt-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Icon className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            </div>
            <p className="text-muted-foreground">
              {isPatient 
                ? "Crie sua conta para um atendimento personalizado."
                : "Cadastre-se para oferecer apoio psicológico."
              }
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-12"
                  disabled={loading}
                />
              </div>
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {!isPatient && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">CRP</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="00/00000"
                    value={crp}
                    onChange={(e) => setCrp(e.target.value)}
                    className="pl-12"
                    disabled={loading}
                  />
                </div>
                {errors.crp && <p className="text-sm text-destructive">{errors.crp}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12"
                  disabled={loading}
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12"
                  disabled={loading}
                />
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-1"
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                Li e aceito os{" "}
                <button className="text-primary hover:underline">Termos de Uso</button>
                {" "}e a{" "}
                <button className="text-primary hover:underline">Política de Privacidade</button>
              </label>
            </div>

            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Conta"}
            </Button>

            {isPatient && (
              <p className="text-center text-sm text-muted-foreground">
                Prefere não se cadastrar?{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => navigate("/emotional-state")}
                  disabled={loading}
                >
                  Continue anonimamente
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
