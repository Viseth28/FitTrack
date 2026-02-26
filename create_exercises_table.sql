-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  subtype text,
  duration numeric NOT NULL, -- in minutes
  calories numeric NOT NULL, -- estimated
  distance numeric, -- in meters
  route jsonb, -- array of { lat, lng, timestamp }
  date date NOT NULL, -- YYYY-MM-DD
  timestamp bigint NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own exercises" 
  ON public.exercises FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises" 
  ON public.exercises FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises" 
  ON public.exercises FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises" 
  ON public.exercises FOR DELETE 
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.exercises TO postgres;
GRANT ALL ON public.exercises TO service_role;
