import { cn } from "@/lib/utils";
import { Bot, User, UserCheck } from "lucide-react";

interface ChatMessageProps {
  type: "user" | "ai" | "psychologist";
  message: string;
  time?: string;
  isOwn?: boolean; // true if the current user sent this message
}

const ChatMessage = ({ type, message, time, isOwn = false }: ChatMessageProps) => {
  const avatarConfig = {
    user: { icon: User, bg: "bg-secondary" },
    ai: { icon: Bot, bg: "bg-primary/20" },
    psychologist: { icon: UserCheck, bg: "bg-accent/20" },
  };

  const config = avatarConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("flex gap-3", !isOwn && "flex-row-reverse")}>
      <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", config.bg)}>
        <Icon className={cn("w-5 h-5", !isOwn ? "text-foreground" : "text-primary")} />
      </div>
      <div className={cn("flex flex-col gap-1 max-w-[75%]", !isOwn && "items-end")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tl-sm"
              : "bg-card border border-border text-foreground rounded-tr-sm"
          )}
        >
          {message}
        </div>
        {time && (
          <span className="text-xs text-muted-foreground">{time}</span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
