import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Chat = Database["public"]["Tables"]["chats"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];
type SenderType = Database["public"]["Enums"]["sender_type"];
type ChatStatus = Database["public"]["Enums"]["chat_status"];

export const useChat = (chatId?: string) => {
  const { user, userRole } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch chat and messages
  useEffect(() => {
    if (!chatId || !user) {
      setLoading(false);
      return;
    }

    const fetchChatAndMessages = async () => {
      setLoading(true);

      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .maybeSingle();

      if (chatError) {
        console.error("Error fetching chat:", chatError);
        toast.error("Erro ao carregar conversa");
      } else {
        setChat(chatData);
      }

      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
      } else {
        setMessages(messagesData || []);
      }

      setLoading(false);
    };

    fetchChatAndMessages();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`messages-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    // Subscribe to chat status updates
    const chatChannel = supabase
      .channel(`chat-status-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chats",
          filter: `id=eq.${chatId}`,
        },
        (payload) => {
          setChat(payload.new as Chat);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [chatId, user]);

  const createChat = async (initialEmotion: string, initialMessage?: string): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("chats")
      .insert({
        patient_id: user.id,
        initial_emotion: initialEmotion,
        initial_message: initialMessage || null,
        status: "waiting" as ChatStatus,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      toast.error("Erro ao iniciar conversa");
      return null;
    }

    // Create AI welcome message
    await sendMessage(data.id, "Olá! Sou o assistente virtual do Auxillium. Estou aqui para te acolher enquanto você aguarda um profissional. Como posso te ajudar agora?", "ai");

    return data.id;
  };

  const sendMessage = async (targetChatId: string, content: string, senderType: SenderType): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase.from("messages").insert({
      chat_id: targetChatId,
      sender_id: senderType === "ai" ? null : user.id,
      sender_type: senderType,
      content,
    });

    if (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
      return false;
    }

    return true;
  };

  // Get AI response when chat is in waiting status
  const getAiResponse = useCallback(async (targetChatId: string, userMessage: string) => {
    if (!chat || chat.status !== "waiting") return;

    setAiLoading(true);
    try {
      // Build conversation history for AI
      const conversationHistory = messages
        .filter(m => m.sender_type !== "psychologist")
        .map(m => ({
          role: m.sender_type === "user" ? "user" as const : "assistant" as const,
          content: m.content,
        }));

      // Add the new user message
      conversationHistory.push({ role: "user", content: userMessage });

      const response = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: conversationHistory,
          initialEmotion: chat.initial_emotion,
          initialMessage: chat.initial_message,
        },
      });

      if (response.error) {
        console.error("AI response error:", response.error);
        return;
      }

      const aiMessage = response.data?.message;
      if (aiMessage) {
        await sendMessage(targetChatId, aiMessage, "ai");
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setAiLoading(false);
    }
  }, [chat, messages]);

  const sendUserMessage = async (targetChatId: string, content: string): Promise<boolean> => {
    const success = await sendMessage(targetChatId, content, "user");
    
    // Only get AI response if chat is in waiting status (no psychologist yet)
    if (success && chat?.status === "waiting") {
      // Small delay to allow the message to be stored
      setTimeout(() => {
        getAiResponse(targetChatId, content);
      }, 500);
    }

    return success;
  };

  const acceptChat = async (targetChatId: string): Promise<boolean> => {
    if (!user || userRole !== "psychologist") return false;

    const { error } = await supabase
      .from("chats")
      .update({
        psychologist_id: user.id,
        status: "active" as ChatStatus,
      })
      .eq("id", targetChatId);

    if (error) {
      console.error("Error accepting chat:", error);
      toast.error("Erro ao aceitar atendimento");
      return false;
    }

    // Notify patient that psychologist has joined
    await sendMessage(targetChatId, "Um psicólogo entrou na conversa. A partir de agora, você será atendido por um profissional.", "ai");

    toast.success("Atendimento iniciado!");
    return true;
  };

  const endChat = async (targetChatId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("chats")
      .update({ status: "completed" as ChatStatus })
      .eq("id", targetChatId);

    if (error) {
      console.error("Error ending chat:", error);
      toast.error("Erro ao encerrar conversa");
      return false;
    }

    return true;
  };

  return {
    chat,
    messages,
    loading,
    aiLoading,
    createChat,
    sendMessage,
    sendUserMessage,
    acceptChat,
    endChat,
  };
};

export const useWaitingChats = () => {
  const { user, userRole } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userRole !== "psychologist") {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .or(`status.eq.waiting,and(status.eq.active,psychologist_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching chats:", error);
      } else {
        setChats(data || []);
      }
      setLoading(false);
    };

    fetchChats();

    // Subscribe to chat updates
    const channel = supabase
      .channel("waiting-chats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  return { chats, loading };
};
