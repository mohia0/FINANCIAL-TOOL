-- Add inputs_locked column to user_settings table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE user_settings 
ADD COLUMN inputs_locked BOOLEAN DEFAULT FALSE;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN user_settings.inputs_locked IS 'Tracks whether user has locked all inputs in the application';

-- Optional: Create an index for better performance (if needed)
-- CREATE INDEX idx_user_settings_inputs_locked ON user_settings(inputs_locked);
