-- Create personas table
CREATE TABLE IF NOT EXISTS public.personas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for personas
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personas"
  ON personas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personas"
  ON personas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personas"
  ON personas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personas"
  ON personas FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS personas_user_id_idx ON personas(user_id); 