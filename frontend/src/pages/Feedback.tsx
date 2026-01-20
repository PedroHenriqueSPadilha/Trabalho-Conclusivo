import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, Loader2, ClipboardList, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import RatingStars from "@/components/RatingStars";
import Logo from "@/components/Logo";
import { useFeedback } from "@/hooks/useFeedback";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Feedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chatId");
  const { userRole, user } = useAuth();
  const { submitFeedback } = useFeedback();
  const { endChat, chat } = useChat(chatId || undefined);
  
  // Patient feedback state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  
  // Psychologist notes state
  const [summary, setSummary] = useState("");
  const [emotionalState, setEmotionalState] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const isPsychologist = userRole === "psychologist";

  // Patient feedback submission
  const handlePatientSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor, selecione uma avaliação");
      return;
    }

    if (!chatId) {
      navigate("/");
      return;
    }

    setLoading(true);
    
    await endChat(chatId);
    const success = await submitFeedback(chatId, rating, comment || undefined);
    
    setLoading(false);

    if (success) {
      navigate("/");
    }
  };

  // Psychologist notes submission
  const handlePsychologistSubmit = async () => {
    if (!chatId || !user || !chat) {
      navigate("/psychologist-dashboard");
      return;
    }

    setLoading(true);
    
    // End the chat first
    await endChat(chatId);
    
    // Submit psychologist notes
    const { error } = await supabase
      .from("psychologist_notes")
      .insert({
        chat_id: chatId,
        psychologist_id: user.id,
        patient_id: chat.patient_id,
        summary: summary || null,
        emotional_state: emotionalState || null,
        recommendations: recommendations || null,
        follow_up_needed: followUpNeeded,
      });
    
    setLoading(false);

    if (error) {
      console.error("Error submitting notes:", error);
      toast.error("Erro ao salvar notas");
      return;
    }

    toast.success("Notas salvas com sucesso");
    navigate("/psychologist-dashboard");
  };

  const handleSkip = async () => {
    if (chatId) {
      await endChat(chatId);
    }
    navigate(isPsychologist ? "/psychologist-dashboard" : "/");
  };

  // Psychologist feedback form
  if (isPsychologist) {
    return (
      <div className="min-h-screen flex flex-col p-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <Logo size="sm" />

          <div className="w-full mt-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Notas do Atendimento
              </h1>
              <p className="text-muted-foreground">
                Registre suas observações sobre o paciente
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emotionalState">Estado Emocional Observado</Label>
                <Input
                  id="emotionalState"
                  placeholder="Ex: Ansioso, triste, confuso..."
                  value={emotionalState}
                  onChange={(e) => setEmotionalState(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Resumo da Conversa</Label>
                <Textarea
                  id="summary"
                  placeholder="Descreva os principais pontos abordados..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Recomendações</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Orientações para acompanhamento..."
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="min-h-[80px] resize-none"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <div>
                    <Label htmlFor="followUp" className="cursor-pointer">Necessita Acompanhamento</Label>
                    <p className="text-xs text-muted-foreground">Marcar para follow-up futuro</p>
                  </div>
                </div>
                <Switch
                  id="followUp"
                  checked={followUpNeeded}
                  onCheckedChange={setFollowUpNeeded}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={handlePsychologistSubmit}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Notas"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleSkip}
                disabled={loading}
              >
                Pular
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Patient feedback form (original)
  return (
    <div className="min-h-screen flex flex-col p-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <Logo size="sm" />

        <div className="w-full mt-8 space-y-8 text-center">
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Como foi sua experiência?
            </h1>
            <p className="text-muted-foreground">
              Sua opinião nos ajuda a melhorar o atendimento
            </p>
          </div>

          <div className="flex justify-center">
            <RatingStars rating={rating} onRate={setRating} />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-foreground">
              Gostaria de deixar um comentário? (opcional)
            </label>
            <Textarea
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] bg-input border-2 border-border focus:border-primary resize-none"
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handlePatientSubmit}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar Feedback"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleSkip}
              disabled={loading}
            >
              Pular
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
