import { cn } from "@/lib/utils";

interface EmotionButtonProps {
  emoji: string;
  label: string;
  selected?: boolean;
  onClick: () => void;
}

const EmotionButton = ({ emoji, label, selected, onClick }: EmotionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
        selected
          ? "border-primary bg-primary/20 shadow-glow"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
      )}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
};

export default EmotionButton;
