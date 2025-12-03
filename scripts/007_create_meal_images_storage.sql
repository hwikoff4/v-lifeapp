-- Create Supabase Storage bucket for meal images
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public access to meal images
CREATE POLICY "Public Access for Meal Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'meal-images');

-- Create policy to allow authenticated users to upload meal images
CREATE POLICY "Authenticated users can upload meal images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'meal-images' AND auth.role() = 'authenticated');
