import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useFeedback = () => {
  const { user } = useAuth();

  const submitFeedback = async (chatId: string, rating: number, comment?: string): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para enviar feedback");
      return false;
    }

    const { error } = await supabase.from("feedback").insert({
      chat_id: chatId,
      user_id: user.id,
      rating,
      comment: comment || null,
    });

    if (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Erro ao enviar feedback");
      return false;
    }

    toast.success("Feedback enviado com sucesso!");
    return true;
  };

  return { submitFeedback };
};
