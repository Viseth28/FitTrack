-- 1. Add new columns to profiles table
alter table public.profiles 
add column if not exists weight numeric,
add column if not exists height numeric,
add column if not exists birth_date date;

-- 2. Update the handle_new_user function to include new fields
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url, weight, height, birth_date)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url',
    (new.raw_user_meta_data->>'weight')::numeric,
    (new.raw_user_meta_data->>'height')::numeric,
    (new.raw_user_meta_data->>'birth_date')::date
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    username = excluded.username,
    weight = excluded.weight,
    height = excluded.height,
    birth_date = excluded.birth_date;
  return new;
end;
$$ language plpgsql security definer;
