import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import EmotionButton from "@/components/EmotionButton";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const emotions = [
  { emoji: "😰", label: "Ansioso" },
  { emoji: "😢", label: "Triste" },
  { emoji: "😩", label: "Sobrecarregado" },
  { emoji: "😕", label: "Confuso" },
  { emoji: "😔", label: "Desanimado" },
  { emoji: "😤", label: "Irritado" },
  { emoji: "😶", label: "Vazio" },
  { emoji: "🙂", label: "Tranquilo" },
];

const EmotionalState = () => {
  const navigate = useNavigate();
  const { user, signInAnonymously } = useAuth();
  const { createChat } = useChat();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedEmotion) {
      toast.error("Por favor, selecione como você está se sentindo");
      return;
    }

    setLoading(true);

    try {
      // If user is not logged in, create anonymous session
      if (!user) {
        const { error } = await signInAnonymously();
        if (error) {
          toast.error("Erro ao iniciar sessão anônima");
          setLoading(false);
          return;
        }
        // Wait a bit for auth state to update
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Create chat
      const chatId = await createChat(selectedEmotion, freeText || undefined);
      
      if (chatId) {
        navigate(`/chat?id=${chatId}`);
      } else {
        toast.error("Erro ao iniciar conversa");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao iniciar conversa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Como você está se sentindo hoje?
          </h1>
          <p className="text-muted-foreground">
            Não existe resposta certa ou errada. Estamos aqui para te ouvir.
          </p>
        </div>

        <div className="w-full space-y-6">
          <div className="grid grid-cols-4 gap-3">
            {emotions.map((emotion) => (
              <EmotionButton
                key={emotion.label}
                emoji={emotion.emoji}
                label={emotion.label}
                selected={selectedEmotion === emotion.label}
                onClick={() => setSelectedEmotion(emotion.label)}
              />
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Quer contar mais sobre como está se sentindo? (opcional)
            </label>
            <Textarea
              placeholder="Escreva aqui o que estiver no seu coração..."
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              className="min-h-[120px] bg-input border-2 border-border focus:border-primary resize-none"
              disabled={loading}
            />
          </div>

          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={handleContinue}
            disabled={!selectedEmotion || loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmotionalState;
