-- Create table for psychologist notes about patients
CREATE TABLE public.psychologist_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  summary TEXT,
  emotional_state TEXT,
  recommendations TEXT,
  follow_up_needed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chat_id)
);

-- Enable Row Level Security
ALTER TABLE public.psychologist_notes ENABLE ROW LEVEL SECURITY;

-- Psychologists can create notes for their chats
CREATE POLICY "Psychologists can create notes for their chats"
ON public.psychologist_notes
FOR INSERT
WITH CHECK (
  auth.uid() = psychologist_id AND
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = psychologist_notes.chat_id 
    AND chats.psychologist_id = auth.uid()
  )
);

-- Psychologists can view their own notes
CREATE POLICY "Psychologists can view their own notes"
ON public.psychologist_notes
FOR SELECT
USING (auth.uid() = psychologist_id);

-- Psychologists can update their own notes
CREATE POLICY "Psychologists can update their own notes"
ON public.psychologist_notes
FOR UPDATE
USING (auth.uid() = psychologist_id);

-- Add trigger for updated_at
CREATE TRIGGER update_psychologist_notes_updated_at
  BEFORE UPDATE ON public.psychologist_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();