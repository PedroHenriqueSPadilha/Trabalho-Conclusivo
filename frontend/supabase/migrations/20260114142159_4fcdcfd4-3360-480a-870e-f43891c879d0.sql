-- Update RLS policy to allow psychologists to see profiles of ALL their chats (including completed)
DROP POLICY IF EXISTS "Psychologists can view patient profiles in their chats" ON public.profiles;

CREATE POLICY "Psychologists can view patient profiles in their chats" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'psychologist'::app_role) AND 
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.patient_id = profiles.user_id 
    AND chats.psychologist_id = auth.uid()
  )
);

-- Also update chats RLS to allow psychologists to view all their completed chats
DROP POLICY IF EXISTS "Psychologists can view waiting and their assigned chats" ON public.chats;

CREATE POLICY "Psychologists can view waiting and assigned chats" 
ON public.chats 
FOR SELECT 
USING (
  has_role(auth.uid(), 'psychologist'::app_role) AND 
  (
    status = 'waiting'::chat_status OR 
    psychologist_id = auth.uid()
  )
);