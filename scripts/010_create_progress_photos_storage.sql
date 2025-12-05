-- Create a dedicated bucket for private progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Allow users to read only their own photos
CREATE POLICY "Users can view their progress photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'progress-photos'
  AND auth.uid() = owner
);

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Users can upload progress photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'progress-photos'
  AND auth.uid() = owner
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their progress photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'progress-photos'
  AND auth.uid() = owner
);

