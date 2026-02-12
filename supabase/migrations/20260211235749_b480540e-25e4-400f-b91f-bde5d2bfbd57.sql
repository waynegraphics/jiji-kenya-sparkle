
-- Add message type support for files, images, and voice notes
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_size integer;

-- Create messages storage bucket for file/image/voice uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('messages', 'messages', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for messages bucket
CREATE POLICY "Authenticated users can upload message files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'messages' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view message files"
ON storage.objects FOR SELECT
USING (bucket_id = 'messages');

CREATE POLICY "Users can delete their own message files"
ON storage.objects FOR DELETE
USING (bucket_id = 'messages' AND auth.uid()::text = (storage.foldername(name))[1]);
