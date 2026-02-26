-- 1. Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS height numeric,
ADD COLUMN IF NOT EXISTS birth_date date;

-- 2. Update the handle_new_user function to be robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url, weight, height, birth_date)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN new.raw_user_meta_data->>'weight' = '' THEN NULL 
      ELSE (new.raw_user_meta_data->>'weight')::numeric 
    END,
    CASE 
      WHEN new.raw_user_meta_data->>'height' = '' THEN NULL 
      ELSE (new.raw_user_meta_data->>'height')::numeric 
    END,
    CASE 
      WHEN new.raw_user_meta_data->>'birth_date' = '' THEN NULL 
      ELSE (new.raw_user_meta_data->>'birth_date')::date 
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = excluded.full_name,
    username = excluded.username,
    avatar_url = excluded.avatar_url,
    weight = excluded.weight,
    height = excluded.height,
    birth_date = excluded.birth_date;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Grant permissions just in case
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.profiles TO service_role;
