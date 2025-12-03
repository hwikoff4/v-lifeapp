-- Create storage bucket for exercise images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercise-images', 'exercise-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for exercise images bucket
CREATE POLICY "Exercise images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-images');

CREATE POLICY "Authenticated users can upload exercise images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exercise-images' 
  AND auth.role() = 'authenticated'
);
