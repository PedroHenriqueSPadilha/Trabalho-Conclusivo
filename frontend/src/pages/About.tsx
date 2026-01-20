import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Phone, Heart, AlertTriangle } from "lucide-react";
import Logo from "@/components/Logo";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col p-6 animate-fade-in">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full">
        <Logo size="md" />

        <div className="w-full mt-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Sobre o Auxillium
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Um espaço seguro e acolhedor para cuidar da sua saúde mental, 
              conectando você a profissionais e recursos de apoio psicológico.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Anonimato Garantido</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Você pode usar o aplicativo de forma completamente anônima, 
                    sem necessidade de cadastro ou identificação.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Segurança e Confidencialidade</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Todas as conversas são protegidas e tratadas com total sigilo 
                    por profissionais qualificados.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Apoio Humanizado</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Combinamos tecnologia e empatia para oferecer suporte 
                    acolhedor em momentos difíceis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground leading-relaxed">
                <strong>Importante:</strong> Este aplicativo não substitui atendimento 
                psicológico ou psiquiátrico presencial. Em casos de emergência, 
                procure ajuda profissional imediatamente.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-primary" />
              Contatos de Emergência
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">CVV - Centro de Valorização da Vida</span>
                <span className="font-semibold text-primary">188</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">SAMU</span>
                <span className="font-semibold text-primary">192</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Bombeiros</span>
                <span className="font-semibold text-primary">193</span>
              </div>
            </div>
          </div>

          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
