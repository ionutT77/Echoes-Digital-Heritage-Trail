-- Create location_requests table for user submissions
CREATE TABLE IF NOT EXISTS location_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Location Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  category VARCHAR(100),
  historical_period VARCHAR(100),
  
  -- Contact Information
  submitter_name VARCHAR(255) NOT NULL,
  submitter_email VARCHAR(255) NOT NULL,
  submitter_phone VARCHAR(50) NOT NULL,
  
  -- Media URLs (stored in Supabase Storage)
  photos JSONB DEFAULT '[]'::jsonb, -- Array of photo URLs
  audio_url TEXT,
  audio_description TEXT, -- Description for AI audio generation (8-10 sentences)
  
  -- Request Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_location_requests_user_id ON location_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_location_requests_status ON location_requests(status);
CREATE INDEX IF NOT EXISTS idx_location_requests_created_at ON location_requests(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE location_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON location_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can create requests
CREATE POLICY "Authenticated users can create requests"
  ON location_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending requests
CREATE POLICY "Users can update own pending requests"
  ON location_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON location_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can update all requests
CREATE POLICY "Admins can update all requests"
  ON location_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create storage bucket for location request photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('location-requests', 'location-requests', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Authenticated users can upload
CREATE POLICY "Authenticated users can upload location request files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'location-requests' 
    AND auth.role() = 'authenticated'
  );

-- Storage policy: Anyone can view public files
CREATE POLICY "Anyone can view location request files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'location-requests');

-- Storage policy: Users can delete their own files
CREATE POLICY "Users can delete own location request files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'location-requests' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_location_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
CREATE TRIGGER update_location_requests_updated_at
  BEFORE UPDATE ON location_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_location_request_timestamp();
