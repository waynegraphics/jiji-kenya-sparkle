
-- Create blog storage bucket for thumbnails and content images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view blog images (public bucket)
CREATE POLICY "Anyone can view blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog');

-- Admins can upload blog images
CREATE POLICY "Admins can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog' AND is_admin(auth.uid()));

-- Admins can update blog images
CREATE POLICY "Admins can update blog images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'blog' AND is_admin(auth.uid()));

-- Admins can delete blog images
CREATE POLICY "Admins can delete blog images" ON storage.objects
  FOR DELETE USING (bucket_id = 'blog' AND is_admin(auth.uid()));
