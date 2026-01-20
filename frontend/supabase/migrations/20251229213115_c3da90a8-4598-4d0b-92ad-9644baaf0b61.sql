-- Drop and recreate the messages insert policy to allow AI messages and system messages
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON public.messages;

CREATE POLICY "Users can insert messages in their chats"
ON public.messages
FOR INSERT
WITH CHECK (
  (
    -- User sending their own message
    (auth.uid() = sender_id) AND 
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id 
      AND (chats.patient_id = auth.uid() OR chats.psychologist_id = auth.uid())
    )
  )
  OR
  (
    -- AI messages (sender_id is null)
    sender_id IS NULL AND sender_type = 'ai' AND
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id 
      AND (chats.patient_id = auth.uid() OR chats.psychologist_id = auth.uid())
    )
  )
);