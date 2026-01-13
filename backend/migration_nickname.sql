-- Add nickname column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Optional: Make nickname unique if desired, but might be annoying for users if common names are taken. 
-- For now, keep it simple.

-- Add a check to ensure nickname is not empty if provided (though on update we control this via app logic)
-- CONSTRAINT check_nickname_length CHECK (char_length(nickname) >= 2)
