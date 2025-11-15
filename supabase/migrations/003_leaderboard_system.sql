-- Add points column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create leaderboard view for easy querying
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  p.points,
  COUNT(DISTINCT ud.node_id) as discoveries_count,
  p.created_at
FROM profiles p
LEFT JOIN user_discoveries ud ON p.id = ud.user_id
GROUP BY p.id, p.username, p.points, p.created_at
ORDER BY p.points DESC, discoveries_count DESC;

-- Grant access to leaderboard view
GRANT SELECT ON leaderboard TO anon, authenticated;

-- Create function to update points when discovery is made
CREATE OR REPLACE FUNCTION increment_user_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Add 10 points for each new discovery
  UPDATE profiles
  SET points = points + 10
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-increment points on discovery
DROP TRIGGER IF EXISTS on_discovery_add_points ON user_discoveries;
CREATE TRIGGER on_discovery_add_points
  AFTER INSERT ON user_discoveries
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_points();

-- Add index for better leaderboard performance
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
