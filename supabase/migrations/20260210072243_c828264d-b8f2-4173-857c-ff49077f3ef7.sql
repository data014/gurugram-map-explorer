
-- Create storage bucket for GeoJSON files
INSERT INTO storage.buckets (id, name, public)
VALUES ('geojson', 'geojson', true);

-- Allow public read access to geojson bucket
CREATE POLICY "Public read access for geojson"
ON storage.objects FOR SELECT
USING (bucket_id = 'geojson');

-- Allow authenticated uploads (admin)
CREATE POLICY "Authenticated upload for geojson"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'geojson' AND auth.role() = 'authenticated');
