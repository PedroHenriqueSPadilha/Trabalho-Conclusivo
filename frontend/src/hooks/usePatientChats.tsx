import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Database } from "@/integrations/supabase/types";

type Chat = Database["public"]["Tables"]["chats"]["Row"];

export const usePatientChats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("patient_id", user.id)
        .in("status", ["waiting", "active"])
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching patient chats:", error);
      } else {
        setChats(data || []);
      }
      setLoading(false);
    };

    fetchChats();

    // Subscribe to chat updates
    const channel = supabase
      .channel("patient-chats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
          filter: `patient_id=eq.${user.id}`,
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { chats, loading };
};
